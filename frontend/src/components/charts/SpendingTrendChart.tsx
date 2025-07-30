'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';
import type { HistoricalDataPoint } from '@/types';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const SpendingTrendChart = ({ data }: { data: HistoricalDataPoint[] }) => {
  const { currency } = useCurrency();
  const chartData = data.map(d => ({
    name: monthNames[d.month - 1],
    Expenses: d.total_expenses
  }));

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(value);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-80">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">6-Month Spending Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatCurrency} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="Expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};