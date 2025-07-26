'use client';

import { useTransactions } from '@/hooks/useTransactions';
import StatsChart from '@/components/StatsChart';
import CategoryProgress from '@/components/CategoryProgress';

export default function StatisticsPage() {
  const { expenses, totalIncome, totalExpenses, isLoading, error } = useTransactions();

  if (isLoading) {
    return <div className="p-4 md:p-6">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">Error loading data.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Statistics</h1>
      
     
      <StatsChart totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <CategoryProgress expenses={expenses || []} />
    </div>
  );
}