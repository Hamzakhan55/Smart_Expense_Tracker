'use client';

import { useQuery } from '@tanstack/react-query';
import { getHistoricalSummary } from '@/services/apiService';
import { useTransactions } from '@/hooks/useTransactions';
import { useSummary } from '@/hooks/useSummary';
import { SpendingTrendChart } from '@/components/charts/SpendingTrendChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { FinancialHealthScore } from '@/components/FinancialHealthScore';

export default function AnalyticsPage() {
  const { data: historicalData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['summary', 'historical'],
    queryFn: getHistoricalSummary
  });
  
  const { expenses, isLoading: isLoadingTransactions } = useTransactions();
  const { monthlySummary, isLoading: isLoadingSummary } = useSummary();

  const isLoading = isLoadingHistory || isLoadingTransactions || isLoadingSummary;

  if (isLoading) {
    return <div className="p-6">Loading Analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {historicalData && <SpendingTrendChart data={historicalData} />}
        </div>
        <div className="lg:col-span-2">
          {expenses && <CategoryBreakdownChart expenses={expenses} />}
        </div>
      </div>
      
      <div>
        {monthlySummary && (
          <FinancialHealthScore 
            income={monthlySummary.total_income} 
            expenses={monthlySummary.total_expenses} 
          />
        )}
      </div>
    </div>
  );
}