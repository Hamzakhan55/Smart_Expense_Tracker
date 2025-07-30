'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudgets, createOrUpdateBudget, getExpenses } from '@/services/apiService';
import { useMemo } from 'react';
import type { BudgetCreate } from '@/types';

export const useBudgets = (year: number, month: number) => {
  const queryClient = useQueryClient();

  const { data: budgets, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ['budgets', year, month],
    queryFn: () => getBudgets(year, month),
  });

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => getExpenses(),
  });
  
  const spendingByCategory = useMemo(() => {
    const monthlyExpenses = expenses?.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
    }) ?? [];

    return monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
  }, [expenses, year, month]);

  const budgetMutation = useMutation({
    mutationFn: createOrUpdateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', year, month] });
    },
  });

  return {
    budgets,
    spendingByCategory,
    setBudget: budgetMutation.mutate,
    isSettingBudget: budgetMutation.isPending,
    isLoading: isLoadingBudgets || isLoadingExpenses,
  };
};