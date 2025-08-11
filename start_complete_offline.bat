@echo off
echo 🏠 Starting Complete Offline System
echo ==================================

echo 🔧 Starting Backend...
start "Backend" cmd /k "cd /d %~dp0\backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo 🌐 Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo ✅ System starting...
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8000
echo.
echo Press any key to close all...
pause >nul

taskkill /f /im node.exe 2>nul
taskkill /f /im python.exe 2>nul