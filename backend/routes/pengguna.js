const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/pengguna - Admin only
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, full_name, email, role, is_active, created_at FROM users WHERE company_id = $1 ORDER BY created_at ASC',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pengguna error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// POST /api/pengguna - Tambah pengguna baru (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, full_name, email, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password diperlukan' });
    }
    
    const existing = await db.query('SELECT id FROM users WHERE username = $1', [username.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const result = await db.query(
      `INSERT INTO users (company_id, username, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, full_name, email, role, is_active`,
      [req.user.company_id, username.toLowerCase(), full_name, email, password_hash, role || 'user']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add pengguna error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// PUT /api/pengguna/:id - Kemaskini pengguna
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { full_name, email, role, is_active, password } = req.body;
    
    let query = 'UPDATE users SET full_name=$1, email=$2, role=$3, is_active=$4, updated_at=NOW()';
    let params = [full_name, email, role, is_active];
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      query += `, password_hash=$${params.length+1}`;
      params.push(password_hash);
    }
    
    query += ` WHERE id=$${params.length+1} AND company_id=$${params.length+2} RETURNING id, username, full_name, email, role, is_active`;
    params.push(req.params.id, req.user.company_id);
    
    const result = await db.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pengguna tidak ditemui' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// DELETE /api/pengguna/:id
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Tidak boleh padam akaun sendiri' });
    }
    const result = await db.query(
      'DELETE FROM users WHERE id=$1 AND company_id=$2 RETURNING *',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pengguna tidak ditemui' });
    res.json({ message: 'Pengguna berjaya dipadam' });
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// PUT /api/pengguna/tukar-password - Change own password
router.put('/tukar-password', authMiddleware, async (req, res) => {
  try {
    const { password_lama, password_baru } = req.body;
    
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const validOld = await bcrypt.compare(password_lama, result.rows[0].password_hash);
    
    if (!validOld) return res.status(400).json({ error: 'Password lama tidak betul' });
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password_baru, salt);
    
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [password_hash, req.user.id]);
    res.json({ message: 'Password berjaya ditukar' });
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

module.exports = router;
