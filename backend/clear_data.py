from app.database import SessionLocal
from sqlalchemy import text

def clear_existing_data():
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM expenses"))
        db.execute(text("DELETE FROM incomes"))
        db.commit()
        print("Cleared existing data")
    finally:
        db.close()

if __name__ == "__main__":
    clear_existing_data()