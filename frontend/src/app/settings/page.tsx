// src/app/settings/page.tsx
'use client';

import CurrencySelector from '@/components/CurrencySelector';
import { useTransactions } from '@/hooks/useTransactions';
import { generateTransactionReport } from '@/services/reportService';
import { useMemo } from 'react';

export default function SettingsPage() {
  const { expenses, incomes, clearAllTransactions } = useTransactions();

  const allTransactions = useMemo(() => {
    const combined = [
      ...(incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []),
      ...(expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
    ];
    combined.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
    return combined;
  }, [incomes, expenses]);

  const handleExportAll = () => {
    if (allTransactions.length > 0) {
      generateTransactionReport(allTransactions, 'Full History');
    } else {
      alert('No transactions to export.');
    }
  };

  const handleDeleteAll = () => {
    const confirmation = window.prompt("This action cannot be undone. Please type 'DELETE' to confirm.");
    if (confirmation === 'DELETE') {
      clearAllTransactions();
      alert('All transaction data has been deleted.');
    } else {
      alert('Deletion cancelled.');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {/* General Settings Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">General</h2>
        <div className="bg-white p-4 rounded-xl shadow">
          <CurrencySelector />
        </div>
      </div>

      {/* Data Management Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Data Management</h2>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500 space-y-3">
          <p className="text-sm text-gray-600">Export a PDF of your complete transaction history.</p>
          <button
            onClick={handleExportAll}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Export All Data
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-3">Permanently delete all of your incomes and expenses. This action cannot be undone.</p>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete All Transaction Data
          </button>
        </div>
      </div>
    </div>
  );
}