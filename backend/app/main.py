from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
import shutil
from pathlib import Path
from pydantic import BaseModel
import sys

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

from fastapi.middleware.cors import CORSMiddleware

from . import crud, models, schemas, user_crud, security
from .database import SessionLocal, engine

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

sys.path.append(str(Path(__file__).parent.parent))
from services.ai_processor import ai_processor

app = FastAPI(
    title="Expense Tracker API",
    description="API for managing personal expenses, with AI-powered voice input.",
    version="1.0.0",
)

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = user_crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

class AiResponse(BaseModel):
    description: str
    category: str
    amount: float

class LoginRequest(BaseModel):
    email: str
    password: str

# Authentication endpoints
@app.post("/signup", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_crud.create_user(db=db, user=user)

@app.post("/users/", response_model=schemas.User)
def create_user_alt(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=schemas.Token)
def login_json(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, email=credentials.email)
    if not user or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Protected endpoints with user-specific data
@app.post("/expenses/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_expense_for_user(db=db, expense=expense, user_id=current_user.id)

@app.get("/expenses/", response_model=List[schemas.Expense])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_expenses_for_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.post("/incomes/", response_model=schemas.Income)
def create_income_endpoint(income: schemas.IncomeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_income_for_user(db=db, income=income, user_id=current_user.id)

@app.get("/incomes/", response_model=List[schemas.Income])
def read_incomes_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_incomes_for_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.delete("/expenses/{expense_id}", response_model=schemas.Expense)
def delete_expense_endpoint(expense_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_expense = crud.delete_expense_for_user(db, expense_id=expense_id, user_id=current_user.id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@app.delete("/incomes/{income_id}", response_model=schemas.Income)
def delete_income_endpoint(income_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_income = crud.delete_income_for_user(db, income_id=income_id, user_id=current_user.id)
    if db_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return db_income

@app.put("/expenses/{expense_id}", response_model=schemas.Expense)
def update_expense_endpoint(expense_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_expense = crud.update_expense_for_user(db, expense_id=expense_id, expense=expense, user_id=current_user.id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@app.put("/incomes/{income_id}", response_model=schemas.Income)
def update_income_endpoint(income_id: int, income: schemas.IncomeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_income = crud.update_income_for_user(db, income_id=income_id, income=income, user_id=current_user.id)
    if db_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return db_income

@app.delete("/transactions/all", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_transactions_endpoint(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    crud.delete_all_expenses_for_user(db, user_id=current_user.id)
    crud.delete_all_incomes_for_user(db, user_id=current_user.id)
    return {"ok": True}

@app.post("/process-voice-dry-run/", response_model=AiResponse)
async def process_voice_dry_run(file: UploadFile = File(...)):
    temp_dir = Path("temp_audio")
    temp_dir.mkdir(exist_ok=True)
    temp_file_path = temp_dir / file.filename
    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        expense_data = ai_processor.process_expense_audio(str(temp_file_path))
        if expense_data.get("category") == "Error":
            raise HTTPException(status_code=400, detail=expense_data.get("description"))
        return AiResponse(**expense_data)
    finally:
        if temp_file_path.exists():
            temp_file_path.unlink()

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/users/me", response_model=schemas.User)
async def read_users_me_alt(current_user: models.User = Depends(get_current_user)):
    return current_user