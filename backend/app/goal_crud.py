from sqlalchemy.orm import Session
from . import models, schemas

def create_goal(db: Session, goal: schemas.GoalCreate, user_id: int):
    db_goal = models.Goal(**goal.dict(), user_id=user_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal
    
def get_goals(db: Session, user_id: int):
    return db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    
def update_goal_progress(db: Session, goal_id: int, user_id: int, amount: float):
    db_goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id, 
        models.Goal.user_id == user_id
    ).first()
    
    if db_goal:
        db_goal.current_amount += amount
        db.commit()
        db.refresh(db_goal)
    
    return db_goal
    
def delete_goal(db: Session, goal_id: int, user_id: int):
    db_goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id, 
        models.Goal.user_id == user_id
    ).first()
    
    if db_goal:
        db.delete(db_goal)
        db.commit()
    
    return db_goal