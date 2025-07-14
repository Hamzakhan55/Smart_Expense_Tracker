from fastapi import FastAPI

# Create an instance of the FastAPI class
app = FastAPI(title="Smart Expense Tracker API")

# Define a "route" for the root URL
@app.get("/", tags=["Root"])
async def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"message": "Welcome to the Smart Expense Tracker API!"}