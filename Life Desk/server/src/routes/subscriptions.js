import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/subscriptions - List subscriptions and upcoming renewals
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = `
      SELECT s.*, a.name as asset_name, a.category as asset_category
      FROM subscriptions s
      LEFT JOIN assets a ON s.asset_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND s.category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }

    query += ' ORDER BY s.next_renewal_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

// POST /api/subscriptions - Add recurring contract/subscription
router.post('/', async (req, res) => {
  try {
    const {
      asset_id,
      name,
      category,
      cost,
      billing_cycle,
      start_date,
      next_renewal_date,
      auto_renew,
      reminder_days_before,
      status,
    } = req.body;

    if (!name || !cost || !billing_cycle || !next_renewal_date) {
      return res.status(400).json({ message: 'Name, cost, billing cycle, and next renewal date are required' });
    }

    let userId = req.user?.id;
    if (!userId) {
      const userRes = await pool.query('SELECT id FROM users LIMIT 1');
      userId = userRes.rows[0]?.id;
    }

    const insertRes = await pool.query(
      `INSERT INTO subscriptions 
       (user_id, asset_id, name, category, cost, billing_cycle, start_date, next_renewal_date, auto_renew, reminder_days_before, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        userId,
        asset_id || null,
        name,
        category || 'Software',
        Number(cost),
        billing_cycle,
        start_date || new Date().toISOString().split('T')[0],
        next_renewal_date,
        auto_renew !== undefined ? auto_renew : true,
        reminder_days_before || 7,
        status || 'Active',
      ]
    );

    const sub = insertRes.rows[0];

    // Log to Smart Timeline if linked to an asset (e.g. Car insurance or AMC)
    if (asset_id) {
      await pool.query(
        `INSERT INTO activity_logs (user_id, asset_id, event_type, description, cost_impact)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, asset_id, 'Renewal_Paid', `Enrolled ${billing_cycle} contract "${name}"`, Number(cost)]
      );
    }

    res.status(201).json(sub);
  } catch (err) {
    console.error('Error adding subscription:', err);
    res.status(500).json({ message: 'Failed to add subscription' });
  }
});

// PUT /api/subscriptions/:id - Update subscription
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      cost,
      billing_cycle,
      next_renewal_date,
      auto_renew,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE subscriptions
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           cost = COALESCE($3, cost),
           billing_cycle = COALESCE($4, billing_cycle),
           next_renewal_date = COALESCE($5, next_renewal_date),
           auto_renew = COALESCE($6, auto_renew),
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        name,
        category,
        cost !== undefined ? Number(cost) : undefined,
        billing_cycle,
        next_renewal_date,
        auto_renew,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating subscription:', err);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

// DELETE /api/subscriptions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM subscriptions WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted successfully', id });
  } catch (err) {
    console.error('Error deleting subscription:', err);
    res.status(500).json({ message: 'Failed to delete subscription' });
  }
});

export default router;

