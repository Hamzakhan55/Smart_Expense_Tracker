'use client';
import { useState } from 'react'; 
import { useTransactions } from '@/hooks/useTransactions';
import { useForecast } from '@/hooks/useForecast';
import { Wallet, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import TransactionList from '@/components/TransactionList';
import ForecastCard from '@/components/ForecastCard';
import { useCurrency } from '@/context/CurrencyContext';

export default function HomePage() {
  const { totalExpenses, totalIncome, isLoading, error } = useTransactions();
  const { data: forecastData } = useForecast();
  const { currency } = useCurrency();
  const [filter, setFilter] = useState<'income' | 'expense' | 'all'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency, 
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error fetching data. Please try again later.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Smart Expense Tracker</h1>
        <div className="text-gray-600 font-semibold">July 2025</div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg opacity-90">Total Balance</span>
            <Wallet className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold tracking-tight">
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>

        {/* Income and Expense Cards */}
        <div className="grid grid-cols-2 gap-4"><div
            className={`p-4 rounded-xl shadow cursor-pointer hover:scale-[1.03] transition-all ${filter === 'income' ? 'bg-green-100 ring-2 ring-green-500' : 'bg-white'}`}
            onClick={() => setFilter('income')} >
            <div className="flex items-center text-green-500 mb-1">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <p className="text-xl font-semibold">{formatCurrency(totalIncome)}</p>
          </div>
          <div 
            className={`p-4 rounded-xl shadow cursor-pointer hover:scale-[1.03] transition-all ${filter === 'expense' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-white'}`}
            onClick={() => setFilter('expense')} // 3. Click to filter by expense
            >
              <div className="flex items-center text-red-500 mb-1">
              <TrendingDown className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Expenses</span>
            </div>
            <p className="text-xl font-semibold">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <Eye size={16} /> Show All
            </button>
          )}
        </div>
        <div className="bg-white p-2 md:p-4 rounded-xl shadow">
          <TransactionList filter={filter} />
        </div>
      </div>
    </div>
  );
}