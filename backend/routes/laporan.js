const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/laporan/ringkasan - Dashboard summary
router.get('/ringkasan', authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    
    const [pelangganCount, invoisStats, pembayaranTotal] = await Promise.all([
      db.query('SELECT COUNT(*) FROM pelanggan WHERE company_id = $1', [companyId]),
      db.query(`SELECT 
        COUNT(*) as jumlah_invois,
        SUM(jumlah) as jumlah_jualan,
        SUM(CASE WHEN status = 'sudah_bayar' THEN jumlah ELSE 0 END) as jumlah_terkumpul,
        SUM(CASE WHEN status IN ('belum_bayar', 'bayar_separa') THEN jumlah - COALESCE(jumlah_bayar, 0) ELSE 0 END) as jumlah_tertunggak
        FROM invois WHERE company_id = $1`, [companyId]),
      db.query('SELECT SUM(jumlah) as jumlah FROM pembayaran WHERE company_id = $1', [companyId])
    ]);
    
    res.json({
      jumlah_pelanggan: parseInt(pelangganCount.rows[0].count),
      jumlah_invois: parseInt(invoisStats.rows[0].jumlah_invois),
      jumlah_jualan: parseFloat(invoisStats.rows[0].jumlah_jualan) || 0,
      jumlah_terkumpul: parseFloat(invoisStats.rows[0].jumlah_terkumpul) || 0,
      jumlah_tertunggak: parseFloat(invoisStats.rows[0].jumlah_tertunggak) || 0,
      jumlah_pembayaran: parseFloat(pembayaranTotal.rows[0].jumlah) || 0
    });
  } catch (error) {
    console.error('Ringkasan error:', error);
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// GET /api/laporan/jualan - Sales report
router.get('/jualan', authMiddleware, async (req, res) => {
  try {
    const { dari, hingga } = req.query;
    let query = `SELECT i.*, p.nama as pelanggan_nama
                 FROM invois i
                 LEFT JOIN pelanggan p ON i.pelanggan_id = p.id
                 WHERE i.company_id = $1`;
    const params = [req.user.company_id];
    
    if (dari) { query += ` AND i.tarikh >= $${params.length+1}`; params.push(dari); }
    if (hingga) { query += ` AND i.tarikh <= $${params.length+1}`; params.push(hingga); }
    
    query += ' ORDER BY i.tarikh DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

// GET /api/laporan/invois-belum-bayar
router.get('/invois-belum-bayar', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, p.nama as pelanggan_nama, p.telefon as pelanggan_telefon
       FROM invois i
       LEFT JOIN pelanggan p ON i.pelanggan_id = p.id
       WHERE i.company_id = $1 AND i.status IN ('belum_bayar', 'bayar_separa')
       ORDER BY i.tarikh ASC`,
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

module.exports = router;
