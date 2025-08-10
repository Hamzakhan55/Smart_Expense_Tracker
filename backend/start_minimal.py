#!/usr/bin/env python3
"""
Minimal backend start - no AI loading
"""

import os
import sys
from pathlib import Path

# Set environment
os.environ["DATABASE_URL"] = "mysql+pymysql://root:@localhost:3306/expense_tracker_db"

# Add path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    print("🚀 Starting Minimal Backend...")
    
    try:
        # Test import
        from app.main import app
        print("✅ App imported")
        
        # Start server
        import uvicorn
        uvicorn.run(
            app,
            host="127.0.0.1", 
            port=8000,
            reload=False
        )
        
    except Exception as e:
        print(f"❌ Error: {e}")
        
        # Try direct command
        print("\nTry this command instead:")
        print("uvicorn app.main:app --host 127.0.0.1 --port 8000")