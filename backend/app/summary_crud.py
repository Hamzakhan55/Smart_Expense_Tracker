from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from . import models
from datetime import date
from dateutil.relativedelta import relativedelta

def get_or_create_monthly_summary(db: Session, user_id: int, year: int, month: int):
    """
    This function calculates monthly summary fresh each time to ensure real-time updates.
    """
    
    # Always calculate fresh to ensure real-time updates
    # Delete existing cached summary if it exists
    db.query(models.MonthlySummary).filter(
        models.MonthlySummary.user_id == user_id,
        models.MonthlySummary.year == year,
        models.MonthlySummary.month == month
    ).delete()
    db.commit()

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

def get_historical_summary(db: Session, user_id: int, months: int = 6):
    """
    Retrieves total expenses and income for the specified number of months.
    """
    today = date.today()
    results = []
    for i in range(months):
        target_date = today - relativedelta(months=i)
        year, month = target_date.year, target_date.month
        
        summary = get_or_create_monthly_summary(db, user_id, year, month)
        results.append({
            "year": year,
            "month": month,
            "total_expenses": summary.total_expenses,
            "total_income": summary.total_income
        })
    
    return results[::-1]

def get_category_breakdown(db: Session, user_id: int, months: int = 6):
    """
    Get category breakdown for expenses over specified months.
    """
    from collections import defaultdict
    
    today = date.today()
    start_date = today - relativedelta(months=months)
    
    # Get expenses for the period
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == user_id,
        models.Expense.date >= start_date
    ).all()
    
    category_totals = defaultdict(float)
    total_amount = 0
    
    for expense in expenses:
        category_totals[expense.category] += expense.amount
        total_amount += expense.amount
    
    colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4']
    
    results = []
    for i, (category, amount) in enumerate(sorted(category_totals.items(), key=lambda x: x[1], reverse=True)):
        percentage = (amount / total_amount * 100) if total_amount > 0 else 0
        results.append({
            "category": category,
            "amount": amount,
            "percentage": percentage,
            "color": colors[i % len(colors)]
        })
    
    return results

def get_spending_trends(db: Session, user_id: int, months: int = 6):
    """
    Get spending trends with income and savings data.
    """
    today = date.today()
    results = []
    
    for i in range(months):
        target_date = today - relativedelta(months=i)
        year, month = target_date.year, target_date.month
        
        summary = get_or_create_monthly_summary(db, user_id, year, month)
        net_savings = summary.total_income - summary.total_expenses
        
        results.append({
            "year": year,
            "month": month,
            "total_expenses": summary.total_expenses,
            "total_income": summary.total_income,
            "net_savings": net_savings
        })
    
    return results[::-1]

def get_analytics_stats(db: Session, user_id: int):
    """
    Get analytics statistics for the dashboard.
    """
    from collections import Counter
    
    # Get all expenses
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    
    if not expenses:
        return {
            "total_expenses": 0,
            "daily_average": 0,
            "top_category": "None",
            "transaction_count": 0,
            "savings_rate": 0
        }
    
    total_expenses = sum(expense.amount for expense in expenses)
    transaction_count = len(expenses)
    daily_average = total_expenses / 30 if expenses else 0
    
    # Get top category
    category_counts = Counter(expense.category for expense in expenses)
    top_category = category_counts.most_common(1)[0][0] if category_counts else "None"
    
    # Calculate savings rate
    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == user_id
    ).scalar() or 0
    
    savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
    
    return {
        "total_expenses": total_expenses,
        "daily_average": daily_average,
        "top_category": top_category,
        "transaction_count": transaction_count,
        "savings_rate": savings_rate
    }