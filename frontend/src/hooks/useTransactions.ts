'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, getIncomes, createExpense, createIncome, deleteExpense, deleteIncome, updateExpense, updateIncome, deleteAllTransactions, processVoiceDryRun } from '@/services/apiService';
import { useMemo } from 'react';
import type { Expense, Income, AiResponse } from '@/types';


export const useTransactions = (search?: string) => {
  const queryClient = useQueryClient();

  const { data: expenses, isLoading: isLoadingExpenses, error: errorExpenses } = useQuery({
    queryKey: ['expenses', search],
    queryFn: () => getExpenses(search),
  });

  const { data: incomes, isLoading: isLoadingIncomes, error: errorIncomes } = useQuery({
    queryKey: ['incomes', search],
    queryFn: () => getIncomes(search),
  });

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onMutate: async (newExpense) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['expenses'] });
      await queryClient.cancelQueries({ queryKey: ['summary', 'monthly', currentYear, currentMonth] });
      await queryClient.cancelQueries({ queryKey: ['summary', 'balance'] });
      
      // Snapshot previous values
      const previousExpenses = queryClient.getQueryData(['expenses']);
      const previousMonthlySummary = queryClient.getQueryData(['summary', 'monthly', currentYear, currentMonth]);
      const previousBalance = queryClient.getQueryData(['summary', 'balance']);
      
      // Optimistically update expenses
      queryClient.setQueryData(['expenses'], (old: any) => {
        if (!old) return [{ ...newExpense, id: Date.now(), date: new Date().toISOString() }];
        return [...old, { ...newExpense, id: Date.now(), date: new Date().toISOString() }];
      });
      
      // Optimistically update monthly summary
      queryClient.setQueryData(['summary', 'monthly', currentYear, currentMonth], (old: any) => {
        if (!old) return { total_expenses: newExpense.amount, total_income: 0, net_balance: -newExpense.amount };
        return { ...old, total_expenses: old.total_expenses + newExpense.amount, net_balance: old.total_income - (old.total_expenses + newExpense.amount) };
      });
      
      // Optimistically update running balance
      queryClient.setQueryData(['summary', 'balance'], (old: any) => {
        if (!old) return { total_balance: -newExpense.amount };
        return { ...old, total_balance: old.total_balance - newExpense.amount };
      });
      
      return { previousExpenses, previousMonthlySummary, previousBalance };
    },
    onError: (err, newExpense, context) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      // Rollback on error
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses'], context.previousExpenses);
      }
      if (context?.previousMonthlySummary) {
        queryClient.setQueryData(['summary', 'monthly', currentYear, currentMonth], context.previousMonthlySummary);
      }
      if (context?.previousBalance) {
        queryClient.setQueryData(['summary', 'balance'], context.previousBalance);
      }
      console.error("Error creating expense:", err);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const createIncomeMutation = useMutation({
    mutationFn: createIncome,
    onMutate: async (newIncome) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      await queryClient.cancelQueries({ queryKey: ['incomes'] });
      await queryClient.cancelQueries({ queryKey: ['summary', 'monthly', currentYear, currentMonth] });
      await queryClient.cancelQueries({ queryKey: ['summary', 'balance'] });
      
      const previousIncomes = queryClient.getQueryData(['incomes']);
      const previousMonthlySummary = queryClient.getQueryData(['summary', 'monthly', currentYear, currentMonth]);
      const previousBalance = queryClient.getQueryData(['summary', 'balance']);
      
      queryClient.setQueryData(['incomes'], (old: any) => {
        if (!old) return [{ ...newIncome, id: Date.now(), date: new Date().toISOString() }];
        return [...old, { ...newIncome, id: Date.now(), date: new Date().toISOString() }];
      });
      
      queryClient.setQueryData(['summary', 'monthly', currentYear, currentMonth], (old: any) => {
        if (!old) return { total_income: newIncome.amount, total_expenses: 0, net_balance: newIncome.amount };
        return { ...old, total_income: old.total_income + newIncome.amount, net_balance: (old.total_income + newIncome.amount) - old.total_expenses };
      });
      
      queryClient.setQueryData(['summary', 'balance'], (old: any) => {
        if (!old) return { total_balance: newIncome.amount };
        return { ...old, total_balance: old.total_balance + newIncome.amount };
      });
      
      return { previousIncomes, previousMonthlySummary, previousBalance };
    },
    onError: (err, newIncome, context) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      if (context?.previousIncomes) {
        queryClient.setQueryData(['incomes'], context.previousIncomes);
      }
      if (context?.previousMonthlySummary) {
        queryClient.setQueryData(['summary', 'monthly', currentYear, currentMonth], context.previousMonthlySummary);
      }
      if (context?.previousBalance) {
        queryClient.setQueryData(['summary', 'balance'], context.previousBalance);
      }
      console.error("Error creating income:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.refetchQueries({ queryKey: ['summary'] });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.refetchQueries({ queryKey: ['summary'] });
    },
  });

  const processVoiceMutation = useMutation<AiResponse, Error, File>({
    mutationFn: processVoiceDryRun, // It calls the dry run function
    // We remove the onSuccess here because we are not invalidating queries anymore.
    // The success will be handled in the component that calls this mutation.
    onError: (error) => {
      console.error("Error processing voice expense:", error);
      alert("Sorry, we couldn't understand that. Please try again.");
    }
  });

  // --- NEW: UPDATE MUTATIONS ---
  const updateExpenseMutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.refetchQueries({ queryKey: ['summary'] });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: updateIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.refetchQueries({ queryKey: ['summary'] });
    },
  });


  const deleteAllMutation = useMutation({
    mutationFn: deleteAllTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const totalExpenses = expenses?.reduce((acc, expense) => acc + expense.amount, 0) ?? 0;
  const totalIncome = incomes?.reduce((acc, income) => acc + income.amount, 0) ?? 0;

  const allTransactions = useMemo(() => {
    const combined = [
      ...(incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []),
      ...(expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
    ];

    combined.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
    return combined;
  }, [incomes, expenses]);

  return {
    expenses,
    incomes,
    allTransactions,
    totalExpenses,
    totalIncome,
    isLoading: isLoadingExpenses || isLoadingIncomes,
    error: errorExpenses || errorIncomes,
    
    addExpense: createExpenseMutation.mutate,
    addIncome: createIncomeMutation.mutate,
    isCreating: createExpenseMutation.isPending || createIncomeMutation.isPending,
    
    removeExpense: deleteExpenseMutation.mutate,
    removeIncome: deleteIncomeMutation.mutate,
    editExpense: updateExpenseMutation.mutate,
    editIncome: updateIncomeMutation.mutate,
    isUpdating: updateExpenseMutation.isPending || updateIncomeMutation.isPending,
    clearAllTransactions: deleteAllMutation.mutate,
    processVoice: processVoiceMutation.mutate,
    isProcessingVoice: processVoiceMutation.isPending,

  };
};



