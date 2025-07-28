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