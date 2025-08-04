@echo off
echo Starting backend for mobile access...
cd backend
echo.
echo Backend will be accessible at:
echo - http://192.168.1.20:8000
echo - http://localhost:8000
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause