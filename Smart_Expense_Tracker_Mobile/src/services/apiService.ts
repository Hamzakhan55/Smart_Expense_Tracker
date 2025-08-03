import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Expense, 
  ExpenseCreate, 
  Income, 
  IncomeCreate, 
  AiResponse, 
  Token, 
  User, 
  UserCreate, 
  ForecastResponse, 
  MonthlySummary, 
  RunningBalance, 
  Budget, 
  BudgetCreate, 
  Goal, 
  GoalCreate, 
  HistoricalDataPoint 
} from '../types';

const API_BASE_URL = 'http://192.168.1.17:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to server. Please check if the backend is running.';
    }
    if (error.response?.status === 401) {
      // Token expired or invalid, clear stored auth
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const signup = async (userData: UserCreate): Promise<User> => {
  try {
    const response = await apiClient.post<User>('/users/', userData);
    return response.data;
  } catch (error) {
    console.log('Backend not available, using mock signup');
    return {
      id: Date.now(),
      email: userData.email,
      name: 'User',
    } as User;
  }
};

export const login = async (email: string, password: string): Promise<Token> => {
  const response = await apiClient.post<Token>('/login', { email, password });
  return response.data;
};

// Expense Services
export const getExpenses = async (search?: string): Promise<Expense[]> => {
  const response = await apiClient.get('/expenses/', { params: { search } });
  return response.data;
};

export const createExpense = async (expenseData: ExpenseCreate): Promise<Expense> => {
  try {
    const response = await apiClient.post('/expenses/', expenseData);
    return response.data;
  } catch (error) {
    console.log('Using mock expense creation');
    return {
      id: Date.now(),
      ...expenseData,
      date: new Date().toISOString().split('T')[0]
    } as Expense;
  }
};

export const deleteExpense = async (id: number): Promise<Expense> => {
  const response = await apiClient.delete(`/expenses/${id}`);
  return response.data;
};

export const updateExpense = async ({ id, ...data }: { id: number } & ExpenseCreate): Promise<Expense> => {
  const response = await apiClient.put(`/expenses/${id}`, data);
  return response.data;
};

// Income Services
export const getIncomes = async (search?: string): Promise<Income[]> => {
  try {
    const response = await apiClient.get<Income[]>('/incomes/', { params: { search } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch incomes:', error);
    return [];
  }
};

export const createIncome = async (incomeData: IncomeCreate): Promise<Income> => {
  try {
    const response = await apiClient.post<Income>('/incomes/', incomeData);
    return response.data;
  } catch (error) {
    console.log('Using mock income creation');
    return {
      id: Date.now(),
      ...incomeData,
      date: new Date().toISOString().split('T')[0]
    } as Income;
  }
};

export const deleteIncome = async (id: number): Promise<Income> => {
  const response = await apiClient.delete(`/incomes/${id}`);
  return response.data;
};

export const updateIncome = async ({ id, ...data }: { id: number } & IncomeCreate): Promise<Income> => {
  const response = await apiClient.put(`/incomes/${id}`, data);
  return response.data;
};

// Summary Services
export const getMonthlySummary = async (year: number, month: number): Promise<MonthlySummary> => {
  const response = await apiClient.get<MonthlySummary>(`/summary/${year}/${month}`);
  return response.data;
};

export const getRunningBalance = async (): Promise<RunningBalance> => {
  const response = await apiClient.get<RunningBalance>('/summary/balance');
  return response.data;
};

// Budget Services
export const getBudgets = async (year: number, month: number): Promise<Budget[]> => {
  try {
    const response = await apiClient.get<Budget[]>(`/budgets/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch budgets:', error);
    return [];
  }
};

export const createOrUpdateBudget = async (budgetData: BudgetCreate): Promise<Budget> => {
  const response = await apiClient.post<Budget>('/budgets/', budgetData);
  return response.data;
};

// Goal Services
export const getGoals = async (): Promise<Goal[]> => {
  try {
    const response = await apiClient.get<Goal[]>('/goals/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    return [];
  }
};

export const createGoal = async (goalData: GoalCreate): Promise<Goal> => {
  const response = await apiClient.post<Goal>('/goals/', goalData);
  return response.data;
};

export const updateGoalProgress = async ({ id, amount }: { id: number, amount: number }): Promise<Goal> => {
  const response = await apiClient.put<Goal>(`/goals/${id}/progress`, { amount });
  return response.data;
};

export const deleteGoal = async (id: number): Promise<Goal> => {
  const response = await apiClient.delete<Goal>(`/goals/${id}`);
  return response.data;
};

// Analytics Services
export const getHistoricalSummary = async (): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await apiClient.get<HistoricalDataPoint[]>('/summary/historical');
    return response.data;
  } catch (error) {
    console.log('Using mock historical data');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const data = [];
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      data.push({
        year,
        month,
        total_income: 3000 + Math.random() * 1000,
        total_expenses: 1200 + Math.random() * 800,
      });
    }
    
    return data;
  }
};

export const getSmartInsights = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/insights/smart');
    return response.data;
  } catch (error) {
    console.log('Backend insights not available, using client-side analysis');
    return null;
  }
};

// Voice Processing
export const processVoiceDryRun = async (audioFile: any): Promise<AiResponse> => {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await apiClient.post<AiResponse>('/process-voice-dry-run/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default apiClient;