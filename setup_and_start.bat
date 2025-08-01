@echo off
echo ========================================
echo Smart Expense Tracker Setup & Start
echo ========================================

echo.
echo 1. Initializing database...
cd backend
python init_db.py

echo.
echo 2. Creating demo user...
python create_demo_user.py

echo.
echo 3. Starting backend server...
echo Backend will start on http://127.0.0.1:8000
start "Backend Server" cmd /k "python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo.
echo 4. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 5. Starting frontend server...
echo Frontend will start on http://localhost:3000
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Demo Login:
echo Email: demo@example.com
echo Password: demo123
echo ========================================
pause