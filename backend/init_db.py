#!/usr/bin/env python3
"""
Database initialization script to ensure all tables are created.
Run this script to set up the database tables.
"""

from app.database import engine, Base
from app.models import Expense, Income

def init_database():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_database()