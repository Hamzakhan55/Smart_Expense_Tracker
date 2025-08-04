@echo off
echo Fixing network access for mobile backend...
echo.

echo Adding comprehensive firewall rules...
netsh advfirewall firewall delete rule name="Python Backend Mobile" >nul 2>&1
netsh advfirewall firewall delete rule name="Python Backend Inbound" >nul 2>&1
netsh advfirewall firewall delete rule name="Python Backend Outbound" >nul 2>&1

netsh advfirewall firewall add rule name="Python Backend Inbound" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="Python Backend Outbound" dir=out action=allow protocol=TCP localport=8000

echo.
echo Disabling Windows Defender Firewall temporarily for testing...
netsh advfirewall set allprofiles state off

echo.
echo ✅ Network access configured!
echo ⚠️  Windows Firewall is now DISABLED for testing.
echo ⚠️  Remember to re-enable it later with: netsh advfirewall set allprofiles state on
echo.

echo Testing connection...
curl -m 3 http://192.168.1.20:8000/health

echo.
pause