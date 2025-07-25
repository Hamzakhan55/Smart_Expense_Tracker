'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Expense, Income } from '@/types';


type Transaction = 
  | { type: 'expense'; data: Expense } 
  | { type: 'income'; data: Income };


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'Pkr',
  }).format(amount);
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const isExpense = transaction.type === 'expense';

  const amount = transaction.data.amount;
  const title = isExpense ? transaction.data.category : transaction.data.category;
  const description = transaction.data.description;
  const date = new Date(transaction.data.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${isExpense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {isExpense ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
        </div>
        <div>
          <p className="font-bold text-gray-800">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
          {isExpense ? '-' : '+'}
          {formatCurrency(amount)}
        </p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
};

export default TransactionItem;