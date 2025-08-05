@echo off
title Smart Expense Tracker

echo Getting IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4" ^| findstr "192.168"') do (
    for /f "tokens=1" %%b in ("%%a") do set IP=%%b
)

echo Configuring firewall...
netsh advfirewall firewall delete rule name="Smart Expense Tracker" >nul 2>&1
netsh advfirewall firewall add rule name="Smart Expense Tracker" dir=in action=allow protocol=TCP localport=8000 >nul

echo Creating frontend config...
echo NEXT_PUBLIC_API_URL=http://%IP%:8000 > frontend\.env.local

echo Starting backend at http://%IP%:8000
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000