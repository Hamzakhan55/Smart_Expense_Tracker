#!/usr/bin/env python3
"""
Simple script to test if the backend is working correctly.
"""

import requests
import json

def test_backend():
    base_url = "http://127.0.0.1:8000"
    
    print("Testing Smart Expense Tracker Backend...")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check: PASSED")
        else:
            print(f"❌ Health check: FAILED (Status: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check: FAILED (Error: {e})")
        print("   Make sure the backend server is running on port 8000")
        return False
    
    # Test 2: Login with demo user
    try:
        login_data = {
            "username": "demo@example.com",
            "password": "demo123"
        }
        response = requests.post(
            f"{base_url}/token", 
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5
        )
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Demo login: PASSED")
            print(f"   Token: {token_data.get('access_token', 'N/A')[:20]}...")
            return True
        else:
            print(f"❌ Demo login: FAILED (Status: {response.status_code})")
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Demo login: FAILED (Error: {e})")
        return False

if __name__ == "__main__":
    success = test_backend()
    if success:
        print("\n🎉 Backend is working correctly!")
        print("You can now use the frontend to login with:")
        print("   Email: demo@example.com")
        print("   Password: demo123")
    else:
        print("\n💥 Backend test failed!")
        print("Please run the setup script first: setup_and_start.bat")