from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
from pathlib import Path
from fastapi import status 

# --- NEW: Import the CORS middleware ---
from fastapi.middleware.cors import CORSMiddleware

# --- Your other imports ---
from . import crud, models, schemas
from .database import SessionLocal, engine
# ### CORRECTION: Changed the import from .. to . ###
from ..services.ai_processor import ai_processor

app = FastAPI(
    title="Expense Tracker API",
    description="API for managing personal expenses, with AI-powered voice input.",
    version="1.0.0",
)

# ### START OF NEW CODE BLOCK TO ADD ###

# This is the list of "origins" (the domains of your frontend) that are allowed to make requests.
origins = [
    "http://localhost:3000",  # Your Next.js frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# ### END OF NEW CODE BLOCK ###


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
    """
    return crud.create_expense(db=db, expense=expense)


@app.get("/expenses/", response_model=List[schemas.Expense])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of expenses.
    """
    expenses = crud.get_expenses(db, skip=skip, limit=limit)
    return expenses


@app.post("/process-voice/", response_model=schemas.Expense)
async def process_voice_and_create_expense(
    db: Session = Depends(get_db), 
    file: UploadFile = File(...)
):
    """
    Receives an audio file, processes it to extract expense details,
    and saves the new expense to the database.
    """
    temp_dir = Path("temp_audio")
    temp_dir.mkdir(exist_ok=True)
    temp_file_path = temp_dir / file.filename

    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file.file.close()

        print(f"🎤 Processing audio file: {temp_file_path}")
        try:
            expense_data = ai_processor.process_expense_audio(str(temp_file_path))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"AI processing failed: {str(e)}")

        if not isinstance(expense_data, dict) or \
           "category" not in expense_data or \
           "description" not in expense_data or \
           "amount" not in expense_data:
            raise HTTPException(status_code=400, detail="AI processor returned invalid data")

        if expense_data["category"] == "Error":
            raise HTTPException(status_code=400, detail=expense_data.get("description", "Failed to transcribe audio"))

        new_expense = schemas.ExpenseCreate(
            description=expense_data["description"],
            amount=expense_data["amount"],
            category=expense_data["category"]
        )
        db_expense = crud.create_expense(db=db, expense=new_expense)
        return db_expense

    finally:
        if temp_file_path.exists():
            temp_file_path.unlink()
            
            
@app.post("/incomes/", response_model=schemas.Income)
def create_income_endpoint(income: schemas.IncomeCreate, db: Session = Depends(get_db)):
    return crud.create_income(db=db, income=income)

@app.get("/incomes/", response_model=List[schemas.Income])
def read_incomes_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    incomes = crud.get_incomes(db, skip=skip, limit=limit)
    return incomes


@app.delete("/expenses/{expense_id}", response_model=schemas.Expense)
def delete_expense_endpoint(expense_id: int, db: Session = Depends(get_db)):
    db_expense = crud.delete_expense(db, expense_id=expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@app.delete("/incomes/{income_id}", response_model=schemas.Income)
def delete_income_endpoint(income_id: int, db: Session = Depends(get_db)):
    db_income = crud.delete_income(db, income_id=income_id)
    if db_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return db_income


@app.put("/expenses/{expense_id}", response_model=schemas.Expense)
def update_expense_endpoint(expense_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = crud.update_expense(db, expense_id=expense_id, expense=expense)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@app.put("/incomes/{income_id}", response_model=schemas.Income)
def update_income_endpoint(income_id: int, income: schemas.IncomeCreate, db: Session = Depends(get_db)):
    db_income = crud.update_income(db, income_id=income_id, income=income)
    if db_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return db_income

@app.delete("/transactions/all", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_transactions_endpoint(db: Session = Depends(get_db)):
    crud.delete_all_expenses(db)
    crud.delete_all_incomes(db)
    return {"ok": True}