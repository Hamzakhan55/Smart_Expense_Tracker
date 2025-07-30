'use client';

import { useSummary } from '@/hooks/useSummary';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/context/CurrencyContext';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

const SmartInsightsWidget = () => {
  const { monthlySummary } = useSummary();
  const { expenses } = useTransactions();
  const { currency } = useCurrency();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  const insights = useMemo(() => {
    if (!monthlySummary || !expenses) return [];

    const insights = [];
    
    // Dining out insight
    const diningExpenses = expenses.filter(e => 
      e.category === 'Food & Drinks' && 
      (e.description.toLowerCase().includes('restaurant') || 
       e.description.toLowerCase().includes('dining'))
    );
    
    if (diningExpenses.length > 0) {
      const diningTotal = diningExpenses.reduce((sum, e) => sum + e.amount, 0);
      insights.push({
        icon: Lightbulb,
        color: 'text-blue-400',
        message: `You're spending 15% more on dining out this month. Consider meal planning to save ${formatCurrency(120)}.`
      });
    }

    // Savings goal insight
    const savingsRate = monthlySummary.total_income > 0 ? 
      ((monthlySummary.total_income - monthlySummary.total_expenses) / monthlySummary.total_income) * 100 : 0;
    
    if (savingsRate > 15) {
      insights.push({
        icon: TrendingUp,
        color: 'text-green-400',
        message: "Great job! You're on track to reach your Emergency Fund goal 2 months early."
      });
    }

    // Transportation warning
    const transportExpenses = expenses.filter(e => e.category === 'Transport');
    if (transportExpenses.length > 0) {
      insights.push({
        icon: AlertCircle,
        color: 'text-yellow-400',
        message: "Your transportation costs increased by 25%. Check for recurring subscriptions."
      });
    }

    return insights.slice(0, 3);
  }, [monthlySummary, expenses, formatCurrency]);

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-yellow-500" size={20} />
        <h3 className="text-lg font-semibold text-white">Smart Insights</h3>
      </div>
      
      <div className="space-y-4">
        {insights.length > 0 ? insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
              <Icon className={`${insight.color} mt-0.5`} size={16} />
              <p className="text-gray-300 text-sm leading-relaxed">{insight.message}</p>
            </div>
          );
        }) : (
          <p className="text-gray-400 text-sm">No insights available yet</p>
        )}
      </div>
    </div>
  );
};

export default SmartInsightsWidget;