'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';
import { useMemo } from 'react';
import type { Expense } from '@/types';

const COLORS = ['#3b82f6', '#84cc16', '#ef4444', '#f97316', '#8b5cf6'];

export const CategoryBreakdownChart = ({ expenses }: { expenses: Expense[] }) => {
  const { currency } = useCurrency();
  const categoryData = useMemo(() => {
    const totals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as { [key: string]: number });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-80">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Category Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};