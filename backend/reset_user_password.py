#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app import user_crud, security
from sqlalchemy import text

def reset_password(email, new_password):
    """Reset password for existing user."""
    db = SessionLocal()
    try:
        # Update password directly in database
        hashed_password = security.get_password_hash(new_password)
        result = db.execute(
            text("UPDATE users SET hashed_password = :hash WHERE email = :email"),
            {"hash": hashed_password, "email": email}
        )
        db.commit()
        
        if result.rowcount > 0:
            print(f"Password updated for {email}")
            return True
        else:
            print(f"User {email} not found")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    # Reset password for first user
    email = "hamzakhan127109@gmail.com"
    new_password = "123456"  # Simple password for testing
    
    if reset_password(email, new_password):
        print(f"\nYou can now login with:")
        print(f"Email: {email}")
        print(f"Password: {new_password}")