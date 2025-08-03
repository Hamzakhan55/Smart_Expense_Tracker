@echo off
echo Setting up demo data for Smart Expense Tracker...

cd backend

echo Creating demo user...
python create_demo_user.py

echo Adding sample transactions...
python add_sample_transactions.py

echo Demo data setup complete!
echo.
echo Demo credentials:
echo Email: demo@example.com
echo Password: demo123
echo.
pause