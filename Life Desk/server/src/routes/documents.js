import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/documents - List documents with asset details
router.get('/', async (req, res) => {
  try {
    const { asset_id, document_type } = req.query;
    let query = `
      SELECT d.*, a.name as asset_name, a.category as asset_category
      FROM documents d
      LEFT JOIN assets a ON d.asset_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (asset_id) {
      params.push(asset_id);
      query += ` AND d.asset_id = $${params.length}`;
    }

    if (document_type) {
      params.push(document_type);
      query += ` AND d.document_type = $${params.length}`;
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// POST /api/documents - Upload / Register new document
router.post('/', async (req, res) => {
  try {
    const {
      asset_id,
      title,
      document_type,
      file_name,
      file_url,
      file_size,
      mime_type,
      expiry_date,
    } = req.body;

    if (!title || !document_type) {
      return res.status(400).json({ message: 'Title and document type are required' });
    }

    let userId = req.user?.id;
    if (!userId) {
      const userRes = await pool.query('SELECT id FROM users LIMIT 1');
      userId = userRes.rows[0]?.id;
    }

    const insertRes = await pool.query(
      `INSERT INTO documents 
       (user_id, asset_id, title, document_type, file_name, file_url, file_size, mime_type, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        asset_id || null,
        title,
        document_type,
        file_name || `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        file_url || '/uploads/sample.pdf',
        file_size || 1024000,
        mime_type || 'application/pdf',
        expiry_date || null,
      ]
    );

    const doc = insertRes.rows[0];

    // Log to Smart Timeline if tied to an asset
    if (asset_id) {
      await pool.query(
        `INSERT INTO activity_logs (user_id, asset_id, event_type, description, cost_impact)
         VALUES ($1, $2, $3, $4, 0.00)`,
        [userId, asset_id, 'Doc_Uploaded', `Attached ${document_type.replace('_', ' ')}: "${title}"`]
      );
    }

    res.status(201).json(doc);
  } catch (err) {
    console.error('Error registering document:', err);
    res.status(500).json({ message: 'Failed to register document' });
  }
});

// DELETE /api/documents/:id
// PUT /api/documents/:id - Update document metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, document_type, asset_id, expiry_date } = req.body;

    const result = await pool.query(
      `UPDATE documents
       SET title = COALESCE($1, title),
           document_type = COALESCE($2, document_type),
           asset_id = $3,
           expiry_date = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [
        title ?? null,
        document_type ?? null,
        asset_id || null,
        expiry_date || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ message: 'Failed to update document' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully', id });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

export default router;

