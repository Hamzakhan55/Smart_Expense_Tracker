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
    onSuccess: () => {
      // Force immediate refetch of all related data
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['summary'] });
      queryClient.refetchQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      console.error("Error creating expense:", error);
    }
  });

  const createIncomeMutation = useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      // Force immediate refetch of all related data
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['summary'] });
      queryClient.refetchQueries({ queryKey: ['incomes'] });
    },
    onError: (error) => {
      console.error("Error creating income:", error);
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



