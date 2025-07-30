'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionList from '@/components/TransactionList';
import { Search } from 'lucide-react';

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  const { expenses, incomes, isLoading } = useTransactions(searchTerm);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Transaction Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Search, filter, and manage all your transactions.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
        >
          <option value="all">All Transactions</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <TransactionList 
          expenses={expenses} 
          incomes={incomes} 
          isLoading={isLoading} 
          filter={filter} 
        />
      </div>
    </div>
  );
}