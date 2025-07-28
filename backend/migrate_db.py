#!/usr/bin/env python3
"""
Database migration script to update existing data types and column names.
Run this after updating the models to ensure database consistency.
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import DATABASE_URL

def migrate_database():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Check if we need to migrate amount columns from INTEGER to FLOAT
            print("Checking expenses table structure...")
            result = conn.execute(text("PRAGMA table_info(expenses)"))
            expenses_columns = {row[1]: row[2] for row in result}
            
            if expenses_columns.get('amount') == 'INTEGER':
                print("Migrating expenses.amount from INTEGER to FLOAT...")
                conn.execute(text("""
                    CREATE TABLE expenses_new (
                        id INTEGER PRIMARY KEY,
                        amount REAL NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        description VARCHAR(255) NOT NULL,
                        date DATETIME NOT NULL
                    )
                """))
                conn.execute(text("INSERT INTO expenses_new SELECT * FROM expenses"))
                conn.execute(text("DROP TABLE expenses"))
                conn.execute(text("ALTER TABLE expenses_new RENAME TO expenses"))
                print("✅ Expenses table migrated successfully")
            
            # Check incomes table
            print("Checking incomes table structure...")
            result = conn.execute(text("PRAGMA table_info(incomes)"))
            incomes_columns = {row[1]: row[2] for row in result}
            
            needs_migration = False
            if incomes_columns.get('amount') == 'INTEGER':
                needs_migration = True
            if 'income_date' in incomes_columns and 'date' not in incomes_columns:
                needs_migration = True
                
            if needs_migration:
                print("Migrating incomes table...")
                conn.execute(text("""
                    CREATE TABLE incomes_new (
                        id INTEGER PRIMARY KEY,
                        amount REAL NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        description VARCHAR(255),
                        date DATETIME NOT NULL
                    )
                """))
                
                # Handle both old and new column names
                if 'income_date' in incomes_columns:
                    conn.execute(text("INSERT INTO incomes_new (id, amount, category, description, date) SELECT id, amount, category, description, income_date FROM incomes"))
                else:
                    conn.execute(text("INSERT INTO incomes_new SELECT * FROM incomes"))
                    
                conn.execute(text("DROP TABLE incomes"))
                conn.execute(text("ALTER TABLE incomes_new RENAME TO incomes"))
                print("✅ Incomes table migrated successfully")
            
            conn.commit()
            print("🎉 Database migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    migrate_database()