'use client';

import { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import BudgetCard from '@/components/BudgetCard';
import AddBudgetModal from '@/components/AddBudgetModal';
import { PlusCircle } from 'lucide-react';

export default function BudgetsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { budgets, spendingByCategory, setBudget, isSettingBudget, isLoading } = useBudgets(year, month);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSetBudget = (data: { category: string; amount: number }) => {
    setBudget({ ...data, year, month });
  };

  if (isLoading) {
    return <div className="p-6">Loading Budgets...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Budgets</h1>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <PlusCircle size={16} /> Set New Budget
          </button>
        </div>
        
        {budgets && budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map(budget => (
              <BudgetCard
                key={budget.id}
                category={budget.category}
                budget={budget.amount}
                spent={spendingByCategory[budget.category] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-600 dark:text-gray-400">You haven't set any budgets for this month.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click 'Set New Budget' to get started!</p>
          </div>
        )}
      </div>
      
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSetBudget}
        isSubmitting={isSettingBudget}
      />
    </>
  );
}