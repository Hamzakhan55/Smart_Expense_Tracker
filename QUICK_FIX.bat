@echo off
echo ========================================
echo Smart Expense Tracker - QUICK FIX
echo ========================================
echo.

echo 1. Installing dependencies...
cd backend
pip install fastapi uvicorn sqlalchemy pymysql python-multipart python-jose[cryptography] passlib[bcrypt] SpeechRecognition pydub librosa torch transformers scikit-learn==1.7.1
echo.

echo 2. Starting backend...
python start_fixed.py

pause