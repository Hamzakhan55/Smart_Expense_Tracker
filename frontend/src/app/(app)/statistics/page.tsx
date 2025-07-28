'use client';

import { useTransactions } from '@/hooks/useTransactions';
import StatsChart from '@/components/StatsChart';
import CategoryProgress from '@/components/CategoryProgress';
import { useForecast } from '@/hooks/useForecast';
import ForecastCard from '@/components/ForecastCard';

export default function StatisticsPage() {
  const { expenses, totalIncome, totalExpenses, isLoading, error } = useTransactions();
  const { data: forecastData, isLoading: isLoadingForecast, error: forecastError } = useForecast();


  if (isLoading || isLoadingForecast) {
    return <div className="p-4 md:p-6">Loading statistics and forecast...</div>;
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">Error loading data.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Statistics</h1>
      {forecastData && !forecastError && <ForecastCard data={forecastData} />}

     
      <StatsChart totalIncome={totalIncome} totalExpenses={totalExpenses} />

      {expenses && <CategoryProgress expenses={expenses} />}
    </div>
  );
}