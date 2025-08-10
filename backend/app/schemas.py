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
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    full_name: Optional[str] = None
    is_active: bool = True
    
    class Config:
        from_attributes = True

class EmailUpdate(BaseModel):
    email: str

class PasswordUpdate(BaseModel):
    password: str
        
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

class GoalBase(BaseModel):
    name: str
    target_amount: float

class GoalCreate(GoalBase):
    pass
    
class GoalUpdate(BaseModel):
    amount: float

class Goal(GoalBase):
    id: int
    current_amount: float
    
    class Config:
        from_attributes = True

class HistoricalDataPoint(BaseModel):
    year: int
    month: int
    total_expenses: float
    total_income: float

class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str

class SpendingTrend(BaseModel):
    year: int
    month: int
    total_expenses: float
    total_income: float
    net_savings: float

class AnalyticsStats(BaseModel):
    total_expenses: float
    daily_average: float
    top_category: str
    transaction_count: int
    savings_rate: float

class AssetBase(BaseModel):
    name: str
    category: str
    current_value: float
    description: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int
    date_added: datetime
    
    class Config:
        from_attributes = True

class LiabilityBase(BaseModel):
    name: str
    category: str
    current_amount: float
    description: Optional[str] = None

class LiabilityCreate(LiabilityBase):
    pass

class Liability(LiabilityBase):
    id: int
    date_added: datetime
    
    class Config:
        from_attributes = True

class NetWorthSnapshot(BaseModel):
    id: int
    total_assets: float
    total_liabilities: float
    net_worth: float
    snapshot_date: datetime
    
    class Config:
        from_attributes = True

class NetWorthSummary(BaseModel):
    current_net_worth: float
    total_assets: float
    total_liabilities: float
    assets_breakdown: Dict[str, float]
    liabilities_breakdown: Dict[str, float]
    
    class Config:
        from_attributes = True