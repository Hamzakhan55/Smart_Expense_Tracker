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
        <h3 className="text-lg font-bold text-gray-800">Next Month Forecast</h3>
      </div>
      <p className="text-3xl font-bold text-gray-800">{formatCurrency(data.total_forecast)}</p>
      <div className="text-sm text-gray-600 space-y-1 pt-2 border-t">
        <p className="font-semibold">Breakdown:</p>
        {Object.entries(data.by_category).map(([category, amount]) => (
          <div key={category} className="flex justify-between">
            <span>{category}</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastCard;