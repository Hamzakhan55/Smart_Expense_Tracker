from app.database import SessionLocal
from sqlalchemy import text

def add_user_id_columns():
    db = SessionLocal()
    try:
        # Add user_id column to expenses if not exists
        try:
            db.execute(text("ALTER TABLE expenses ADD COLUMN user_id INTEGER"))
            print("Added user_id to expenses")
        except:
            print("user_id already exists in expenses")
        
        # Add user_id column to incomes if not exists
        try:
            db.execute(text("ALTER TABLE incomes ADD COLUMN user_id INTEGER"))
            print("Added user_id to incomes")
        except:
            print("user_id already exists in incomes")
        
        db.commit()
        print("Done")
    finally:
        db.close()

if __name__ == "__main__":
    add_user_id_columns()