@echo off
title SQLAcc Web - Jalankan Sistem
color 0B
echo.
echo ============================================
echo   SQLAcc Web - Memulakan Sistem
echo ============================================
echo.

:: Mulakan Backend dulu
echo [1/2] Memulakan Backend (port 5000)...
start "SQLAcc BACKEND - Jangan Tutup!" cmd /k "cd /d "%~dp0backend" && echo Backend sedang dimuatkan... && node src/server.js"

:: Tunggu backend bersedia (5 saat)
echo Menunggu backend bersedia (5 saat)...
timeout /t 5 /nobreak >nul

:: Check sama ada backend berjalan
echo Mengesahkan backend...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo AMARAN: Backend mungkin belum bersedia.
    echo Tunggu lagi 5 saat...
    timeout /t 5 /nobreak >nul
)

:: Mulakan Frontend
echo [2/2] Memulakan Frontend (port 3000)...
start "SQLAcc FRONTEND - Jangan Tutup!" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ============================================
echo   Sistem sedang dimulakan!
echo.
echo   Browser akan terbuka dalam ~30 saat.
echo   Jika tidak terbuka, pergi ke:
echo   http://localhost:3000
echo.
echo   Log masuk:
echo   Username : admin
echo   Password : admin123
echo.
echo   PENTING: Jangan tutup 2 tetingkap CMD
echo   yang bertanda "BACKEND" dan "FRONTEND"
echo ============================================
echo.
pause
