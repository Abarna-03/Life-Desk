import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to extract or fallback user_id (for dev convenience if testing without auth)
const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000000';
};

// GET /api/assets - List all assets with search and filtering
router.get('/', async (req, res) => {
  try {
    const { category, room, status, search } = req.query;
    let query = 'SELECT * FROM assets WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (room) {
      params.push(room);
      query += ` AND location_room = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR brand ILIKE $${params.length} OR model_number ILIKE $${params.length} OR serial_number ILIKE $${params.length} OR store_vendor ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ message: 'Failed to fetch assets' });
  }
});

// GET /api/assets/:id - Asset detail with linked documents, maintenance, subscriptions, and timeline
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const assetRes = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
    if (assetRes.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const asset = assetRes.rows[0];

    const [docsRes, subsRes, maintRes, logsRes] = await Promise.all([
      pool.query('SELECT * FROM documents WHERE asset_id = $1 ORDER BY created_at DESC', [id]),
      pool.query('SELECT * FROM subscriptions WHERE asset_id = $1 ORDER BY next_renewal_date ASC', [id]),
      pool.query('SELECT * FROM maintenance_records WHERE asset_id = $1 ORDER BY service_date DESC, created_at DESC', [id]),
      pool.query('SELECT * FROM activity_logs WHERE asset_id = $1 ORDER BY created_at ASC', [id]),
    ]);

    // Calculate Dynamic TCO (Total Cost of Ownership)
    const originalPrice = Number(asset.purchase_price) || 0;
    const maintenanceTotal = maintRes.rows.reduce((sum, r) => sum + Number(r.total_cost || 0), 0);
    const subscriptionsTotal = subsRes.rows.reduce((sum, s) => sum + Number(s.cost || 0), 0);
    const tco = originalPrice + maintenanceTotal + subscriptionsTotal;

    res.json({
      ...asset,
      documents: docsRes.rows,
      subscriptions: subsRes.rows,
      maintenance_records: maintRes.rows,
      timeline: logsRes.rows,
      financials: {
        original_price: originalPrice,
        maintenance_total: maintenanceTotal,
        subscriptions_total: subscriptionsTotal,
        total_cost_of_ownership: tco,
      },
    });
  } catch (err) {
    console.error('Error fetching asset detail:', err);
    res.status(500).json({ message: 'Failed to fetch asset detail' });
  }
});

// POST /api/assets - Create new asset
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      model_number,
      serial_number,
      purchase_date,
      purchase_price,
      store_vendor,
      location_room,
      warranty_expiry_date,
      status,
      notes,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Asset name and category are required' });
    }

    // Default demo user ID or authenticated user
    let userId = req.user?.id;
    if (!userId) {
      const userRes = await pool.query('SELECT id FROM users LIMIT 1');
      userId = userRes.rows[0]?.id;
    }

    if (!userId) {
      return res.status(400).json({ message: 'No registered user found in database' });
    }

    const insertRes = await pool.query(
      `INSERT INTO assets 
      (user_id, name, category, brand, model_number, serial_number, purchase_date, purchase_price, store_vendor, location_room, warranty_expiry_date, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        userId,
        name,
        category,
        brand || null,
        model_number || null,
        serial_number || null,
        purchase_date || null,
        purchase_price ? Number(purchase_price) : 0.0,
        store_vendor || null,
        location_room || 'Living Room',
        warranty_expiry_date || null,
        status || 'Active',
        notes || null,
      ]
    );

    const newAsset = insertRes.rows[0];

    // Automatically record milestone in Smart Timeline (activity_logs)
    await pool.query(
      `INSERT INTO activity_logs (user_id, asset_id, event_type, description, cost_impact)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        newAsset.id,
        'Asset_Created',
        `Registered "${newAsset.name}" in ${newAsset.location_room} (Vendor: ${newAsset.store_vendor || 'Not specified'})`,
        newAsset.purchase_price || 0.0,
      ]
    );

    res.status(201).json(newAsset);
  } catch (err) {
    console.error('Error creating asset:', err);
    res.status(500).json({ message: 'Failed to create asset' });
  }
});

// PUT /api/assets/:id - Update asset
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      brand,
      model_number,
      serial_number,
      purchase_date,
      purchase_price,
      store_vendor,
      location_room,
      warranty_expiry_date,
      status,
      notes,
    } = req.body;

    const updateRes = await pool.query(
      `UPDATE assets 
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           brand = COALESCE($3, brand),
           model_number = COALESCE($4, model_number),
           serial_number = COALESCE($5, serial_number),
           purchase_date = COALESCE($6, purchase_date),
           purchase_price = COALESCE($7, purchase_price),
           store_vendor = COALESCE($8, store_vendor),
           location_room = COALESCE($9, location_room),
           warranty_expiry_date = COALESCE($10, warranty_expiry_date),
           status = COALESCE($11, status),
           notes = COALESCE($12, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        name,
        category,
        brand,
        model_number,
        serial_number,
        purchase_date,
        purchase_price !== undefined ? Number(purchase_price) : undefined,
        store_vendor,
        location_room,
        warranty_expiry_date,
        status,
        notes,
        id,
      ]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(updateRes.rows[0]);
  } catch (err) {
    console.error('Error updating asset:', err);
    res.status(500).json({ message: 'Failed to update asset' });
  }
});

// DELETE /api/assets/:id - Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteRes = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING id', [id]);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully', id });
  } catch (err) {
    console.error('Error deleting asset:', err);
    res.status(500).json({ message: 'Failed to delete asset' });
  }
});

export default router;

