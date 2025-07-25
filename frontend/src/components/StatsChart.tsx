// src/components/StatsChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';

interface StatsChartProps {
  totalIncome: number;
  totalExpenses: number;
}

const StatsChart = ({ totalIncome, totalExpenses }: StatsChartProps) => {
  const { currency } = useCurrency();

  const data = [
    { name: 'Income', amount: totalIncome, fill: '#4ade80' }, // green-400
    { name: 'Expenses', amount: totalExpenses, fill: '#f87171' }, // red-400
  ];

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div className="bg-white p-4 rounded-xl shadow h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} formatter={formatCurrency} />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;