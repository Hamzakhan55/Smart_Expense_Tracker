#!/usr/bin/env python3
"""
Script to add sample transactions for testing the mobile app.
"""

from app.database import SessionLocal
from app import models, user_crud
from datetime import datetime, timedelta
import random

def add_sample_transactions():
    """Add sample transactions for demo user."""
    db = SessionLocal()
    try:
        # Get demo user
        user = user_crud.get_user_by_email(db, email="demo@example.com")
        if not user:
            print("Demo user not found. Run create_demo_user.py first.")
            return
        
        # Sample expenses
        expenses = [
            {"amount": 25.50, "category": "Food & Drinks", "description": "Lunch at McDonald's"},
            {"amount": 60.00, "category": "Transport", "description": "Gas station fill-up"},
            {"amount": 120.00, "category": "Shopping", "description": "Grocery shopping"},
            {"amount": 15.99, "category": "Entertainment", "description": "Netflix subscription"},
            {"amount": 45.00, "category": "Food & Drinks", "description": "Dinner at restaurant"},
            {"amount": 8.50, "category": "Transport", "description": "Bus fare"},
            {"amount": 200.00, "category": "Utilities", "description": "Electricity bill"},
            {"amount": 35.00, "category": "Healthcare", "description": "Pharmacy medicines"},
            {"amount": 75.00, "category": "Shopping", "description": "Clothing purchase"},
            {"amount": 12.99, "category": "Entertainment", "description": "Movie ticket"},
            {"amount": 18.50, "category": "Food & Drinks", "description": "Coffee and pastry"},
            {"amount": 150.00, "category": "Bills", "description": "Internet bill"},
            {"amount": 90.00, "category": "Transport", "description": "Car maintenance"},
            {"amount": 22.00, "category": "Food & Drinks", "description": "Pizza delivery"},
            {"amount": 65.00, "category": "Education", "description": "Books and supplies"},
            {"amount": 800.00, "category": "Rent", "description": "Monthly rent payment"},
            {"amount": 299.99, "category": "Electronics & Gadgets", "description": "New smartphone"},
            {"amount": 50.00, "category": "Personal Care", "description": "Haircut and styling"},
            {"amount": 85.00, "category": "Family & Kids", "description": "Children's toys"},
            {"amount": 100.00, "category": "Charity & Donations", "description": "Monthly charity donation"},
            {"amount": 500.00, "category": "Investments", "description": "Stock purchase"},
            {"amount": 25.00, "category": "Miscellaneous", "description": "Random expense"},
        ]
        
        # Sample incomes
        incomes = [
            {"amount": 3500.00, "category": "Salary", "description": "Monthly salary"},
            {"amount": 500.00, "category": "Freelance", "description": "Web design project"},
            {"amount": 150.00, "category": "Investment", "description": "Stock dividends"},
            {"amount": 75.00, "category": "Other", "description": "Gift money"},
        ]
        
        # Add expenses with random dates in the last 30 days
        for expense_data in expenses:
            days_ago = random.randint(0, 30)
            expense_date = datetime.now() - timedelta(days=days_ago)
            
            expense = models.Expense(
                amount=expense_data["amount"],
                category=expense_data["category"],
                description=expense_data["description"],
                date=expense_date,
                user_id=user.id
            )
            db.add(expense)
        
        # Add incomes with random dates in the last 30 days
        for income_data in incomes:
            days_ago = random.randint(0, 30)
            income_date = datetime.now() - timedelta(days=days_ago)
            
            income = models.Income(
                amount=income_data["amount"],
                category=income_data["category"],
                description=income_data["description"],
                income_date=income_date,
                user_id=user.id
            )
            db.add(income)
        
        db.commit()
        print(f"✅ Added {len(expenses)} expenses and {len(incomes)} incomes for demo user!")
        
    except Exception as e:
        print(f"Error adding sample transactions: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_transactions()