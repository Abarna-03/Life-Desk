import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications ORDER BY due_date ASC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

export default router;

