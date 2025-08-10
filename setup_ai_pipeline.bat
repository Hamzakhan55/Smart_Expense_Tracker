@echo off
echo ========================================
echo Smart Expense Tracker AI Pipeline Setup
echo ========================================
echo.

cd backend

echo 1. Checking system requirements...
python setup_ai_pipeline.py
echo.

echo 2. Installing dependencies...
pip install -r requirements_complete.txt
echo.

echo 3. Testing AI pipeline...
python test_complete_pipeline.py
echo.

echo 4. Setup complete!
echo.
echo Next steps:
echo - If models are missing, download them to backend/models/
echo - Start backend: python -m uvicorn app.main:app --reload
echo - Test frontend voice recorder
echo.
pause