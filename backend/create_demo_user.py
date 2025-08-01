#!/usr/bin/env python3
"""
Script to create a demo user for testing the application.
"""

from app.database import SessionLocal
from app import user_crud, schemas

def create_demo_user():
    """Create a demo user for testing."""
    db = SessionLocal()
    try:
        # Check if demo user already exists
        existing_user = user_crud.get_user_by_email(db, email="demo@example.com")
        if existing_user:
            print("✅ Demo user already exists!")
            return
        
        # Create demo user
        demo_user = schemas.UserCreate(
            email="demo@example.com",
            password="demo123",
            full_name="Demo User"
        )
        
        user = user_crud.create_user(db=db, user=demo_user)
        print(f"✅ Demo user created successfully!")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.full_name}")
        print(f"   Password: demo123")
        
    except Exception as e:
        print(f"❌ Error creating demo user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_user()