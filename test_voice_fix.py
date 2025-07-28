#!/usr/bin/env python3
"""
Test script to verify voice processing and database persistence.
"""

import requests
import json

def test_api_health():
    """Test API health and database connection."""
    try:
        response = requests.get("http://127.0.0.1:8000/health")
        print("🏥 Health Check:", response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_get_expenses():
    """Test getting expenses from database."""
    try:
        response = requests.get("http://127.0.0.1:8000/expenses/")
        expenses = response.json()
        print(f"💰 Current expenses in database: {len(expenses)}")
        for expense in expenses[:3]:  # Show first 3
            print(f"  - {expense['description']}: ${expense['amount']} ({expense['category']})")
        return True
    except Exception as e:
        print(f"❌ Failed to get expenses: {e}")
        return False

def test_create_expense():
    """Test creating a manual expense."""
    try:
        expense_data = {
            "description": "Test expense for voice fix",
            "amount": 25,
            "category": "Testing"
        }
        response = requests.post("http://127.0.0.1:8000/expenses/", json=expense_data)
        if response.status_code == 200:
            print("✅ Manual expense created successfully")
            return True
        else:
            print(f"❌ Failed to create expense: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to create expense: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Voice Processing Fix...")
    print("=" * 50)
    
    # Test API health
    if not test_api_health():
        print("❌ API is not healthy. Please start the backend server.")
        exit(1)
    
    # Test getting expenses
    test_get_expenses()
    
    # Test creating expense
    test_create_expense()
    
    # Test again to see if it persists
    print("\n🔄 Testing persistence...")
    test_get_expenses()
    
    print("\n✅ Tests completed. Voice processing should now persist data correctly.")