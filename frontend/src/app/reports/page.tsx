'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { generateTransactionReport } from '@/services/reportService';
import { Download } from 'lucide-react';
import TransactionItem from '@/components/TransactionItem';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import AddTransactionModal from '@/components/AddTransactionModal';
import type { Expense, Income } from '@/types';

type TimeRange = 'Daily' | 'Weekly' | 'Monthly' | 'All';
type Transaction = | { type: 'expense'; data: Expense } | { type: 'income'; data: Income };

export default function ReportsPage() {
  const { expenses, incomes, isLoading, error } = useTransactions();
  const [timeRange, setTimeRange] = useState<TimeRange>('All');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- THIS IS THE COMPLETE useMemo LOGIC ---
  const filteredTransactions = useMemo(() => {
    const combined = [
      ...(incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []),
      ...(expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
    ];

    const now = new Date();
    // The filter logic was missing before
    const filtered = combined.filter(t => {
      const transactionDate = new Date(t.data.date);
      switch (timeRange) {
        case 'Daily':
          return transactionDate.toDateString() === now.toDateString();
        case 'Weekly':
          const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          return transactionDate >= oneWeekAgo;
        case 'Monthly':
          return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
        case 'All':
        default:
          return true;
      }
    });
    
    // Sort the filtered list by date
    filtered.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
    return filtered;
  }, [incomes, expenses, timeRange]);

  const handleExport = () => {
    if (filteredTransactions.length > 0) {
      generateTransactionReport(filteredTransactions, timeRange);
    } else {
      alert('No transactions to export for the selected range.');
    }
  };
  
  const handleEditClick = () => {
    if (selectedTransaction) {
      setIsEditModalOpen(true);
    }
  };

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-gray-500 py-4">Loading report data...</p>;
    if (error) return <p className="text-center text-red-500 py-4">Could not load data.</p>;
    
    return (
      <div className="bg-white p-2 md:p-4 rounded-xl shadow">
         {filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {/* This map function now correctly renders the TransactionItem */}
              {filteredTransactions.map(transaction => (
                  <TransactionItem 
                    key={`${transaction.type}-${transaction.data.id}`}
                    transaction={transaction}
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
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 self-start md:self-auto">
            <Download size={16} /> Export as PDF
          </button>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['Daily', 'Weekly', 'Monthly', 'All'] as TimeRange[]).map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-all ${
                timeRange === range ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        
        <div>{renderContent()}</div>
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
}