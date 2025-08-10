#!/usr/bin/env python3
"""
Script to fix login issues by ensuring database is properly set up.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import engine, SessionLocal
from app import models, user_crud, schemas
from sqlalchemy import text

def check_database_connection():
    """Check if we can connect to the database."""
    try:
        db = SessionLocal()
        # Try a simple query
        result = db.execute(text("SELECT 1"))
        db.close()
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def create_tables():
    """Create all database tables."""
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✓ Database tables created/verified")
        return True
    except Exception as e:
        print(f"✗ Failed to create tables: {e}")
        return False

def create_demo_user():
    """Create a demo user for testing."""
    db = SessionLocal()
    try:
        # Check if demo user already exists
        existing_user = user_crud.get_user_by_email(db, email="demo@example.com")
        if existing_user:
            print("✓ Demo user already exists")
            return True
        
        # Create demo user
        demo_user = schemas.UserCreate(
            email="demo@example.com",
            password="demo123",
            full_name="Demo User"
        )
        
        user = user_crud.create_user(db=db, user=demo_user)
        print(f"✓ Demo user created successfully!")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.full_name}")
        print(f"   Password: demo123")
        return True
        
    except Exception as e:
        print(f"✗ Error creating demo user: {e}")
        return False
    finally:
        db.close()

def test_login():
    """Test the login functionality."""
    db = SessionLocal()
    try:
        from app import security
        
        # Get the demo user
        user = user_crud.get_user_by_email(db, email="demo@example.com")
        if not user:
            print("✗ Demo user not found")
            return False
        
        # Test password verification
        if security.verify_password("demo123", user.hashed_password):
            print("✓ Password verification works")
            
            # Test token creation
            token = security.create_access_token(data={"sub": user.email})
            print("✓ JWT token creation works")
            print(f"   Sample token: {token[:50]}...")
            return True
        else:
            print("✗ Password verification failed")
            return False
            
    except Exception as e:
        print(f"✗ Login test failed: {e}")
        return False
    finally:
        db.close()

def main():
    """Main function to fix login issues."""
    print("🔧 Fixing login issues...")
    print("=" * 50)
    
    # Step 1: Check database connection
    if not check_database_connection():
        print("\n❌ Cannot connect to database. Please check:")
        print("   1. MySQL server is running on port 3307")
        print("   2. Database 'expense_tracker_db' exists")
        print("   3. MySQL root user has no password or correct password is set")
        return False
    
    # Step 2: Create tables
    if not create_tables():
        return False
    
    # Step 3: Create demo user
    if not create_demo_user():
        return False
    
    # Step 4: Test login functionality
    if not test_login():
        return False
    
    print("\n" + "=" * 50)
    print("✅ All login issues have been fixed!")
    print("\nYou can now login with:")
    print("   Email: demo@example.com")
    print("   Password: demo123")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)