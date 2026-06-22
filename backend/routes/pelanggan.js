const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/pelanggan - Dapatkan semua pelanggan
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM pelanggan WHERE company_id = $1';
    let params = [req.user.company_id];
    
    if (search) {
      query += ' AND (nama ILIKE $2 OR telefon ILIKE $2 OR email ILIKE $2)';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY nama ASC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get pelanggan error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// GET /api/pelanggan/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM pelanggan WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pelanggan tidak ditemui' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// POST /api/pelanggan - Tambah pelanggan baru
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nama, telefon, email, alamat, syarikat } = req.body;
    if (!nama) return res.status(400).json({ error: 'Nama pelanggan diperlukan' });
    
    const result = await db.query(
      `INSERT INTO pelanggan (company_id, nama, telefon, email, alamat, syarikat)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.company_id, nama, telefon, email, alamat, syarikat]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add pelanggan error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// PUT /api/pelanggan/:id - Kemaskini pelanggan
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nama, telefon, email, alamat, syarikat } = req.body;
    const result = await db.query(
      `UPDATE pelanggan SET nama=$1, telefon=$2, email=$3, alamat=$4, syarikat=$5, updated_at=NOW()
       WHERE id=$6 AND company_id=$7 RETURNING *`,
      [nama, telefon, email, alamat, syarikat, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pelanggan tidak ditemui' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// DELETE /api/pelanggan/:id - Padam pelanggan
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM pelanggan WHERE id=$1 AND company_id=$2 RETURNING *',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pelanggan tidak ditemui' });
    res.json({ message: 'Pelanggan berjaya dipadam' });
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

module.exports = router;
