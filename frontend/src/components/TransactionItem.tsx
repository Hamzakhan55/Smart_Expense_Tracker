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

  
  const title = isExpense ? transaction.data.category : transaction.data.category;
  
  const amount = transaction.data.amount;
  const description = transaction.data.description;
  const date = new Date(transaction.data.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div onClick={onClick} className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
      <div className="flex items-center gap-4">
     
        <div className={`p-2 rounded-full ${isExpense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {isExpense ? (
            <CategoryIcon category={transaction.data.category} size={20} />
          ) : (
            <TrendingUp size={20} />
          )}
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