'use client';

import { useSummary } from '@/hooks/useSummary';
import { useCurrency } from '@/context/CurrencyContext';
import TransactionList from '@/components/TransactionList';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, amount, icon: Icon, gradient, change }: { 
  title: string; 
  amount: number; 
  icon: React.ElementType; 
  gradient: string;
  change?: string;
}) => {
  const { currency } = useCurrency();
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 2
  }).format(value);

  return (
    <div className={`${gradient} text-white p-6 rounded-2xl shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium opacity-90">{title}</h3>
        <Icon size={24} className="opacity-80" />
      </div>
      <p className="text-3xl font-bold mb-2">{formatCurrency(amount)}</p>
      {change && (
        <p className="text-sm opacity-80">{change}</p>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const { monthlySummary, runningBalance, isLoading, error } = useSummary();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  const { monthlySummary: lastMonthlySummary } = useSummary(lastMonthYear, lastMonth);

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Calculate savings rate
  const savingsRate = monthlySummary?.total_income ? 
    ((monthlySummary.total_income - monthlySummary.total_expenses) / monthlySummary.total_income) * 100 : 0;

  if (isLoading) {
    return <div className="p-4">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading dashboard data. Please try again later.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Net Worth" 
          amount={runningBalance?.total_balance ?? 0}
          icon={Wallet}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          change={lastMonthlySummary ? 
            `${calculateChange(runningBalance?.total_balance ?? 0, (lastMonthlySummary.total_income - lastMonthlySummary.total_expenses))} from last month` : 
            'No previous data'}
        />
        <StatCard 
          title="Monthly Income" 
          amount={monthlySummary?.total_income ?? 0}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          change={lastMonthlySummary ? 
            `${calculateChange(monthlySummary?.total_income ?? 0, lastMonthlySummary.total_income)} from last month` : 
            'No previous data'}
        />
        <StatCard 
          title="Monthly Expenses" 
          amount={monthlySummary?.total_expenses ?? 0}
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          change={lastMonthlySummary ? 
            `${calculateChange(monthlySummary?.total_expenses ?? 0, lastMonthlySummary.total_expenses)} from last month` : 
            'No previous data'}
        />
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium opacity-90">Savings Rate</h3>
            <div className="w-6 h-6 rounded-full border-2 border-white opacity-80 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">{savingsRate.toFixed(1)}%</p>
          <p className="text-sm opacity-80">Target: 20%</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>
        <div className="bg-white dark:bg-gray-800 p-2 md:p-4 rounded-xl shadow-sm">
          <TransactionList filter="all" />
        </div>
      </div>
    </div>
  );
}