#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app import user_crud
from sqlalchemy import text

def test_connection():
    """Test MySQL connection and show existing users."""
    try:
        db = SessionLocal()
        
        # Test basic connection
        result = db.execute(text("SELECT 1"))
        print("MySQL connection successful")
        
        # Show existing users
        users = db.execute(text("SELECT id, email, full_name FROM users LIMIT 10")).fetchall()
        print(f"\nFound {len(users)} users in database:")
        for user in users:
            print(f"   ID: {user[0]}, Email: {user[1]}, Name: {user[2]}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()