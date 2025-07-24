from pydantic import BaseModel
from datetime import date
from typing import Optional

# This is the base "form" or "template" for an expense.
# All other expense schemas will inherit from this one.
class ExpenseBase(BaseModel):
    amount: int
    category: str
    description: Optional[str] = None # Optional means it can be null or empty

# This schema is used specifically when CREATING a new expense.
# It has the same fields as the base for now.
class ExpenseCreate(ExpenseBase):
    pass # 'pass' means there are no additional fields for now

# This is an important configuration class that tells Pydantic
# how to handle data from our database model later.
class Config:
    from_attributes = True

class Expense(ExpenseBase):
    id: int

    class Config:
        from_attributes = True