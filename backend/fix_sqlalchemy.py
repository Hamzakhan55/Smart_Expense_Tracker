#!/usr/bin/env python3
"""
Fix SQLAlchemy version issue
"""

import subprocess
import sys

def fix_sqlalchemy():
    """Fix SQLAlchemy version"""
    print("🔧 Fixing SQLAlchemy...")
    
    try:
        # Downgrade to compatible version
        subprocess.check_call([sys.executable, "-m", "pip", "install", "sqlalchemy==1.4.53"])
        print("✅ SQLAlchemy downgraded to 1.4.53")
    except:
        print("❌ Failed to fix SQLAlchemy")

def test_db():
    """Test database after fix"""
    print("🗄️ Testing database...")
    
    try:
        from app.database import SessionLocal
        from sqlalchemy import text
        
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database works now")
        return True
    except Exception as e:
        print(f"❌ Still broken: {e}")
        return False

if __name__ == "__main__":
    fix_sqlalchemy()
    test_db()