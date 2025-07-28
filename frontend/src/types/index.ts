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