@echo off
echo Adding Windows Firewall rule for mobile backend access...
echo.
echo This requires Administrator privileges.
echo Right-click this file and select "Run as administrator"
echo.
netsh advfirewall firewall add rule name="Python Backend Mobile" dir=in action=allow protocol=TCP localport=8000
echo.
echo Firewall rule added successfully!
echo Your mobile app should now be able to connect to the backend.
echo.
pause