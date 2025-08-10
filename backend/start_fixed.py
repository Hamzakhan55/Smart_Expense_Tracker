#!/usr/bin/env python3
"""
Start backend with MySQL database
"""

import subprocess
import sys
import os
from pathlib import Path

def install_deps():
    """Install required dependencies"""
    deps = [
        "fastapi", "uvicorn[standard]", "sqlalchemy", "pymysql",
        "python-multipart", "python-jose[cryptography]", "passlib[bcrypt]",
        "SpeechRecognition", "pydub", "librosa", "torch", "transformers"
    ]
    
    for dep in deps:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep], 
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except:
            pass

def check_mysql():
    """Check MySQL connection"""
    try:
        import pymysql
        conn = pymysql.connect(
            host='localhost', port=3307, user='root', password='', 
            database='expense_tracker_db'
        )
        conn.close()
        print("✅ MySQL connected")
        return True
    except Exception as e:
        print(f"❌ MySQL error: {e}")
        print("Start XAMPP/WAMP MySQL service on port 3307")
        return False

def start_server():
    """Start the server"""
    print("🚀 Starting Smart Expense Tracker Backend...")
    print("📡 Server: http://127.0.0.1:8000")
    print("📡 API Docs: http://127.0.0.1:8000/docs")
    print("🛑 Press Ctrl+C to stop")
    print("=" * 50)
    
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    print("🔧 Backend Setup & Start")
    print("=" * 30)
    
    # Change to backend directory
    if not Path("app").exists():
        os.chdir("backend")
    
    print("📦 Installing dependencies...")
    install_deps()
    
    print("🗄️ Checking database...")
    if not check_mysql():
        print("\n⚠️ MySQL not ready but starting anyway...")
    
    print("🤖 Loading AI models...")
    try:
        from services.ai_processor_final import final_ai_processor
        print("✅ AI processor ready")
    except Exception as e:
        print(f"⚠️ AI processor warning: {e}")
    
    start_server()