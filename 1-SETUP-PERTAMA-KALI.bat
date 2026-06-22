@echo off
title SQLAcc Web - Setup Pertama Kali
color 0A
echo.
echo ============================================
echo   SQLAcc Web - Setup Pertama Kali
echo ============================================
echo.

echo [1/3] Memasang pakej Backend...
echo (Hanya 5 pakej kecil - express, jwt, bcrypt, cors, uuid)
echo.
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo.
    echo RALAT semasa install!
    echo Cuba jalankan: npm install --registry https://registry.npmjs.org
    echo.
    pause
    exit /b 1
)
echo.
echo    Backend pakej berjaya dipasang!

echo.
echo [2/3] Menyediakan data awal...
node src/config/init-db.js
if errorlevel 1 (
    echo RALAT: Data awal gagal dibuat!
    pause
    exit /b 1
)

echo.
echo [3/3] Memasang pakej Frontend...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo.
    echo RALAT semasa install frontend!
    echo Cuba: npm install --legacy-peer-deps
    echo.
    pause
    exit /b 1
)
echo    Frontend pakej berjaya dipasang!

echo.
echo ============================================
echo   Setup selesai! Sila jalankan:
echo   2-JALANKAN-SISTEM.bat
echo ============================================
echo.
pause
