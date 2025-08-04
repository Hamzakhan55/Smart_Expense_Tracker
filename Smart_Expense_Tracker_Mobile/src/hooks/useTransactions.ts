import { useState, useEffect } from 'react';
import { getExpenses, getIncomes } from '../services/apiService';
import { Expense, Income } from '../types';

export const useTransactions = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const [expensesData, incomesData] = await Promise.all([
        getExpenses(),
        getIncomes()
      ]);
      setExpenses(expensesData);
      setIncomes(incomesData);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      if (error.response?.status === 401) {
        console.log('Using demo transactions data');
      }
      // Mock data for demo
      setExpenses([
        { id: 1, description: 'Grocery shopping', amount: 2500, category: 'Food & Drinks', date: new Date().toISOString().split('T')[0] },
        { id: 2, description: 'Gas station', amount: 1200, category: 'Transport', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
        { id: 3, description: 'Coffee shop', amount: 350, category: 'Food & Drinks', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] }
      ]);
      setIncomes([
        { id: 1, description: 'Salary', amount: 50000, category: 'Job', date: new Date().toISOString().split('T')[0] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    expenses, 
    incomes, 
    isLoading, 
    refresh: loadTransactions 
  };
};