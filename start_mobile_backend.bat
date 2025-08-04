@echo off
echo Starting backend for mobile connection...
echo.

cd /d "D:\College\Courses\Smart_Expense_Tracker\backend"
echo Current directory: %CD%

if not exist "app\main.py" (
    echo ERROR: Backend files not found!
    echo Looking for: %CD%\app\main.py
    dir app
    pause
    exit /b 1
)

echo Backend will be accessible at:
echo - http://192.168.1.20:8000
echo - http://localhost:8000
echo.
echo Starting server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause