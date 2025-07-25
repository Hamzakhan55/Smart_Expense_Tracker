'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionItem from './TransactionItem';

const TransactionList = () => {
  const { expenses, incomes, isLoading, error } = useTransactions();

  
  const sortedTransactions = useMemo(() => {
    const combined = [
      ...(incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []),
      ...(expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
    ];

    // Sort by date, most recent first
    combined.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

    return combined.slice(0, 10); // Return only the 10 most recent transactions
  }, [incomes, expenses]);

  if (isLoading) return <p className="text-center text-gray-500">Loading transactions...</p>;
  if (error) return <p className="text-center text-red-500">Could not load transactions.</p>;

  return (
    <div className="space-y-2">
      {sortedTransactions.length > 0 ? (
        sortedTransactions.map((transaction) => (
          <TransactionItem key={`${transaction.type}-${transaction.data.id}`} transaction={transaction} />
        ))
      ) : (
        <p className="text-center text-gray-500 py-4">No recent transactions found.</p>
      )}
    </div>
  );
};

export default TransactionList;