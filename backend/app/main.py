from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
from pathlib import Path
from fastapi import status
from pydantic import BaseModel 

# --- NEW: Import the CORS middleware ---
from fastapi.middleware.cors import CORSMiddleware

# --- Your other imports ---
from . import crud, models, schemas
from .database import SessionLocal, engine
# Import AI processor service
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from services.ai_processor import ai_processor

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
        
class AiResponse(BaseModel):
    description: str
    category: str
    amount: float


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
            print(f"✅ AI processing result: {expense_data}")
        except Exception as e:
            print(f"❌ AI processing failed: {str(e)}")
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
        print(f"💾 Expense saved to database: {db_expense.id}")
        return db_expense

    except Exception as e:
        print(f"❌ Voice processing error: {str(e)}")
        raise
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

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify database connectivity."""
    try:
        # Test database connection
        expense_count = db.query(models.Expense).count()
        income_count = db.query(models.Income).count()
        return {
            "status": "healthy",
            "database": "connected",
            "expenses_count": expense_count,
            "incomes_count": income_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
        
@app.post("/process-voice-dry-run/", response_model=AiResponse)
async def process_voice_dry_run(file: UploadFile = File(...)):
    """
    Receives an audio file, processes it to extract expense details,
    BUT DOES NOT SAVE IT. It only returns the processed data.
    """
    temp_dir = Path("temp_audio")
    temp_dir.mkdir(exist_ok=True)
    temp_file_path = temp_dir / file.filename
    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        expense_data = ai_processor.process_expense_audio(str(temp_file_path))
        
        if expense_data["category"] == "Error":
            raise HTTPException(status_code=400, detail=expense_data["description"])
        
        # Return the data directly instead of creating an expense
        return AiResponse(**expense_data)
    finally:
        if temp_file_path.exists():
            temp_file_path.unlink()