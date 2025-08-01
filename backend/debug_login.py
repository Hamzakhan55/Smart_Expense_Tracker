#!/usr/bin/env python3
import sqlite3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.security import verify_password, get_password_hash

def check_and_fix_user():
    # Connect to database
    conn = sqlite3.connect('app/expense_tracker.db')
    cursor = conn.cursor()
    
    # Check if user exists
    email = "hamzakhan127109@gmail.com"
    password = "khan452"
    
    cursor.execute('SELECT id, email, hashed_password FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    
    if user:
        print(f"User found: {user[1]}")
        print(f"Stored hash: {user[2][:50]}...")
        
        # Test password verification
        is_valid = verify_password(password, user[2])
        print(f"Password verification result: {is_valid}")
        
        if not is_valid:
            print("Password verification failed. Updating password hash...")
            new_hash = get_password_hash(password)
            cursor.execute('UPDATE users SET hashed_password = ? WHERE email = ?', (new_hash, email))
            conn.commit()
            print("Password hash updated successfully!")
            
            # Verify the fix
            is_valid_now = verify_password(password, new_hash)
            print(f"New password verification result: {is_valid_now}")
    else:
        print(f"User {email} not found. Creating user...")
        new_hash = get_password_hash(password)
        cursor.execute('INSERT INTO users (email, hashed_password, is_active) VALUES (?, ?, ?)', 
                      (email, new_hash, 1))
        conn.commit()
        print("User created successfully!")
    
    conn.close()

if __name__ == "__main__":
    check_and_fix_user()