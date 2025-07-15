# backend/main.py

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expense Tracker API",
    description="API for managing personal expenses, with AI-powered voice input.",
    version="1.0.0",
)

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/expenses/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    """
    Create an expense.
    - **description**: A short text describing the expense.
    - **category**: The category of the expense (e.g., Food, Transport).
    - **amount**: The monetary value of the expense.
    """
    return crud.create_expense(db=db, expense=expense)


@app.get("/expenses/", response_model=List[schemas.Expense])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of expenses.
    - **skip**: Number of records to skip for pagination.
    - **limit**: Maximum number of records to return.
    """
    expenses = crud.get_expenses(db, skip=skip, limit=limit)
    return expenses