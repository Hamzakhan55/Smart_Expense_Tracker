'use client';

import { useMemo, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionItem from './TransactionItem';
import TransactionDetailModal from './TransactionDetailModal';
import type { Expense, Income } from '@/types';

type Transaction = | { type: 'expense'; data: Expense } | { type: 'income'; data: Income };

const TransactionList = () => {
  
  const { expenses, incomes, isLoading, error } = useTransactions();
  
 
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  
  const sortedTransactions = useMemo(() => {
    
    const combined = [
      ...(incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []),
      ...(expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
    ];

    
    combined.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
    return combined.slice(0, 10);
  }, [incomes, expenses]); 

  if (isLoading) {
    return <p className="text-center text-gray-500 py-4">Loading transactions...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-4">Could not load transactions.</p>;
  }

  
  return (
    <>
      <div className="space-y-2">
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map((transaction) => (
            <TransactionItem 
              key={`${transaction.type}-${transaction.data.id}`} 
              transaction={transaction}
              onClick={() => setSelectedTransaction(transaction)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No recent transactions found.</p>
        )}
      </div>
      <TransactionDetailModal 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </>
  );
};

export default TransactionList;