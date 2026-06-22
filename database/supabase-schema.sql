-- SQLACC Web Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Company table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(255) NOT NULL,
  alamat TEXT,
  telefon VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default company
INSERT INTO companies (id, nama) VALUES 
('00000000-0000-0000-0000-000000000001', 'Syarikat Saya')
ON CONFLICT (id) DO NOTHING;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, company_id, username, full_name, email, password_hash, role) VALUES
(
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'Administrator',
  'admin@sqlacc.com',
  '$2a$10$Zurle3K9RUomBXJDz6RVxOU3IS5PgAhmfhz.ayPksgAr3cd4vgEMS',
  'admin'
)
ON CONFLICT (username) DO NOTHING;

-- Pelanggan (Customer) table
CREATE TABLE IF NOT EXISTS pelanggan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  nama VARCHAR(255) NOT NULL,
  telefon VARCHAR(20),
  email VARCHAR(255),
  alamat TEXT,
  syarikat VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invois (Invoice) table
CREATE TABLE IF NOT EXISTS invois (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  no_invois VARCHAR(50) NOT NULL,
  pelanggan_id UUID REFERENCES pelanggan(id),
  tarikh TIMESTAMP DEFAULT NOW(),
  tarikh_luput TIMESTAMP,
  jumlah DECIMAL(15,2) DEFAULT 0,
  jumlah_bayar DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'bayar_separa', 'sudah_bayar', 'batal')),
  catatan TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invois items table
CREATE TABLE IF NOT EXISTS invois_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invois_id UUID REFERENCES invois(id) ON DELETE CASCADE,
  perihal VARCHAR(500) NOT NULL,
  kuantiti DECIMAL(10,2) DEFAULT 1,
  harga DECIMAL(15,2) DEFAULT 0,
  jumlah DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pembayaran (Payment) table
CREATE TABLE IF NOT EXISTS pembayaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  invois_id UUID REFERENCES invois(id),
  jumlah DECIMAL(15,2) NOT NULL,
  kaedah VARCHAR(50) DEFAULT 'tunai' CHECK (kaedah IN ('tunai', 'bank', 'online', 'kad', 'lain')),
  tarikh TIMESTAMP DEFAULT NOW(),
  rujukan VARCHAR(255),
  catatan TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_pelanggan_company ON pelanggan(company_id);
CREATE INDEX IF NOT EXISTS idx_invois_company ON invois(company_id);
CREATE INDEX IF NOT EXISTS idx_invois_pelanggan ON invois(pelanggan_id);
CREATE INDEX IF NOT EXISTS idx_invois_item_invois ON invois_item(invois_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_company ON pembayaran(company_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_invois ON pembayaran(invois_id);

-- Row Level Security (RLS) - optional for Supabase
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invois ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invois_item ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;
