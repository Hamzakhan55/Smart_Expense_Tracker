from sqlalchemy.orm import Session
from . import models, schemas

def create_expense(db: Session, expense: schemas.ExpenseCreate):
    """
    Creates a new expense record in the database.
    """
    # 1. Convert the Pydantic schema object into a SQLAlchemy model object.
    #    **expense.model_dump() unpacks the data from the API into the model's fields.
    db_expense = models.Expense(**expense.model_dump())

    # 2. Add the new expense object to the database session (the "staging area").
    db.add(db_expense)

    # 3. Commit the transaction, saving the changes permanently to the database.
    db.commit()

    # 4. Refresh the object to get the new ID that the database assigned to it.
    db.refresh(db_expense)

    # 5. Return the newly created expense object.
    return db_expense