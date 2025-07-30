'use client';

import type { Goal } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { Target } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

const GoalCard = ({ goal, onClick }: GoalCardProps) => {
  const { currency } = useCurrency();
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const remaining = goal.target_amount - goal.current_amount;

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

  return (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{goal.name}</h3>
        <Target className="text-gray-400" />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between font-semibold text-gray-800 dark:text-white">
          <span>Progress</span>
          <span>{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{progress.toFixed(1)}% complete</span>
          <span>{formatCurrency(remaining)} remaining</span>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;