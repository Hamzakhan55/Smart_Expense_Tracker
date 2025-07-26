// src/components/TransactionList.tsx
'use client';

import { useMemo, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionItem from './TransactionItem';
import TransactionDetailModal from './TransactionDetailModal';
import type { Expense, Income } from '@/types';

type Transaction = | { type: 'expense'; data: Expense } | { type: 'income'; data: Income };

interface TransactionListProps {
  filter?: 'income' | 'expense' | 'all';
}

const TransactionList = ({ filter = 'all' }: TransactionListProps) => {
  const { expenses, incomes, isLoading, error } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const sortedTransactions = useMemo(() => {
    const incomesToShow = (filter === 'all' || filter === 'income') 
      ? (incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []) 
      : [];
    
    const expensesToShow = (filter === 'all' || filter === 'expense')
      ? (expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
      : [];

    const combined = [...incomesToShow, ...expensesToShow];

    combined.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

    // --- THIS IS THE KEY CHANGE ---
    // If a filter is active, return all matching transactions.
    // Otherwise, return only the 10 most recent.
    if (filter !== 'all') {
      return combined;
    } else {
      return combined.slice(0, 10);
    }
    // ----------------------------

  }, [incomes, expenses, filter]);

  // ... (The rest of the component remains exactly the same)
  // ... (isLoading, error, and JSX render logic is unchanged)

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
          <p className="text-center text-gray-500 py-4">
            {filter === 'all' ? 'No recent transactions found.' : `No ${filter} transactions found.`}
          </p>
        )}
      </div>
      
      <TransactionDetailModal 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)}
        onEdit={() => { /* This needs to be connected if not already */}}
      />
    </>
  );
};

export default TransactionList;