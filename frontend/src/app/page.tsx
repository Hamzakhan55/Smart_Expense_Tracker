'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { Wallet, TrendingUp, TrendingDown, EyeOff } from 'lucide-react';

export default function HomePage() {
  const { totalExpenses, totalIncome, isLoading, error } = useTransactions();

  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'Pkr', 
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
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center text-green-500 mb-1">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <p className="text-xl font-semibold">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
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
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-center text-gray-500">Transaction list will go here.</p>
          {/* We will build the transaction list component in the next step */}
        </div>
      </div>
    </div>
  );
}