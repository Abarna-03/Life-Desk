import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/timeline/:assetId - Complete chronological Smart Timeline & dynamic TCO
router.get('/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;

    // Verify asset exists
    const assetRes = await pool.query('SELECT * FROM assets WHERE id = $1', [assetId]);
    if (assetRes.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    const asset = assetRes.rows[0];

    // Fetch all related streams in parallel
    const [activitiesRes, maintRes, subsRes, docsRes] = await Promise.all([
      pool.query('SELECT * FROM activity_logs WHERE asset_id = $1 ORDER BY created_at ASC', [assetId]),
      pool.query('SELECT * FROM maintenance_records WHERE asset_id = $1 ORDER BY service_date ASC', [assetId]),
      pool.query('SELECT * FROM subscriptions WHERE asset_id = $1 ORDER BY start_date ASC', [assetId]),
      pool.query('SELECT * FROM documents WHERE asset_id = $1 ORDER BY created_at ASC', [assetId]),
    ]);

    // Financial calculations
    const purchasePrice = Number(asset.purchase_price) || 0;
    const totalRepairs = maintRes.rows.reduce((sum, r) => sum + Number(r.total_cost || 0), 0);
    const totalRenewals = subsRes.rows.reduce((sum, s) => sum + Number(s.cost || 0), 0);
    const totalCostOfOwnership = purchasePrice + totalRepairs + totalRenewals;

    // Build unified chronological event stream
    const events = [];

    // 1. Purchase Event
    if (asset.purchase_date) {
      events.push({
        id: `purchase-${asset.id}`,
        date: asset.purchase_date,
        type: 'Purchase',
        badge_color: 'emerald',
        title: `Purchased & Registered: ${asset.name}`,
        description: `Acquired from ${asset.store_vendor || 'Vendor'} for $${purchasePrice.toLocaleString()}`,
        cost: purchasePrice,
      });
    }

    // 2. Warranty Expiry Milestone
    if (asset.warranty_expiry_date) {
      const isPast = new Date(asset.warranty_expiry_date) < new Date();
      events.push({
        id: `warranty-${asset.id}`,
        date: asset.warranty_expiry_date,
        type: 'Warranty',
        badge_color: isPast ? 'danger' : 'amber',
        title: isPast ? 'Warranty Expired' : 'Warranty Coverage Active Until',
        description: `Original manufacturer warranty threshold for ${asset.brand || asset.name}`,
        cost: 0,
      });
    }

    // 3. Document Vault Events
    docsRes.rows.forEach(d => {
      events.push({
        id: `doc-${d.id}`,
        date: d.created_at.toISOString().split('T')[0],
        type: 'Document',
        badge_color: 'blue',
        title: `Document Vaulted: ${d.title}`,
        description: `Type: ${d.document_type.replace('_', ' ')} (${d.file_name})`,
        cost: 0,
      });
    });

    // 4. Maintenance / Repair Events
    maintRes.rows.forEach(m => {
      const cost = Number(m.total_cost || 0);
      events.push({
        id: `maint-${m.id}`,
        date: m.service_date || m.reported_date,
        type: 'Repair',
        badge_color: 'purple',
        title: `${m.service_type}: ${m.title}`,
        description: `Provider: ${m.service_provider_name || 'N/A'} · Status: ${m.status}`,
        cost,
      });
    });

    // 5. Subscription & AMC Events
    subsRes.rows.forEach(s => {
      events.push({
        id: `sub-${s.id}`,
        date: s.start_date,
        type: 'Contract',
        badge_color: 'blue',
        title: `Protection Plan: ${s.name}`,
        description: `Billed ${s.billing_cycle.toLowerCase()} · Next: ${s.next_renewal_date}`,
        cost: Number(s.cost || 0),
      });
    });

    // Sort all events chronologically
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      asset: {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        brand: asset.brand,
        model_number: asset.model_number,
        serial_number: asset.serial_number,
        room: asset.location_room,
        purchase_price: purchasePrice,
        warranty_expiry_date: asset.warranty_expiry_date,
      },
      tco_summary: {
        purchase_price: purchasePrice,
        total_repairs: totalRepairs,
        total_renewals: totalRenewals,
        total_cost_of_ownership: totalCostOfOwnership,
      },
      timeline_events: events,
      raw_logs: activitiesRes.rows,
    });
  } catch (err) {
    console.error('Error generating timeline:', err);
    res.status(500).json({ message: 'Failed to generate Smart Timeline' });
  }
});

export default router;

