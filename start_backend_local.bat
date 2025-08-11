@echo off
echo 🏠 Starting LOCAL-ONLY Smart Expense Tracker Backend
echo ================================================
echo 🎤 Using: Whisper Large V3 (Local)
echo 🏷️ Using: DistilBERT (Local)
echo 🚫 No online APIs used
echo ================================================

cd /d "%~dp0\backend"

echo 📦 Activating virtual environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo ⚠️ Virtual environment not found, using system Python
)

echo 🔧 Installing dependencies...
pip install -q torch transformers librosa

echo 🏠 Starting local-only server...
python -c "
import uvicorn
from app.main import app
print('🚀 Server starting at http://localhost:8000')
print('📊 Status: http://localhost:8000/ai-status')
uvicorn.run(app, host='0.0.0.0', port=8000, reload=False, access_log=False)
"

pause