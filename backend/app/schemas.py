from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from typing import Dict



class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass 

class Config:
    from_attributes = True

class Expense(ExpenseBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True
        
        
class IncomeBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class Income(IncomeBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True
        
        
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None



class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True
        
class ForecastResponse(BaseModel):
    total_forecast: float
    by_category: Dict[str, float]

class MonthlySummary(BaseModel):
    year: int
    month: int
    total_income: float
    total_expenses: float
    net_balance: float

    class Config:
        from_attributes = True

class RunningBalance(BaseModel):
    total_balance: float

    class Config:
        from_attributes = True

class BudgetBase(BaseModel):
    category: str
    amount: float
    year: int
    month: int

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: int
    
    class Config:
        from_attributes = True