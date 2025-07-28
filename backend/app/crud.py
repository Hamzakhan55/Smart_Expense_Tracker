from sqlalchemy.orm import Session
from . import models
from . import schemas

# User-specific CRUD functions
def get_expenses_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Expense).filter(models.Expense.user_id == user_id).order_by(models.Expense.date.desc()).offset(skip).limit(limit).all()

def create_expense_for_user(db: Session, expense: schemas.ExpenseCreate, user_id: int):
    db_expense = models.Expense(**expense.dict(), user_id=user_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_incomes_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Income).filter(models.Income.user_id == user_id).order_by(models.Income.income_date.desc()).offset(skip).limit(limit).all()

def create_income_for_user(db: Session, income: schemas.IncomeCreate, user_id: int):
    db_income = models.Income(**income.dict(), user_id=user_id)
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

def delete_expense_for_user(db: Session, expense_id: int, user_id: int):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.user_id == user_id).first()
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return db_expense

def delete_income_for_user(db: Session, income_id: int, user_id: int):
    db_income = db.query(models.Income).filter(models.Income.id == income_id, models.Income.user_id == user_id).first()
    if db_income:
        db.delete(db_income)
        db.commit()
    return db_income

def update_expense_for_user(db: Session, expense_id: int, expense: schemas.ExpenseCreate, user_id: int):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.user_id == user_id).first()
    if db_expense:
        for key, value in expense.dict().items():
            setattr(db_expense, key, value)
        db.commit()
        db.refresh(db_expense)
    return db_expense

def update_income_for_user(db: Session, income_id: int, income: schemas.IncomeCreate, user_id: int):
    db_income = db.query(models.Income).filter(models.Income.id == income_id, models.Income.user_id == user_id).first()
    if db_income:
        for key, value in income.dict().items():
            setattr(db_income, key, value)
        db.commit()
        db.refresh(db_income)
    return db_income

def delete_all_expenses_for_user(db: Session, user_id: int):
    deleted_rows = db.query(models.Expense).filter(models.Expense.user_id == user_id).delete()
    db.commit()
    return deleted_rows

def delete_all_incomes_for_user(db: Session, user_id: int):
    deleted_rows = db.query(models.Income).filter(models.Income.user_id == user_id).delete()
    db.commit()
    return deleted_rows