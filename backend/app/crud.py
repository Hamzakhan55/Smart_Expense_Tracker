from sqlalchemy.orm import Session
from . import models
from . import schemas

def get_expenses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Expense).offset(skip).limit(limit).all()

# Ensure you have other necessary functions like create_expense as well
def create_expense(db: Session, expense: schemas.ExpenseCreate):
    db_expense = models.Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_incomes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Income).order_by(models.Income.expense_date.desc()).offset(skip).limit(limit).all()

def create_income(db: Session, income: schemas.IncomeCreate):
    db_income = models.Income(**income.dict())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income


def delete_expense(db: Session, expense_id: int):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return db_expense

def delete_income(db: Session, income_id: int):
    db_income = db.query(models.Income).filter(models.Income.id == income_id).first()
    if db_income:
        db.delete(db_income)
        db.commit()
    return db_income