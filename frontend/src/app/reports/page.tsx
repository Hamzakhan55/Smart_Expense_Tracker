// src/app/reports/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { generateTransactionReport } from '@/services/reportService';
import { Download } from 'lucide-react';
// 1. Import the necessary components and types
import TransactionItem from '@/components/TransactionItem';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import type { Expense, Income } from '@/types';

type TimeRange = 'Daily' | 'Weekly' | 'Monthly' | 'All';
// Define the Transaction union type again for use in this component
type Transaction = | { type: 'expense'; data: Expense } | { type: 'income'; data: Income };

export default function ReportsPage() {
  const { expenses, incomes, isLoading, error } = useTransactions();
  const [timeRange, setTimeRange] = useState<TimeRange>('All');
  // 2. Add state to manage the selected transaction for the modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    const combined = [
      ...(incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []),
      ...(expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
    ];

    const now = new Date();
    const filtered = combined.filter(transaction => {
      const transactionDate = new Date(transaction.data.date);
      
      switch (timeRange) {
        case 'Daily':
          return transactionDate.toDateString() === now.toDateString();
        case 'Weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'Monthly':
          return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [incomes, expenses, timeRange]);

  const handleExport = () => {
    generateTransactionReport(filteredTransactions, timeRange);
  };

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-gray-500 py-4">Loading report data...</p>;
    if (error) return <p className="text-center text-red-500 py-4">Could not load data.</p>;
    
    // --- 3. THIS IS THE UPDATED RENDER LOGIC ---
    return (
      <div className="bg-white p-2 md:p-4 rounded-xl shadow">
         {filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map(transaction => (
                  <TransactionItem 
                    key={`${transaction.type}-${transaction.data.id}`}
                    transaction={transaction}
                    // When clicked, it sets the state to open the modal
                    onClick={() => setSelectedTransaction(transaction)}
                  />
              ))}
            </div>
         ) : (
            <p className="text-center text-gray-500 py-4">No transactions found for this period.</p>
         )}
      </div>
    );
  };

  return (
    // The main return block now includes the TransactionDetailModal
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={20} />
            Export PDF
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {(['Daily', 'Weekly', 'Monthly', 'All'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        
        <div>{renderContent()}</div>
      </div>
      
      {/* 4. Render the modal component */}
      <TransactionDetailModal 
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}