#!/usr/bin/env python3
"""
Backend startup script that ensures database is initialized.
"""

import subprocess
import sys
import os
from pathlib import Path

def init_database():
    """Initialize database tables."""
    try:
        from backend.app.database import engine, Base
        from backend.app.models import Expense, Income
        
        print("🗄️  Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def start_server():
    """Start the FastAPI server."""
    try:
        print("🚀 Starting FastAPI server...")
        os.chdir("backend")
        subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")

if __name__ == "__main__":
    print("🎯 Smart Expense Tracker Backend Startup")
    print("=" * 50)
    
    # Initialize database
    if init_database():
        # Start server
        start_server()
    else:
        print("❌ Cannot start server due to database initialization failure")
        sys.exit(1)