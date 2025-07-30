export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string; 
}

export type ExpenseCreate = Omit<Expense, 'id' | 'date'>;


export interface Income {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}
export type IncomeCreate = Omit<Income, 'id' | 'date'>;

export interface AiResponse {
  description: string;
  category: string;
  amount: number;
}

export interface User {
  id: number;
  email: string;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface ForecastResponse {
  total_forecast: number;
  by_category: { [key: string]: number };
}

export interface MonthlySummary {
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  net_balance: number;
}

export interface RunningBalance {
  total_balance: number;
}

export interface Budget {
  id: number;
  category: string;
  amount: number;
  year: number;
  month: number;
}

export type BudgetCreate = Omit<Budget, 'id'>;

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
}

export type GoalCreate = Omit<Goal, 'id' | 'current_amount'>;

export interface HistoricalDataPoint {
  year: number;
  month: number;
  total_expenses: number;
}