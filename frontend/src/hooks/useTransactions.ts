'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, getIncomes, createExpense, createIncome, deleteExpense, deleteIncome, processVoiceExpense, updateExpense, updateIncome } from '@/services/apiService';
import { useMemo } from 'react';
import type { Expense, Income } from '@/types';

export const useTransactions = () => {
  const queryClient = useQueryClient();

  const { data: expenses, isLoading: isLoadingExpenses, error: errorExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  });

  const { data: incomes, isLoading: isLoadingIncomes, error: errorIncomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: getIncomes,
  });

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: (newExpense) => {
      queryClient.setQueryData(['expenses'], (old: Expense[] | undefined) => 
        old ? [newExpense, ...old] : [newExpense]
      );
    },
    onError: (error) => {
      console.error("Error creating expense:", error);
    }
  });

  const createIncomeMutation = useMutation({
    mutationFn: createIncome,
    onSuccess: (newIncome) => {
      queryClient.setQueryData(['incomes'], (old: Income[] | undefined) => 
        old ? [newIncome, ...old] : [newIncome]
      );
    },
    onError: (error) => {
      console.error("Error creating income:", error);
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });

  const processVoiceMutation = useMutation({
    mutationFn: processVoiceExpense,
    onSuccess: (newExpense) => {
      queryClient.setQueryData(['expenses'], (old: Expense[] | undefined) => 
        old ? [newExpense, ...old] : [newExpense]
      );
    },
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
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: updateIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
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
    addExpenseFromVoice: processVoiceMutation.mutate,
    isProcessingVoice: processVoiceMutation.isPending,
    editExpense: updateExpenseMutation.mutate,
    editIncome: updateIncomeMutation.mutate,
    isUpdating: updateExpenseMutation.isPending || updateIncomeMutation.isPending,
  };
};



