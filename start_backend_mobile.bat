@echo off
echo Starting backend server for mobile development...

cd backend

echo Setting up demo data...
python create_demo_user.py
python add_sample_transactions.py

echo Starting FastAPI server on all interfaces...
python -c "import uvicorn; uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)"

pause