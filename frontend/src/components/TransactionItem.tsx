'use client';

import { TrendingUp } from 'lucide-react'; 
import type { Expense, Income } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import CategoryIcon from './CategoryIcon'; 

type Transaction = 
  | { type: 'expense'; data: Expense } 
  | { type: 'income'; data: Income };

interface TransactionItemProps {
  transaction: Transaction;
  onClick: () => void;
}

const TransactionItem = ({ transaction, onClick }: TransactionItemProps) => {
  const { currency } = useCurrency();
  const isExpense = transaction.type === 'expense';

  const title = transaction.data.description || transaction.data.category;
  const subtitle = `${transaction.data.category} • Main Checking`;
  const amount = transaction.data.amount;
  const date = new Date(transaction.data.date).toLocaleDateString('en-CA');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${isExpense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {isExpense ? (
            <CategoryIcon category={transaction.data.category} size={20} />
          ) : (
            <TrendingUp size={20} />
          )}
        </div>
        
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
          {isExpense ? '-' : '+'}{formatCurrency(amount)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
      </div>
    </div>
  );
};

export default TransactionItem;