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

// For mobile development, use your computer's IP address
const API_BASE_URL = 'http://192.168.1.25:8000';

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
    if (error.response?.status === 401) {
      // Token expired or invalid, clear stored auth silently
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.log('Network error detected, using offline mode');
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
      full_name: userData.full_name || 'User',
      is_active: true
    } as User;
  }
};

export const login = async (email: string, password: string): Promise<Token> => {
  try {
    const response = await apiClient.post<Token>('/login', { email, password });
    return response.data;
  } catch (error) {
    console.log('Backend not available, using mock login');
    return {
      access_token: 'mock-jwt-token-' + Date.now(),
      token_type: 'bearer'
    };
  }
};

export const updateEmail = async (newEmail: string): Promise<User> => {
  try {
    const response = await apiClient.put<User>('/users/email', { email: newEmail });
    return response.data;
  } catch (error) {
    console.log('Backend not available for email update, using mock response');
    const currentUser = await AsyncStorage.getItem('user');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      user.email = newEmail;
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }
    return { id: 1, name: 'User', email: newEmail };
  }
};

export const updatePassword = async (newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.put<{ message: string }>('/users/password', { password: newPassword });
    return response.data;
  } catch (error) {
    console.log('Backend not available for password update, using mock response');
    return { message: 'Password updated successfully (demo mode)' };
  }
};

// Expense Services
export const getExpenses = async (search?: string): Promise<Expense[]> => {
  try {
    const response = await apiClient.get('/expenses/', { params: { search } });
    return response.data;
  } catch (error) {
    console.log('Using mock expenses data');
    return [];
  }
};

export const createExpense = async (expenseData: ExpenseCreate): Promise<Expense> => {
  const response = await apiClient.post('/expenses/', expenseData);
  return response.data;
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
  const response = await apiClient.get<Income[]>('/incomes/', { params: { search } });
  return response.data;
};

export const createIncome = async (incomeData: IncomeCreate): Promise<Income> => {
  const response = await apiClient.post<Income>('/incomes/', incomeData);
  return response.data;
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
  try {
    const response = await apiClient.get<MonthlySummary>(`/summary/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.log('Using mock summary data');
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
    console.log('Using mock balance data');
    return { total_balance: 0 };
  }
};

// Budget Services
export const getBudgets = async (year: number, month: number): Promise<Budget[]> => {
  try {
    const response = await apiClient.get<Budget[]>(`/budgets/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.log('Using mock budgets data');
    return [
      { id: 1, category: 'Food', amount: 500, year, month },
      { id: 2, category: 'Transportation', amount: 300, year, month },
      { id: 3, category: 'Entertainment', amount: 200, year, month },
      { id: 4, category: 'Shopping', amount: 400, year, month },
      { id: 5, category: 'Bills', amount: 1000, year, month },
    ];
  }
};

export const createOrUpdateBudget = async (budgetData: BudgetCreate): Promise<Budget> => {
  try {
    const response = await apiClient.post<Budget>('/budgets/', budgetData);
    return response.data;
  } catch (error) {
    console.log('Backend not available, creating mock budget');
    return {
      id: Date.now(),
      ...budgetData
    };
  }
};

export const deleteBudget = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/budgets/${id}`);
  } catch (error) {
    console.log('Backend not available, mock delete');
  }
};

export const getExpensesByMonth = async (year: number, month: number): Promise<Expense[]> => {
  try {
    const response = await apiClient.get<Expense[]>(`/expenses/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.log('Backend not available, using filtered expenses');
    const allExpenses = await getExpenses();
    return allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    });
  }
};

// Goal Services
export const getGoals = async (): Promise<Goal[]> => {
  try {
    const response = await apiClient.get<Goal[]>('/goals/');
    return response.data;
  } catch (error) {
    console.log('Using mock goals data');
    return [
      { id: 1, name: 'Emergency Fund', target_amount: 10000, current_amount: 7500 },
      { id: 2, name: 'Vacation', target_amount: 3000, current_amount: 1200 },
      { id: 3, name: 'New Car', target_amount: 25000, current_amount: 5000 },
    ];
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
export const getHistoricalSummary = async (months: number = 6): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await apiClient.get<HistoricalDataPoint[]>(`/summary/historical?months=${months}`);
    return response.data;
  } catch (error) {
    console.log('Using mock historical data');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
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

export const getCategoryBreakdown = async (months: number = 6): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/analytics/category-breakdown?months=${months}`);
    return response.data;
  } catch (error) {
    console.log('Using mock category data');
    return [
      { category: 'Food & Drinks', amount: 450, percentage: 30, color: '#EF4444' },
      { category: 'Transport', amount: 300, percentage: 20, color: '#F59E0B' },
      { category: 'Shopping', amount: 225, percentage: 15, color: '#10B981' },
      { category: 'Entertainment', amount: 150, percentage: 10, color: '#3B82F6' },
      { category: 'Bills & Fees', amount: 375, percentage: 25, color: '#8B5CF6' }
    ];
  }
};

export const getSpendingTrends = async (months: number = 6): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/analytics/spending-trends?months=${months}`);
    return response.data;
  } catch (error) {
    console.log('Using mock spending trends');
    return await getHistoricalSummary(months);
  }
};

