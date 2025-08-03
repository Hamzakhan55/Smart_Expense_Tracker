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

from . import crud, models, schemas, user_crud, security, summary_crud, budget_crud, goal_crud
from .database import SessionLocal, engine
from datetime import date

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

sys.path.append(str(Path(__file__).parent.parent))
from services.ai_processor_local import ai_processor

app = FastAPI(
    title="Expense Tracker API",
    description="API for managing personal expenses, with AI-powered voice input.",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://192.168.1.17:8000",
    "*"  # Allow all origins for mobile development
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
def read_expenses(skip: int = 0, limit: int = 100, search: str | None = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_expenses_for_user(db, user_id=current_user.id, skip=skip, limit=limit, search=search)

@app.post("/incomes/", response_model=schemas.Income)
def create_income_endpoint(income: schemas.IncomeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_income_for_user(db=db, income=income, user_id=current_user.id)

@app.get("/incomes/", response_model=List[schemas.Income])
def read_incomes_endpoint(skip: int = 0, limit: int = 100, search: str | None = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_incomes_for_user(db, user_id=current_user.id, skip=skip, limit=limit, search=search)

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

@app.post("/process-voice/", response_model=schemas.Expense)
async def process_voice(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    temp_dir = Path("temp_audio")
    temp_dir.mkdir(exist_ok=True)
    temp_file_path = temp_dir / file.filename
    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        expense_data = ai_processor.process_expense_audio(str(temp_file_path))
        if expense_data.get("category") == "Error":
            raise HTTPException(status_code=400, detail=expense_data.get("description"))
        
        # Create expense from AI data
        expense_create = schemas.ExpenseCreate(
            amount=expense_data["amount"],
            category=expense_data["category"],
            description=expense_data["description"]
        )
        return crud.create_expense_for_user(db=db, expense=expense_create, user_id=current_user.id)
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


@app.get("/expenses/forecast/", response_model=schemas.ForecastResponse)
def get_forecast_endpoint(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    forecast_data = crud.get_expense_forecast(db, user_id=current_user.id)
    if not forecast_data:
        raise HTTPException(status_code=404, detail="Not enough data to generate a forecast.")
    return forecast_data

# --- NEW SUMMARY ENDPOINTS ---

@app.get("/summary/{year}/{month}", response_model=schemas.MonthlySummary, tags=["Summaries"])
def get_monthly_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Gets the financial summary for a specific month. 
    If a summary is not pre-calculated, it will be generated and stored.
    """
    summary = summary_crud.get_or_create_monthly_summary(db, user_id=current_user.id, year=year, month=month)
    return {
        "year": summary.year,
        "month": summary.month,
        "total_income": summary.total_income,
        "total_expenses": summary.total_expenses,
        "net_balance": summary.total_income - summary.total_expenses
    }

@app.get("/summary/balance", response_model=schemas.RunningBalance, tags=["Summaries"])
def get_total_balance(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Gets the all-time running balance (total savings).
    """
    balance = summary_crud.get_running_balance(db, user_id=current_user.id)
    return {"total_balance": balance}

# --- NEW BUDGET ENDPOINTS ---

@app.post("/budgets/", response_model=schemas.Budget, tags=["Budgets"])
def create_or_update_budget_endpoint(
    budget: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Creates a new budget or updates an existing one for a specific category and month.
    """
    return budget_crud.create_or_update_budget(db, budget=budget, user_id=current_user.id)

@app.get("/budgets/{year}/{month}", response_model=List[schemas.Budget], tags=["Budgets"])
def get_budgets_for_month_endpoint(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Retrieves all budgets set for a specific month.
    """
    return budget_crud.get_budgets_for_month(db, user_id=current_user.id, year=year, month=month)

# --- NEW GOAL ENDPOINTS ---

@app.post("/goals/", response_model=schemas.Goal, tags=["Goals"])
def create_goal_endpoint(
    goal: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return goal_crud.create_goal(db, goal=goal, user_id=current_user.id)

@app.get("/goals/", response_model=List[schemas.Goal], tags=["Goals"])
def get_goals_endpoint(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return goal_crud.get_goals(db, user_id=current_user.id)
    
@app.put("/goals/{goal_id}/progress", response_model=schemas.Goal, tags=["Goals"])
def update_goal_progress_endpoint(
    goal_id: int,
    update_data: schemas.GoalUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_goal = goal_crud.update_goal_progress(db, goal_id=goal_id, user_id=current_user.id, amount=update_data.amount)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal
    
@app.delete("/goals/{goal_id}", response_model=schemas.Goal, tags=["Goals"])
def delete_goal_endpoint(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_goal = goal_crud.delete_goal(db, goal_id=goal_id, user_id=current_user.id)
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal

@app.get("/summary/historical", response_model=List[schemas.HistoricalDataPoint], tags=["Summaries"])
def get_historical_summary_endpoint(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return summary_crud.get_historical_summary(db, user_id=current_user.id)

@app.get("/expenses/{year}/{month}", response_model=List[schemas.Expense], tags=["Expenses"])
def get_expenses_by_month(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get expenses for a specific month and year.
    """
    return crud.get_expenses_by_month(db, user_id=current_user.id, year=year, month=month)

@app.get("/insights/smart", tags=["Insights"])
def get_smart_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Generate AI-powered smart insights based on user's spending patterns.
    """
    from datetime import datetime, timedelta
    import calendar
    
    current_date = datetime.now()
    current_month = current_date.month
    current_year = current_date.year
    days_in_month = calendar.monthrange(current_year, current_month)[1]
    days_passed = current_date.day
    
    # Get previous month
    if current_month == 1:
        previous_month = 12
        previous_year = current_year - 1
    else:
        previous_month = current_month - 1
        previous_year = current_year
    
    # Get current and previous month data
    current_expenses = crud.get_expenses_by_month(db, user_id=current_user.id, year=current_year, month=current_month)
    previous_expenses = crud.get_expenses_by_month(db, user_id=current_user.id, year=previous_year, month=previous_month)
    
    current_summary = summary_crud.get_or_create_monthly_summary(db, user_id=current_user.id, year=current_year, month=current_month)
    previous_summary = summary_crud.get_or_create_monthly_summary(db, user_id=current_user.id, year=previous_year, month=previous_month)
    
    # Get budgets for current month
    budgets = budget_crud.get_budgets_for_month(db, user_id=current_user.id, year=current_year, month=current_month)
    
    # Calculate category analysis
    current_categories = {}
    previous_categories = {}
    
    for expense in current_expenses:
        current_categories[expense.category] = current_categories.get(expense.category, 0) + expense.amount
    
    for expense in previous_expenses:
        previous_categories[expense.category] = previous_categories.get(expense.category, 0) + expense.amount
    
    # Generate insights
    insights = []
    
    # 1. Prediction insight
    if previous_summary.total_expenses > 0:
        trend = (current_summary.total_expenses - previous_summary.total_expenses) / previous_summary.total_expenses
        seasonal_factor = 1 + (0.15 * (current_month / 12))
        prediction = current_summary.total_expenses * (1 + trend * 0.7) * seasonal_factor
        
        insights.append({
            "type": "prediction",
            "title": "Next Month Forecast",
            "message": f"Based on your spending pattern, next month's expenses are predicted to be ${prediction:.0f}",
            "value": prediction,
            "confidence": 0.75
        })
    
    # 2. Budget alerts
    for budget in budgets:
        spent = current_categories.get(budget.category, 0)
        if spent > 0:
            percentage = (spent / budget.amount) * 100
            days_remaining = days_in_month - days_passed
            
            if percentage >= 85:
                insights.append({
                    "type": "warning",
                    "title": "Budget Alert",
                    "message": f"You're {percentage:.0f}% through your {budget.category} budget with {days_remaining} days left this month",
                })
            elif percentage >= 50 and days_passed < (days_in_month * 0.5):
                insights.append({
                    "type": "info",
                    "title": "Budget Watch",
                    "message": f"You've used {percentage:.0f}% of your {budget.category} budget in the first half of the month",
                })
    
    # 3. Category insights
    if current_categories:
        top_category = max(current_categories, key=current_categories.get)
        top_amount = current_categories[top_category]
        
        insights.append({
            "type": "info",
            "title": "Top Spending Category",
            "message": f"{top_category} is your highest spending category this month at ${top_amount:.0f}",
        })
    
    # 4. Savings opportunity
    if previous_summary.total_expenses > 0 and current_summary.total_expenses > previous_summary.total_expenses:
        increase = current_summary.total_expenses - previous_summary.total_expenses
        insights.append({
            "type": "warning",
            "title": "Spending Increase",
            "message": f"Your spending increased by ${increase:.0f} compared to last month",
        })
    elif previous_summary.total_expenses > 0 and current_summary.total_expenses < previous_summary.total_expenses:
        savings = previous_summary.total_expenses - current_summary.total_expenses
        insights.append({
            "type": "success",
            "title": "Great Savings!",
            "message": f"You saved ${savings:.0f} compared to last month. Keep it up!",
        })
    
    return {
        "insights": insights,
        "current_month_total": current_summary.total_expenses,
        "previous_month_total": previous_summary.total_expenses,
        "category_analysis": {
            "current": current_categories,
            "previous": previous_categories
        },
        "generated_at": current_date.isoformat()
    }

@app.delete("/transactions/all", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_transactions_endpoint(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    crud.delete_all_expenses_for_user(db, user_id=current_user.id)
    crud.delete_all_incomes_for_user(db, user_id=current_user.id)
    return {"ok": True}