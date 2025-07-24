import axios from 'axios';
import { Expense, ExpenseCreate } from '@/types/expense';


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