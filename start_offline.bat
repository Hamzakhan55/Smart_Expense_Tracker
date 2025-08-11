@echo off
echo 🏠 FULLY OFFLINE Smart Expense Tracker
echo =====================================
echo 🎤 Whisper Large V3 (Your Local Model)
echo 🏷️ DistilBERT (Your Trained Model)  
echo 🚫 Zero Internet Dependencies
echo =====================================

cd /d "%~dp0\backend"

python -c "
import uvicorn
print('🚀 Starting fully offline server...')
print('📊 Status: http://localhost:8000/ai-status')
uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=False, access_log=False)
"

pause