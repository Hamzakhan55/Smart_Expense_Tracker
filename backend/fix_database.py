#!/usr/bin/env python3
"""
Fix database connection
"""

import sys
from pathlib import Path
import os

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

def create_database():
    """Create database and tables"""
    print("🗄️ Creating database...")
    
    try:
        from app.database import engine
        from app import models
        
        # Create all tables
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
        
        # Test connection
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        print("✅ Database connection working")
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def check_database_file():
    """Check if database file exists"""
    db_paths = [
        "expense_tracker.db",
        "app/expense_tracker.db"
    ]
    
    for db_path in db_paths:
        if Path(db_path).exists():
            print(f"✅ Found database: {db_path}")
            return True
    
    print("⚠️ No database file found - will create new one")
    return False

def main():
    print("🔧 Database Fix")
    print("=" * 20)
    
    # Check if database exists
    db_exists = check_database_file()
    
    # Create/fix database
    if create_database():
        print("\n🎉 Database is ready!")
    else:
        print("\n❌ Database setup failed")
        print("Try: pip install sqlalchemy")

if __name__ == "__main__":
    main()