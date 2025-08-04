@echo off
echo Testing mobile backend connection...
echo.

echo Testing health endpoint...
curl -m 5 http://192.168.1.20:8000/health
echo.

if %errorlevel% equ 0 (
    echo ✅ Backend is accessible from network!
    echo Your mobile app should now be able to connect.
) else (
    echo ❌ Backend is not accessible from network.
    echo Please check:
    echo 1. Backend is running
    echo 2. Windows Firewall allows port 8000
    echo 3. IP address is correct (192.168.1.20)
)

echo.
pause