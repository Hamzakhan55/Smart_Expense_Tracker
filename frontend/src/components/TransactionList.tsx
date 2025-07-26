'use client';

import { useMemo, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionItem from './TransactionItem';
import TransactionDetailModal from './TransactionDetailModal';
import AddTransactionModal from './AddTransactionModal';
import type { Expense, Income } from '@/types';

type Transaction = | { type: 'expense'; data: Expense } | { type: 'income'; data: Income };

const TransactionList = () => {
  const { allTransactions, isLoading, error } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    if (selectedTransaction) {
      setIsEditModalOpen(true);
    }
  };

  const recentTransactions = allTransactions.slice(0, 10); 

  if (isLoading) {
    return <p className="text-center text-gray-500 py-4">Loading transactions...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-4">Could not load transactions.</p>;
  }

  
  return (
    <>
      <div className="space-y-2">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
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
        onEdit={handleEditClick}
      />
      
      <AddTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        transactionToEdit={selectedTransaction}
      />
    </>
  );
};

export default TransactionList;