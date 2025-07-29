'use client';

import { useQuery } from '@tanstack/react-query';
import { getMonthlySummary, getRunningBalance } from '@/services/apiService';

export const useSummary = (year?: number, month?: number) => {
  const today = new Date();
  const queryYear = year || today.getFullYear();
  const queryMonth = month || today.getMonth() + 1;

  const monthlyQuery = useQuery({
    queryKey: ['summary', 'monthly', queryYear, queryMonth],
    queryFn: () => getMonthlySummary(queryYear, queryMonth),
  });

  const balanceQuery = useQuery({
    queryKey: ['summary', 'balance'],
    queryFn: getRunningBalance,
  });

  return {
    monthlySummary: monthlyQuery.data,
    runningBalance: balanceQuery.data,
    isLoading: monthlyQuery.isLoading || balanceQuery.isLoading,
    error: monthlyQuery.error || balanceQuery.error,
  };
};