export const getAnalyticsStats = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/analytics/stats');
    return response.data;
  } catch (error) {
    console.log('Using mock analytics stats');
    return {
      total_expenses: 2500,
      daily_average: 83.33,
      top_category: 'Food & Drinks',
      transaction_count: 45,
      savings_rate: 25.5
    };
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



// Enhanced voice processing with better parsing
const parseVoiceText = (text: string): AiResponse => {
  const lowerText = text.toLowerCase();
  
  // Extract amount using multiple patterns
  let amount = 0;
  const amountPatterns = [
    /(?:for|cost|paid|spent|worth)\s*(?:rs\.?|rupees?)\s*(\d+(?:\.\d+)?)/i,
    /(?:rs\.?|rupees?)\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:rs\.?|rupees?)/i,
    /(\d+(?:\.\d+)?)\s*(?:dollars?|usd|\$)/i,
    /\$\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)(?=\s|$)/g // fallback: any number
  ];
  
  for (const pattern of amountPatterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      amount = parseFloat(match[1]);
      if (amount > 0) break;
    }
  }
  
  // Category prediction based on keywords
  const categoryMap = {
    'Food & Drinks': ['pizza', 'food', 'restaurant', 'meal', 'lunch', 'dinner', 'breakfast', 'coffee', 'drink', 'burger', 'sandwich', 'snack'],
    'Transport': ['uber', 'taxi', 'bus', 'train', 'metro', 'fuel', 'petrol', 'gas', 'parking', 'transport'],
    'Shopping': ['shopping', 'clothes', 'shirt', 'shoes', 'bag', 'purchase', 'buy', 'bought', 'store', 'mall'],
    'Entertainment': ['movie', 'cinema', 'game', 'concert', 'show', 'entertainment', 'fun', 'party'],
    'Bills & Fees': ['bill', 'electricity', 'water', 'internet', 'phone', 'rent', 'fee', 'subscription'],
    'Healthcare': ['doctor', 'medicine', 'hospital', 'pharmacy', 'health', 'medical', 'clinic'],
    'Education': ['book', 'course', 'class', 'school', 'college', 'education', 'tuition', 'study']
  };
  
  let category = 'Other';
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Clean up description
  let description = text.trim();
  if (description.length > 100) {
    description = description.substring(0, 100) + '...';
  }
  
  return { description, category, amount };
};

// Voice Processing
export const processVoiceDryRun = async (formData: FormData): Promise<AiResponse> => {
  try {
    console.log('Sending voice data to backend...');
    const response = await apiClient.post<AiResponse>('/process-voice-dry-run/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    console.log('Backend response:', response.data);
    
    // Validate and enhance backend response
    const result = response.data;
    if (!result.amount || result.amount === 0) {
      // Try to parse amount from description if backend failed
      const parsed = parseVoiceText(result.description || '');
      result.amount = parsed.amount || result.amount;
    }
    
    if (!result.category || result.category === 'Other') {
      // Try to predict category if backend failed
      const parsed = parseVoiceText(result.description || '');
      result.category = parsed.category !== 'Other' ? parsed.category : result.category;
    }
    
    return result;
  } catch (error: any) {
    console.error('Voice processing error:', error.response?.data || error.message);
    
    // Check if it's a transcription error from backend
    if (error.response?.data?.detail) {
      console.log('Backend transcription failed:', error.response.data.detail);
      return {
        description: 'Voice transcription failed - please verify details',
        category: 'Other',
        amount: 0
      };
    }
    
    console.log('Backend not available, using client-side fallback');
    return {
      description: 'Voice recorded - please verify details',
      category: 'Other',
      amount: 0
    };
  }
};

export const processVoiceExpense = async (formData: FormData): Promise<Expense> => {
  try {
    const response = await apiClient.post<Expense>('/process-voice/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('Voice expense processing failed:', error);
    throw new Error('Failed to process voice expense');
  }
};

export default apiClient;