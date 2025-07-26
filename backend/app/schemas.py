from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExpenseBase(BaseModel):
    amount: int
    category: str
    description: Optional[str] = None #


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
    amount: int
    category: str
    description: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class Income(IncomeBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True