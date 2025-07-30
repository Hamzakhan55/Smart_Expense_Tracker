'use client';

import { useCurrency } from '@/context/CurrencyContext';

interface BudgetCardProps {
  category: string;
  budget: number;
  spent: number;
}

const BudgetCard = ({ category, budget, spent }: BudgetCardProps) => {
  const { currency } = useCurrency();
  const remaining = budget - spent;
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{category}</h3>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Monthly</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Spent</span><span className="text-gray-800 dark:text-white">{formatCurrency(spent)}</span></div>
        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Budget</span><span className="text-gray-800 dark:text-white">{formatCurrency(budget)}</span></div>
        <hr className="border-gray-200 dark:border-gray-700"/>
        <div className={`flex justify-between font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>Remaining</span><span>{formatCurrency(remaining)}</span>
        </div>
      </div>
      <div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
        <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">{percentage.toFixed(1)}% of budget used</p>
      </div>
    </div>
  );
};

export default BudgetCard;