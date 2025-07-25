'use client';

import type { Expense } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useMemo } from 'react';

interface CategoryProgressProps {
  expenses: Expense[];
}

const CategoryProgress = ({ expenses }: CategoryProgressProps) => {
  const { currency } = useCurrency();

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return Object.entries(totals).sort(([, a], [, b]) => b - a);
  }, [expenses]);

  const totalSpent = useMemo(() => expenses.reduce((acc, exp) => acc + exp.amount, 0), [expenses]);

  if (expenses.length === 0) {
    return <div className="text-center text-gray-500 py-4">No expense data available for statistics.</div>;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Spending by Category</h3>
      {categoryTotals.map(([category, amount]) => {
        const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
        return (
          <div key={category}>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-semibold text-gray-700">{category}</span>
              <span className="font-medium text-gray-600">{formatCurrency(amount)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryProgress;