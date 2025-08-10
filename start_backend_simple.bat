@echo off
echo Starting Smart Expense Tracker Backend...
echo.

cd backend

echo 1. Checking backend...
python check_backend.py
echo.

echo 2. Installing dependencies...
pip install fastapi uvicorn sqlalchemy alembic python-multipart python-jose[cryptography] passlib[bcrypt]
echo.

echo 3. Starting server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause