'use client';

import { useQuery } from '@tanstack/react-query';
import { getExpenses, getIncomes } from '@/services/apiService';

export const useTransactions = () => {
  const { data: expenses, isLoading: isLoadingExpenses, error: errorExpenses } = useQuery({
    queryKey: ['expenses'], 
    queryFn: getExpenses,   
  });

  const { data: incomes, isLoading: isLoadingIncomes, error: errorIncomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: getIncomes,
  });

  // Calculate totals
  const totalExpenses = expenses?.reduce((acc, expense) => acc + expense.amount, 0) ?? 0;
  const totalIncome = incomes?.reduce((acc, income) => acc + income.amount, 0) ?? 0;

  return {
    expenses,
    incomes,
    totalExpenses,
    totalIncome,
    isLoading: isLoadingExpenses || isLoadingIncomes,
    error: errorExpenses || errorIncomes,
  };
};