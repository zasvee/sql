const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const pelangganRoutes = require('./routes/pelanggan');
const invoisRoutes = require('./routes/invois');
const pembayaranRoutes = require('./routes/pembayaran');
const laporanRoutes = require('./routes/laporan');
const penggunaRoutes = require('./routes/pengguna');

app.use('/api/auth', authRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/invois', invoisRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/pengguna', penggunaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SQLACC API berjalan' });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'SQLACC Backend API', version: '1.0.0' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ralat pelayan dalaman' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});

module.exports = app;
