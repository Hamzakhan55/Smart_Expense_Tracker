#!/usr/bin/env python3
"""
Check what's wrong with the app
"""

import sys
import os
from pathlib import Path

# Set environment
os.environ["DATABASE_URL"] = "mysql+pymysql://root:@localhost:3306/expense_tracker_db"
sys.path.insert(0, str(Path(__file__).parent))

def check_step_by_step():
    print("🔍 Step-by-step check...")
    
    # Step 1: Database
    try:
        from app.database import engine
        print("✅ Database engine")
    except Exception as e:
        print(f"❌ Database: {e}")
        return
    
    # Step 2: Models
    try:
        from app import models
        print("✅ Models")
    except Exception as e:
        print(f"❌ Models: {e}")
        return
    
    # Step 3: CRUD
    try:
        from app import crud
        print("✅ CRUD")
    except Exception as e:
        print(f"❌ CRUD: {e}")
        return
    
    # Step 4: Main app
    try:
        from app.main import app
        print("✅ Main app")
        print("🎉 App should work!")
    except Exception as e:
        print(f"❌ Main app: {e}")
        print(f"Full error: {str(e)}")

if __name__ == "__main__":
    check_step_by_step()