@echo off
echo 🚀 Starting Optimized Smart Expense Tracker Backend
echo ================================================

cd /d "%~dp0\backend"

echo 📦 Activating virtual environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo ⚠️ Virtual environment not found, using system Python
)

echo 🔧 Installing/updating dependencies...
pip install -q fastapi uvicorn python-multipart

echo 🎯 Starting optimized server...
python start_optimized.py

pause