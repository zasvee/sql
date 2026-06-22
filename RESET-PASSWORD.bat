@echo off
title Reset Password Admin
color 0E
echo.
echo ============================================
echo   Reset Password Admin ke "admin123"
echo ============================================
echo.
cd /d "%~dp0backend"
node -e "
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataPath = path.join(__dirname, 'data', 'users.json');
if (!fs.existsSync(dataPath)) {
  console.log('RALAT: Fail users.json tidak wujud. Jalankan setup dahulu.');
  process.exit(1);
}

const hash = bcrypt.hashSync('admin123', 10);
const users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const idx = users.findIndex(u => u.username === 'admin');
if (idx === -1) {
  console.log('RALAT: User admin tidak dijumpai.');
  process.exit(1);
}
users[idx].password_hash = hash;
fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
console.log('Password admin berjaya ditetapkan semula ke: admin123');
"
echo.
echo   Sekarang boleh log masuk dengan:
echo   Username : admin
echo   Password : admin123
echo.
pause
