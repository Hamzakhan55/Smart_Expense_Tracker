import axios from 'axios';
import { Expense, ExpenseCreate, Income, IncomeCreate, AiResponse, Token, User, UserCreate, ForecastResponse, MonthlySummary, RunningBalance, Budget, BudgetCreate, Goal, GoalCreate, HistoricalDataPoint } from '@/types'; 

let isOfflineMode = false;

// Check if backend is available
const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(500)
    });
    isOfflineMode = !response.ok;
    return response.ok;
  } catch {
    isOfflineMode = true;
    return false;
  }
};

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});



apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to server. Please check if the backend is running.';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const getExpenses = async (search?: string): Promise<Expense[]> => {
  try {
    const response = await apiClient.get('/expenses/', { params: { search } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    // Return empty array as fallback when backend is not available
    return [];
  }
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
      date: expenseData.date || new Date().toISOString().split('T')[0]
    } as Expense;
  }
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


export const getIncomes = async (search?: string): Promise<Income[]> => {
  try {
    const response = await apiClient.get<Income[]>('/incomes/', { params: { search } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch incomes:', error);
    // Return empty array as fallback when backend is not available
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
      date: incomeData.date || new Date().toISOString().split('T')[0]
    } as Income;
  }
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


export const signup = async (userData: UserCreate): Promise<User> => {
  // Check if backend is available first
  try {
    await fetch('http://127.0.0.1:8000/health', { 
      method: 'GET', 
      signal: AbortSignal.timeout(1000) 
    });
    // Backend is available, try real signup
    const response = await apiClient.post<User>('/users/', userData);
    return response.data;
  } catch (error) {
    console.log('Backend not available, using mock signup');
    // Mock user response
    return {
      id: Date.now(),
      email: userData.email,
      full_name: userData.full_name || 'User',
      is_active: true
    } as User;
  }
};

export const login = async (formData: FormData): Promise<Token> => {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  // Check if backend is available first
  try {
    await fetch('http://127.0.0.1:8000/health', { 
      method: 'GET', 
      signal: AbortSignal.timeout(1000) 
    });
    // Backend is available, try real login
    try {
      const response = await apiClient.post<Token>('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      // Try JSON approach
      const response = await apiClient.post<Token>('/login', {
        email: username,
        password: password
      });
      return response.data;
    }
  } catch (error) {
    console.log('Backend not available, using mock login');
    // Mock login for demo purposes
    if (username === 'demo@example.com' && password === 'demo123') {
      return {
        access_token: 'mock-jwt-token-' + Date.now(),
        token_type: 'bearer'
      };
    }
    // Allow any email/password for demo
    return {
      access_token: 'mock-jwt-token-' + Date.now(),
      token_type: 'bearer'
    };
  }
};


export const getForecast = async (): Promise<ForecastResponse> => {
  try {
    const response = await apiClient.get<ForecastResponse>('/expenses/forecast/');
    return response.data;
  } catch (error) {
    console.log('Using mock forecast data');
    return {
      forecast: [1200, 1300, 1250, 1400],
      confidence: 0.85
    } as ForecastResponse;
  }
};

export const getMonthlySummary = async (year: number, month: number): Promise<MonthlySummary> => {
  try {
    const response = await apiClient.get<MonthlySummary>(`/summary/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch monthly summary:', error);
    // Return default summary as fallback
    return {
      year,
      month,
      total_income: 0,
      total_expenses: 0,
      net_balance: 0
    };
  }
};

export const getRunningBalance = async (): Promise<RunningBalance> => {
  try {
    const response = await apiClient.get<RunningBalance>('/summary/balance');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch running balance:', error);
    // Return default balance as fallback
    return { total_balance: 0 };
  }
};

export const getBudgets = async (year: number, month: number): Promise<Budget[]> => {
  try {
    const response = await apiClient.get<Budget[]>(`/budgets/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch budgets:', error);
    // Return empty array as fallback
    return [];
  }
};

export const createOrUpdateBudget = async (budgetData: BudgetCreate): Promise<Budget> => {
  const response = await apiClient.post<Budget>('/budgets/', budgetData);
  return response.data;
};

export const getGoals = async (): Promise<Goal[]> => {
  try {
    const response = await apiClient.get<Goal[]>('/goals/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    // Return empty array as fallback
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
        net_balance: data[data.length - 1]?.total_income - data[data.length - 1]?.total_expenses || 0
      });
    }
    
    return data;
  }
};

export const getExpensesByMonth = async (year: number, month: number): Promise<Expense[]> => {
  try {
    const response = await apiClient.get<Expense[]>(`/expenses/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.log('Using filtered expenses for month');
    // Fallback to filtering all expenses
    const allExpenses = await getExpenses();
    return allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month;
    });
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

export const updateEmail = async (newEmail: string): Promise<User> => {
  const response = await apiClient.put<User>('/users/email', { email: newEmail });
  return response.data;
};

export const updatePassword = async (newPassword: string): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>('/users/password', { password: newPassword });
  return response.data;
};

