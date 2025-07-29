from sqlalchemy.orm import Session
from . import models, schemas

def create_or_update_budget(db: Session, budget: schemas.BudgetCreate, user_id: int):
    # Check if a budget for this category/month already exists
    db_budget = db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.category == budget.category,
        models.Budget.year == budget.year,
        models.Budget.month == budget.month
    ).first()
    
    if db_budget:
        # Update existing budget
        db_budget.amount = budget.amount
    else:
        # Create new budget
        db_budget = models.Budget(**budget.dict(), user_id=user_id)
        db.add(db_budget)
        
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_budgets_for_month(db: Session, user_id: int, year: int, month: int):
    return db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.year == year,
        models.Budget.month == month
    ).all()