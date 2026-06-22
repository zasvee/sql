const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/pembayaran
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT pb.*, i.no_invois, p.nama as pelanggan_nama
       FROM pembayaran pb
       LEFT JOIN invois i ON pb.invois_id = i.id
       LEFT JOIN pelanggan p ON i.pelanggan_id = p.id
       WHERE pb.company_id = $1
       ORDER BY pb.tarikh DESC`,
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pembayaran error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// POST /api/pembayaran
router.post('/', authMiddleware, async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    const { invois_id, jumlah, kaedah, tarikh, rujukan, catatan } = req.body;
    if (!invois_id || !jumlah) {
      return res.status(400).json({ error: 'Invois dan jumlah diperlukan' });
    }
    
    const pembayaranResult = await client.query(
      `INSERT INTO pembayaran (company_id, invois_id, jumlah, kaedah, tarikh, rujukan, catatan)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.company_id, invois_id, jumlah, kaedah || 'tunai', tarikh || new Date(), rujukan, catatan]
    );
    
    const invoisResult = await client.query(
      'SELECT * FROM invois WHERE id = $1',
      [invois_id]
    );
    
    if (invoisResult.rows.length > 0) {
      const invois = invoisResult.rows[0];
      const totalBayar = parseFloat(invois.jumlah_bayar || 0) + parseFloat(jumlah);
      
      let status = 'belum_bayar';
      if (totalBayar >= parseFloat(invois.jumlah)) {
        status = 'sudah_bayar';
      } else if (totalBayar > 0) {
        status = 'bayar_separa';
      }
      
      await client.query(
        'UPDATE invois SET jumlah_bayar=$1, status=$2, updated_at=NOW() WHERE id=$3',
        [totalBayar, status, invois_id]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(pembayaranResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add pembayaran error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  } finally {
    client.release();
  }
});

// DELETE /api/pembayaran/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM pembayaran WHERE id=$1 AND company_id=$2 RETURNING *',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pembayaran tidak ditemui' });
    res.json({ message: 'Pembayaran berjaya dipadam' });
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

module.exports = router;
