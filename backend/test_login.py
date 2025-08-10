#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app import user_crud, security
from sqlalchemy import text

def test_user_login(email, password):
    """Test login for a specific user."""
    db = SessionLocal()
    try:
        # Get user by email
        user = user_crud.get_user_by_email(db, email=email)
        if not user:
            print(f"User {email} not found")
            return False
        
        print(f"User found: {user.email}")
        print(f"Stored password hash: {user.hashed_password[:50]}...")
        
        # Test password verification
        if security.verify_password(password, user.hashed_password):
            print("Password verification: SUCCESS")
            
            # Create token
            token = security.create_access_token(data={"sub": user.email})
            print(f"Token created: {token[:50]}...")
            return True
        else:
            print("Password verification: FAILED")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        db.close()

def show_user_passwords():
    """Show first few characters of password hashes for debugging."""
    db = SessionLocal()
    try:
        users = db.execute(text("SELECT email, hashed_password FROM users LIMIT 5")).fetchall()
        print("User password hashes (first 20 chars):")
        for user in users:
            print(f"   {user[0]}: {user[1][:20]}...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Testing login functionality...")
    print("=" * 40)
    
    show_user_passwords()
    print()
    
    # Test with first user
    test_email = "hamzakhan127109@gmail.com"
    print(f"Testing login for: {test_email}")
    
    # You need to provide the actual password for this user
    test_password = input(f"Enter password for {test_email}: ")
    
    if test_user_login(test_email, test_password):
        print("LOGIN TEST: SUCCESS")
    else:
        print("LOGIN TEST: FAILED")