import { useState, useEffect } from 'react';
import { getMonthlySummary } from '../services/apiService';

interface MonthlySummary {
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  net_balance: number;
}

export const useSummary = (year: number, month: number) => {
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [year, month]);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const summary = await getMonthlySummary(year, month);
      setMonthlySummary(summary);
    } catch (error: any) {
      console.error('Failed to load summary:', error);
      if (error.response?.status === 401) {
        console.log('Using demo summary data');
      }
      // Mock data for demo
      setMonthlySummary({
        year,
        month,
        total_income: 50000,
        total_expenses: 32000,
        net_balance: 18000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { monthlySummary, isLoading, refresh: loadSummary };
};