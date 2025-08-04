'use client';

import { BrainCircuit } from 'lucide-react';
import type { ForecastResponse } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';

interface ForecastCardProps {
  data: ForecastResponse;
}

const ForecastCard = ({ data }: ForecastCardProps) => {
  const { currency } = useCurrency();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <div className="flex items-center gap-2">
        <BrainCircuit className="text-blue-500" />
        <h3 className="text-lg font-bold text-gray-800">AI Spending Forecast</h3>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-800">{formatCurrency(data.total_forecast)}</p>
        <p className="text-sm text-gray-600">
          📊 This is how much I predict you'll spend next month based on your spending patterns and history.
        </p>
      </div>
      <div className="text-sm text-gray-600 space-y-1 pt-2 border-t">
        <p className="font-semibold">Expected spending by category:</p>
        <p className="text-xs text-gray-500 mb-2">
          These predictions help you plan your budget and identify areas where you might overspend.
        </p>
        {Object.entries(data.by_category).map(([category, amount]) => (
          <div key={category} className="flex justify-between items-center">
            <span className="capitalize">{category.toLowerCase()}</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastCard;