from sqlalchemy.orm import Session
from . import models
from . import schemas
from sqlalchemy import func, or_
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
import calendar

# User-specific CRUD functions
def get_expenses_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100, search: str | None = None):
    query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    
    if search:
        query = query.filter(or_(
            models.Expense.description.ilike(f"%{search}%"),
            models.Expense.category.ilike(f"%{search}%")
        ))
        
    return query.order_by(models.Expense.date.desc()).offset(skip).limit(limit).all()

def create_expense_for_user(db: Session, expense: schemas.ExpenseCreate, user_id: int):
    db_expense = models.Expense(**expense.dict(), user_id=user_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_incomes_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100, search: str | None = None):
    query = db.query(models.Income).filter(models.Income.user_id == user_id)
    
    if search:
        query = query.filter(or_(
            models.Income.description.ilike(f"%{search}%"),
            models.Income.category.ilike(f"%{search}%")
        ))
        
    return query.order_by(models.Income.income_date.desc()).offset(skip).limit(limit).all()

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

def get_expense_forecast(db: Session, user_id: int):
    from datetime import datetime, timedelta
    from collections import defaultdict
    
    # Get expenses from last 3 months
    three_months_ago = datetime.now() - timedelta(days=90)
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == user_id,
        models.Expense.date >= three_months_ago
    ).all()
    
    if not expenses:
        return None
    
    # Calculate monthly averages by category
    category_totals = defaultdict(float)
    for expense in expenses:
        category_totals[expense.category] += expense.amount
    
    # Average over 3 months to predict next month
    by_category = {cat: total / 3 for cat, total in category_totals.items()}
    total_forecast = sum(by_category.values())
    
    return {
        "total_forecast": total_forecast,
        "by_category": by_category
    }

def get_expense_forecast(db: Session, user_id: int):
    # 1. Define date ranges
    today = date.today()
    start_date = today - timedelta(days=60)
    
    # Calculate the number of days in the NEXT month
    next_month_date = today + relativedelta(months=1)
    days_in_next_month = calendar.monthrange(next_month_date.year, next_month_date.month)[1]

    # 2. Identify fixed vs. variable categories (based on your list)
    fixed_categories = ["Rent", "Bills & Fees", "Utilities"]
    
    # 3. Calculate fixed costs: Assume the last payment is the forecast
    fixed_cost_forecast = db.query(
        models.Expense.category, func.max(models.Expense.amount)
    ).filter(
        models.Expense.user_id == user_id,
        models.Expense.category.in_(fixed_categories),
        models.Expense.date >= today - timedelta(days=45) # Look for last payment in last ~1.5 months
    ).group_by(models.Expense.category).all()
    
    forecast_by_category = {category: amount for category, amount in fixed_cost_forecast}
    
    # 4. Calculate variable costs: Get total spent in the last 60 days
    variable_expenses_total = db.query(
        func.sum(models.Expense.amount)
    ).filter(
        models.Expense.user_id == user_id,
        ~models.Expense.category.in_(fixed_categories), # The '~' means NOT IN
        models.Expense.date >= start_date
    ).scalar() or 0 # .scalar() gets a single value, or 0 if None
    
    # 5. Project variable costs for the next month
    average_daily_variable_spend = variable_expenses_total / 60
    projected_variable_spend = average_daily_variable_spend * days_in_next_month
    
    if projected_variable_spend > 0:
        forecast_by_category["Variable Spending"] = projected_variable_spend
        
    # 6. Sum everything up for the total forecast
    total_forecast = sum(forecast_by_category.values())
    
    return {
        "total_forecast": total_forecast,
        "by_category": forecast_by_category
    }

def delete_all_expenses_for_user(db: Session, user_id: int):
    deleted_rows = db.query(models.Expense).filter(models.Expense.user_id == user_id).delete()
    db.commit()
    return deleted_rows

def delete_all_incomes_for_user(db: Session, user_id: int):
    deleted_rows = db.query(models.Income).filter(models.Income.user_id == user_id).delete()
    db.commit()
    return deleted_rows

def get_expenses_by_month(db: Session, user_id: int, year: int, month: int):
    return db.query(models.Expense).filter(
        models.Expense.user_id == user_id,
        func.extract('year', models.Expense.date) == year,
        func.extract('month', models.Expense.date) == month
    ).all()