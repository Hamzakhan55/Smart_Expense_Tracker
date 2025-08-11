@echo off
echo Setting up Mobile Voice Recording...
echo.

cd /d "D:\College\Courses\Smart_Expense_Tracker"

echo 1. Testing backend connection...
python test_voice_mobile.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend test failed. Starting backend...
    start "Backend Server" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo Waiting for backend to start...
    timeout /t 10 /nobreak > nul
)

echo.
echo 2. Checking mobile app dependencies...
cd Smart_Expense_Tracker_Mobile
if not exist node_modules (
    echo Installing mobile dependencies...
    npm install
)

echo.
echo 3. Voice recording setup complete!
echo.
echo Mobile app voice features:
echo - Hold and release FAB button to record
echo - Recording popup with visual feedback
echo - AI processing with backend integration
echo - Fallback to text input if needed
echo.
echo Backend endpoints:
echo - http://localhost:8000/process-voice-dry-run/
echo - http://192.168.1.22:8000/process-voice-dry-run/
echo.
echo To start mobile app:
echo   cd Smart_Expense_Tracker_Mobile
echo   npm start
echo.
pause