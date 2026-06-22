# SQLAcc Web - Cara Setup

## Keperluan
- Node.js v18+
- PostgreSQL 14+ (atau Docker)
- npm

---

## Cara 1: Guna Docker (Paling Mudah)

Pastikan Docker Desktop dipasang, kemudian:

```bash
cd sqlacc-web
docker-compose up -d
```

Sistem akan berjalan di:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

---

## Cara 2: Manual Setup

### 1. Setup Database

Pasang PostgreSQL, kemudian:

```bash
# Buat database
psql -U postgres -c "CREATE DATABASE sqlacc_web;"

# Jalankan schema
psql -U postgres -d sqlacc_web -f database/schema.sql
```

### 2. Setup Backend

```bash
cd backend

# Salin fail konfigurasi
copy .env.example .env

# Edit .env dan isi maklumat database + JWT secret
notepad .env

# Pasang pakej
npm install

# Buat akaun admin pertama (masukkan dalam psql):
# INSERT INTO companies (code, name) VALUES ('MYCO', 'Syarikat Saya Sdn Bhd');
# INSERT INTO users (company_id, username, email, password_hash, full_name, role)
# VALUES (
#   (SELECT id FROM companies WHERE code='MYCO'),
#   'admin', 'admin@syarikat.com',
#   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewqlWJdVtJUa1T0y',  -- password: admin123
#   'Administrator', 'admin'
# );

# Jalankan server
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend

# Pasang pakej
npm install

# Jalankan
npm start
```

Buka browser: http://localhost:3000

---

## Log Masuk Pertama

- **Username**: admin
- **Password**: admin123

> ⚠️ Tukar kata laluan selepas log masuk pertama!

---

## Struktur Folder

```
sqlacc-web/
├── backend/              ← Node.js + Express API
│   └── src/
│       ├── config/       ← Sambungan database
│       ├── controllers/  ← Logik perniagaan
│       ├── middleware/   ← Auth JWT
│       └── routes/       ← API endpoints
├── frontend/             ← React app
│   └── src/
│       ├── pages/        ← Halaman UI
│       │   ├── gl/       ← General Ledger
│       │   ├── ar/       ← Accounts Receivable
│       │   ├── ap/       ← Accounts Payable
│       │   └── stock/    ← Inventori
│       ├── components/   ← Komponen reusable
│       └── context/      ← Auth context
├── database/
│   └── schema.sql        ← Struktur database
└── docker-compose.yml    ← Docker setup
```

---

## API Endpoints

| Modul | Endpoint | Keterangan |
|-------|----------|------------|
| Auth | POST /api/auth/login | Log masuk |
| GL | GET /api/gl/accounts | Carta akaun |
| GL | GET /api/gl/journals | Jurnal |
| GL | GET /api/gl/reports/trial-balance | Imbangan duga |
| AR | GET /api/ar/customers | Senarai pelanggan |
| AR | GET /api/ar/invoices | Invois jualan |
| AR | GET /api/ar/reports/aging | Laporan aging |
| AP | GET /api/ap/suppliers | Senarai pembekal |
| AP | GET /api/ap/invoices | Invois belian |
| AP | GET /api/ap/reports/aging | Laporan aging |
| Stock | GET /api/stock/items | Item stok |
| Stock | GET /api/stock/reports/balance | Baki stok |
| Stock | GET /api/stock/reports/movements | Gerakan stok |

---

## Sokongan Bahasa

Sistem ini dalam Bahasa Melayu. Data boleh diisi dalam mana-mana bahasa.

## Modul Sedia Ada

✅ Dashboard ringkasan  
✅ GL - Carta Akaun  
✅ GL - Imbangan Duga  
✅ AR - Pelanggan  
✅ AR - Invois Jualan  
✅ AR - Laporan Aging  
✅ AP - Pembekal  
✅ AP - Laporan Aging  
✅ Stock - Item  
✅ Stock - Baki Stok  

🔜 Sedang dibangunkan:  
- Jurnal GL penuh  
- Resit / Pembayaran  
- Nota Penghantaran  
- Pesanan Jualan/Belian  
- Laporan Untung Rugi  
