import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/maintenance - List repair & maintenance records
router.get('/', async (req, res) => {
  try {
    const { asset_id, status } = req.query;
    let query = `
      SELECT m.*, a.name as asset_name, a.category as asset_category, a.location_room
      FROM maintenance_records m
      JOIN assets a ON m.asset_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (asset_id) {
      params.push(asset_id);
      query += ` AND m.asset_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND m.status = $${params.length}`;
    }

    query += ' ORDER BY m.service_date DESC, m.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching maintenance records:', err);
    res.status(500).json({ message: 'Failed to fetch maintenance records' });
  }
});

// POST /api/maintenance - Log repair request or service record
router.post('/', async (req, res) => {
  try {
    const {
      asset_id,
      title,
      description,
      service_type,
      status,
      reported_date,
      service_date,
      service_provider_name,
      service_provider_contact,
      technician_notes,
      labor_cost,
      parts_cost,
    } = req.body;

    if (!asset_id || !title) {
      return res.status(400).json({ message: 'Asset ID and title are required' });
    }

    let userId = req.user?.id;
    if (!userId) {
      const userRes = await pool.query('SELECT id FROM users LIMIT 1');
      userId = userRes.rows[0]?.id;
    }

    const insertRes = await pool.query(
      `INSERT INTO maintenance_records 
       (user_id, asset_id, title, description, service_type, status, reported_date, service_date, service_provider_name, service_provider_contact, technician_notes, labor_cost, parts_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        userId,
        asset_id,
        title,
        description || null,
        service_type || 'Repair',
        status || 'Reported',
        reported_date || new Date().toISOString().split('T')[0],
        service_date || null,
        service_provider_name || 'Independent Specialist',
        service_provider_contact || null,
        technician_notes || null,
        labor_cost ? Number(labor_cost) : 0.0,
        parts_cost ? Number(parts_cost) : 0.0,
      ]
    );

    const record = insertRes.rows[0];
    const totalCost = Number(record.total_cost || 0);

    // Automatically record event in Smart Timeline
    await pool.query(
      `INSERT INTO activity_logs (user_id, asset_id, event_type, description, cost_impact)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        asset_id,
        'Service_Logged',
        `${service_type || 'Service'}: "${title}" by ${service_provider_name || 'Technician'} (${status || 'Reported'})`,
        totalCost,
      ]
    );

    res.status(201).json(record);
  } catch (err) {
    console.error('Error logging maintenance record:', err);
    res.status(500).json({ message: 'Failed to log maintenance record' });
  }
});

// PUT /api/maintenance/:id - Update status, technician notes, or final costs
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      service_type,
      service_provider_name,
      status,
      service_date,
      technician_notes,
      labor_cost,
      parts_cost,
    } = req.body;

    const result = await pool.query(
      `UPDATE maintenance_records
       SET title = COALESCE($1, title),
           service_type = COALESCE($2, service_type),
           service_provider_name = COALESCE($3, service_provider_name),
           status = COALESCE($4, status),
           service_date = COALESCE($5, service_date),
           technician_notes = COALESCE($6, technician_notes),
           labor_cost = COALESCE($7, labor_cost),
           parts_cost = COALESCE($8, parts_cost),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        title ?? null,
        service_type ?? null,
        service_provider_name ?? null,
        status ?? null,
        service_date ?? null,
        technician_notes ?? null,
        labor_cost !== undefined && labor_cost !== '' ? Number(labor_cost) : null,
        parts_cost !== undefined && parts_cost !== '' ? Number(parts_cost) : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating maintenance record:', err);
    res.status(500).json({ message: 'Failed to update maintenance record' });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM maintenance_records WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    res.json({ message: 'Maintenance record deleted successfully', id });
  } catch (err) {
    console.error('Error deleting maintenance record:', err);
    res.status(500).json({ message: 'Failed to delete maintenance record' });
  }
});

export default router;

