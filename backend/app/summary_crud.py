from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from . import models
from datetime import date
from dateutil.relativedelta import relativedelta

def get_or_create_monthly_summary(db: Session, user_id: int, year: int, month: int):
    """
    This function tries to find an existing summary for a user for a given month.
    If it doesn't find one, it calculates it from scratch, saves it, and then returns it.
    This is the core caching mechanism.
    """
    
    # 1. Try to fetch an existing summary
    summary = db.query(models.MonthlySummary).filter(
        models.MonthlySummary.user_id == user_id,
        models.MonthlySummary.year == year,
        models.MonthlySummary.month == month
    ).first()
    
    if summary:
        # If we found one, return it immediately. Fast path!
        return summary

    # 2. If no summary exists, we must calculate it.
    # Calculate total income for the given month and year
    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == user_id,
        extract('year', models.Income.income_date) == year,
        extract('month', models.Income.income_date) == month
    ).scalar() or 0.0

    # Calculate total expenses for the given month and year
    total_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == user_id,
        extract('year', models.Expense.date) == year,
        extract('month', models.Expense.date) == month
    ).scalar() or 0.0

    # 3. Create a new summary record with our calculated values
    new_summary = models.MonthlySummary(
        year=year,
        month=month,
        total_income=total_income,
        total_expenses=total_expenses,
        user_id=user_id
    )

    # 4. Save the new summary to the database for future requests
    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)
    
    return new_summary


def get_running_balance(db: Session, user_id: int):
    """
    Calculates the user's all-time running balance.
    This is the ultimate source of truth for their net worth in the app.
    """
    
    # Sum up the total income from all time
    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == user_id
    ).scalar() or 0.0
    
    # Sum up the total expenses from all time
    total_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == user_id
    ).scalar() or 0.0
    
    return total_income - total_expenses

def get_historical_summary(db: Session, user_id: int):
    """
    Retrieves total expenses for each of the last 6 months.
    """
    today = date.today()
    results = []
    for i in range(6):
        target_date = today - relativedelta(months=i)
        year, month = target_date.year, target_date.month
        
        summary = get_or_create_monthly_summary(db, user_id, year, month)
        results.append({
            "year": year,
            "month": month,
            "total_expenses": summary.total_expenses
        })
    
    return results[::-1]