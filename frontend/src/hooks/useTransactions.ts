'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, getIncomes, createExpense, createIncome } from '@/services/apiService';
import { ExpenseCreate, IncomeCreate } from '@/types'; // Ensure your types are in @/types/index.ts

export const useTransactions = () => {
  // 1. Get the query client instance from the provider
  const queryClient = useQueryClient();

  // --- QUERIES (for fetching data) ---

  const { data: expenses, isLoading: isLoadingExpenses, error: errorExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  });

  const { data: incomes, isLoading: isLoadingIncomes, error: errorIncomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: getIncomes,
  });


  // --- MUTATIONS (for changing data) ---

  // Mutation for creating an expense
  const createExpenseMutation = useMutation({
    mutationFn: createExpense, // The API function to call
    onSuccess: () => {
      // When the API call is successful, tell TanStack Query to re-fetch the expenses
      console.log("Expense created, invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      console.error("Error creating expense:", error);
      // You could add a toast notification here
    }
  });

  // Mutation for creating an income
  const createIncomeMutation = useMutation({
    mutationFn: createIncome, // The API function to call
    onSuccess: () => {
      // When the API call is successful, tell TanStack Query to re-fetch the incomes
      console.log("Income created, invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
     onError: (error) => {
      console.error("Error creating income:", error);
    }
  });


  // --- CALCULATIONS ---

  const totalExpenses = expenses?.reduce((acc, expense) => acc + expense.amount, 0) ?? 0;
  const totalIncome = incomes?.reduce((acc, income) => acc + income.amount, 0) ?? 0;


  // --- RETURN VALUE ---

  return {
    // Queries
    expenses,
    incomes,
    totalExpenses,
    totalIncome,
    isLoading: isLoadingExpenses || isLoadingIncomes,
    error: errorExpenses || errorIncomes,
    
    // Mutations
    addExpense: createExpenseMutation.mutate, // Expose the mutate function
    addIncome: createIncomeMutation.mutate,   // Expose the mutate function
    isCreating: createExpenseMutation.isPending || createIncomeMutation.isPending, // Expose a loading state for the form
  };
};