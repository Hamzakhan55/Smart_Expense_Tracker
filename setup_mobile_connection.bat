@echo off
echo Setting up mobile backend connection...
echo.

echo Step 1: Adding Windows Firewall rule...
netsh advfirewall firewall delete rule name="Python Backend Mobile" >nul 2>&1
netsh advfirewall firewall add rule name="Python Backend Mobile" dir=in action=allow protocol=TCP localport=8000

if %errorlevel% neq 0 (
    echo ERROR: Failed to add firewall rule. Please run as Administrator.
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo ✅ Firewall rule added successfully!
echo.

echo Step 2: Starting backend server...
cd /d "%~dp0backend"
echo Backend accessible at: http://192.168.1.20:8000
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000