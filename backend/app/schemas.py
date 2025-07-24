from pydantic import BaseModel
from datetime import date
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

    class Config:
        from_attributes = True