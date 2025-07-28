import axios from 'axios';
import { Expense, ExpenseCreate, Income, IncomeCreate, AiResponse } from '@/types';


const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', 
});


export const getExpenses = async (): Promise<Expense[]> => {
  const response = await apiClient.get('/expenses/');
  return response.data;
};


export const createExpense = async (expenseData: ExpenseCreate): Promise<Expense> => {
  const response = await apiClient.post('/expenses/', expenseData);
  return response.data;
};


export const processVoiceExpense = async (audioFile: File): Promise<Expense> => {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await apiClient.post('/process-voice/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
  return response.data;
};


export const getIncomes = async (): Promise<Income[]> => {
  const response = await apiClient.get<Income[]>('/incomes/');
  return response.data;
};


export const createIncome = async (incomeData: IncomeCreate): Promise<Income> => {
  const response = await apiClient.post<Income>('/incomes/', incomeData);
  return response.data;
};

export const deleteExpense = async (id: number): Promise<Expense> => {
  const response = await apiClient.delete(`/expenses/${id}`);
  return response.data;
};

export const deleteIncome = async (id: number): Promise<Income> => {
  const response = await apiClient.delete(`/incomes/${id}`);
  return response.data;
};

export const updateExpense = async ({ id, ...data }: { id: number } & ExpenseCreate): Promise<Expense> => {
  const response = await apiClient.put(`/expenses/${id}`, data);
  return response.data;
};

export const updateIncome = async ({ id, ...data }: { id: number } & IncomeCreate): Promise<Income> => {
  const response = await apiClient.put(`/incomes/${id}`, data);
  return response.data;
};

export const deleteAllTransactions = async (): Promise<void> => {
  await apiClient.delete('/transactions/all');
};


export const processVoiceDryRun = async (audioFile: File): Promise<AiResponse> => {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await apiClient.post<AiResponse>('/process-voice-dry-run/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};