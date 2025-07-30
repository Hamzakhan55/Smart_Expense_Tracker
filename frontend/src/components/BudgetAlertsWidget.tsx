'use client';

import { useBudgets } from '@/hooks/useBudgets';
import { useCurrency } from '@/context/CurrencyContext';
import { AlertTriangle } from 'lucide-react';

const BudgetAlertsWidget = () => {
  const today = new Date();
  const { budgets, spendingByCategory } = useBudgets(today.getFullYear(), today.getMonth() + 1);
  const { currency } = useCurrency();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  const budgetAlerts = budgets?.map(budget => {
    const spent = spendingByCategory[budget.category] || 0;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    return { ...budget, spent, percentage };
  }).slice(0, 4) || [];

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="text-yellow-500" size={20} />
        <h3 className="text-lg font-semibold text-white">Budget Alerts</h3>
      </div>
      
      <div className="space-y-4">
        {budgetAlerts.length > 0 ? budgetAlerts.map((budget) => (
          <div key={budget.id}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">{budget.category}</span>
              <span className="text-green-400 text-sm">
                {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )) : (
          <p className="text-gray-400 text-sm">No budgets set for this month</p>
        )}
      </div>
    </div>
  );
};

export default BudgetAlertsWidget;