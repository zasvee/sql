# 🌐 Panduan Letak SQLAcc Web Online
### Untuk 3-5 Pengguna | Percuma | Tanpa Pengalaman Coding

---

## ✅ Apa Yang Diperlukan
- Akaun Gmail (untuk daftar semua servis)
- Fail projek SQLAcc Web (dalam folder ini)
- Masa: kira-kira 30-45 minit

---

## BAHAGIAN 1 — DAFTAR 4 AKAUN (10 minit)

### 1. GitHub (simpan kod)
1. Pergi ke **github.com**
2. Klik **Sign up**
3. Isi email, password, username
4. Sahkan email

### 2. Supabase (database)
1. Pergi ke **supabase.com**
2. Klik **Start your project**
3. Log masuk dengan GitHub (lebih mudah)

### 3. Railway (jalankan backend)
1. Pergi ke **railway.app**
2. Klik **Login** → pilih **GitHub**

### 4. Vercel (papar frontend)
1. Pergi ke **vercel.com**
2. Klik **Sign Up** → pilih **Continue with GitHub**

---

## BAHAGIAN 2 — SETUP SUPABASE DATABASE (10 minit)

1. Log masuk **supabase.com**
2. Klik **New Project**
3. Isi:
   - **Name**: sqlacc-web
   - **Database Password**: [pilih password kuat, SIMPAN ini!]
   - **Region**: Southeast Asia (Singapore)
4. Klik **Create new project** — tunggu 2 minit
5. Selepas siap, klik menu **SQL Editor** (ikon di sebelah kiri)
6. Klik **New query**
7. Buka fail `database/supabase-schema.sql` dalam folder projek ini
8. **Salin SEMUA teks** dalam fail itu
9. **Tampal** dalam kotak SQL Editor
10. Klik butang **Run** (▶)
11. Sepatutnya nampak "Success"

### Dapatkan URL Database:
1. Klik **Settings** (ikon gear di bawah kiri)
2. Klik **Database**
3. Scroll ke bawah ke **Connection string**
4. Pilih **URI**
5. **Salin** URL itu (bermula dengan `postgresql://...`)
6. **Ganti `[YOUR-PASSWORD]`** dengan password yang anda buat tadi
7. **Simpan URL ini** — akan digunakan dalam langkah seterusnya

---

## BAHAGIAN 3 — UPLOAD KOD KE GITHUB (5 minit)

1. Pergi ke **github.com**
2. Klik **+** di atas kanan → **New repository**
3. **Repository name**: sqlacc-web
4. Pilih **Private** (supaya kod tidak nampak oleh orang lain)
5. Klik **Create repository**
6. GitHub akan tunjuk arahan. Kita gunakan cara mudah:

### Upload fail terus:
1. Klik **uploading an existing file**
2. Seret folder `sqlacc-web` ke dalam kotak upload
   - **PENTING**: Jangan upload folder `node_modules` — ia besar dan tidak diperlukan
3. Klik **Commit changes**

---

## BAHAGIAN 4 — DEPLOY BACKEND KE RAILWAY (10 minit)

1. Log masuk **railway.app**
2. Klik **New Project**
3. Klik **Deploy from GitHub repo**
4. Pilih **sqlacc-web**
5. Railway akan tanya folder — pilih **backend**
6. Selepas deploy, klik tab **Variables**
7. Klik **New Variable** dan tambah:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | [URL Supabase yang anda salin tadi] |
| `JWT_SECRET` | [taip sebarang teks panjang, contoh: `sqlacc2024rahsiakita`] |
| `NODE_ENV` | `production` |

8. Railway akan restart backend secara automatik
9. Klik tab **Settings** → salin **Domain** anda (contoh: `sqlacc-backend.railway.app`)
10. **Simpan domain ini** — akan digunakan untuk frontend

---

## BAHAGIAN 5 — DEPLOY FRONTEND KE VERCEL (5 minit)

1. Log masuk **vercel.com**
2. Klik **Add New** → **Project**
3. Import dari GitHub → pilih **sqlacc-web**
4. **Root Directory**: tukar kepada `frontend`
5. Klik **Environment Variables** dan tambah:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://[domain-railway-anda]/api` |

   Contoh: `https://sqlacc-backend.railway.app/api`

6. Klik **Deploy**
7. Tunggu 2-3 minit
8. Vercel akan bagi **URL** anda (contoh: `sqlacc-web.vercel.app`)

---

## ✅ SIAP! Sistem Anda Online

- **URL Sistem**: https://sqlacc-web.vercel.app (atau URL Vercel anda)
- **Username**: admin
- **Password**: admin123

### Kongsi dengan pekerja:
Hantar URL Vercel kepada semua pekerja. Mereka boleh akses dari mana-mana browser, telefon, atau komputer.

---

## 🔧 Tambah Pengguna Baru

Untuk tambah akaun pekerja:
1. Log masuk Supabase
2. Buka **SQL Editor**
3. Jalankan query ini (ganti nama dan password):

```sql
INSERT INTO users (id, company_id, username, full_name, email, password_hash, role)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'pekerja1',         -- username (ubah ini)
  'Nama Pekerja',     -- nama penuh (ubah ini)
  'email@syarikat.com',
  '$2a$10$Zurle3K9RUomBXJDz6RVxOU3IS5PgAhmfhz.ayPksgAr3cd4vgEMS',  -- password: admin123
  'user'
);
```

Password default adalah `admin123` — minta pekerja tukar selepas log masuk pertama.

---

## ❓ Masalah Biasa

**Backend tak berjalan di Railway:**
- Semak Variables — DATABASE_URL mesti betul
- Klik Deployments → tengok log error

**Login gagal:**
- Semak REACT_APP_API_URL dalam Vercel — mesti ada `/api` di hujung
- Pastikan Railway backend berjalan (status hijau)

**Data hilang:**
- Data disimpan dalam Supabase — tidak akan hilang selagi akaun aktif

---

*Jika ada masalah, hubungi Claude untuk bantuan lanjut.*
