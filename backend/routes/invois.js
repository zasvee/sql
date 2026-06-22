const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/invois
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, pelanggan_id } = req.query;
    let query = `SELECT i.*, p.nama as pelanggan_nama 
                 FROM invois i 
                 LEFT JOIN pelanggan p ON i.pelanggan_id = p.id
                 WHERE i.company_id = $1`;
    let params = [req.user.company_id];
    
    if (status) { query += ` AND i.status = $${params.length+1}`; params.push(status); }
    if (pelanggan_id) { query += ` AND i.pelanggan_id = $${params.length+1}`; params.push(pelanggan_id); }
    
    query += ' ORDER BY i.tarikh DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get invois error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// GET /api/invois/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoisResult = await db.query(
      `SELECT i.*, p.nama as pelanggan_nama FROM invois i
       LEFT JOIN pelanggan p ON i.pelanggan_id = p.id
       WHERE i.id = $1 AND i.company_id = $2`,
      [req.params.id, req.user.company_id]
    );
    if (invoisResult.rows.length === 0) return res.status(404).json({ error: 'Invois tidak ditemui' });
    
    const itemsResult = await db.query(
      'SELECT * FROM invois_item WHERE invois_id = $1',
      [req.params.id]
    );
    
    res.json({ ...invoisResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// POST /api/invois
router.post('/', authMiddleware, async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    const { pelanggan_id, tarikh, tarikh_luput, catatan, items } = req.body;
    if (!pelanggan_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Pelanggan dan item diperlukan' });
    }
    
    const jumlah = items.reduce((sum, item) => sum + (item.kuantiti * item.harga), 0);
    
    const noInvois = 'INV-' + Date.now();
    
    const invoisResult = await client.query(
      `INSERT INTO invois (company_id, no_invois, pelanggan_id, tarikh, tarikh_luput, jumlah, catatan, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'belum_bayar') RETURNING *`,
      [req.user.company_id, noInvois, pelanggan_id, tarikh || new Date(), tarikh_luput, jumlah, catatan]
    );
    
    const invois = invoisResult.rows[0];
    
    for (const item of items) {
      await client.query(
        'INSERT INTO invois_item (invois_id, perihal, kuantiti, harga, jumlah) VALUES ($1, $2, $3, $4, $5)',
        [invois.id, item.perihal, item.kuantiti, item.harga, item.kuantiti * item.harga]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(invois);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add invois error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  } finally {
    client.release();
  }
});

// PUT /api/invois/:id/status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.query(
      'UPDATE invois SET status=$1, updated_at=NOW() WHERE id=$2 AND company_id=$3 RETURNING *',
      [status, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invois tidak ditemui' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// DELETE /api/invois/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM invois_item WHERE invois_id = $1', [req.params.id]);
    const result = await client.query(
      'DELETE FROM invois WHERE id=$1 AND company_id=$2 RETURNING *',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Invois tidak ditemui' }); }
    await client.query('COMMIT');
    res.json({ message: 'Invois berjaya dipadam' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Ralat pelayan' });
  } finally {
    client.release();
  }
});

module.exports = router;
