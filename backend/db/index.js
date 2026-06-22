const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Berjaya sambung ke database');
});

pool.on('error', (err) => {
  console.error('Ralat database:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
