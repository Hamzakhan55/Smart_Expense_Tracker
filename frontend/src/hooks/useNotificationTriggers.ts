'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/hooks/useGoals';
import { useTransactions } from '@/hooks/useTransactions';

export const useNotificationTriggers = () => {
  const { addNotification } = useNotifications();
  const today = new Date();
  const { budgets, spendingByCategory } = useBudgets(today.getFullYear(), today.getMonth() + 1);
  const { goals } = useGoals();
  const { expenses } = useTransactions();
  
  const notifiedBudgets = useRef(new Set<string>());
  const notifiedGoals = useRef(new Set<string>());
  const notifiedExpenses = useRef(new Set<number>());

  // Budget alerts
  useEffect(() => {
    if (!budgets || !spendingByCategory) return;

    budgets.forEach(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const budgetKey = `${budget.category}-${Math.floor(percentage / 10)}`;

      if (!notifiedBudgets.current.has(budgetKey)) {
        if (percentage >= 90 && percentage < 100) {
          addNotification({
            type: 'budget',
            title: 'Budget Alert',
            message: `You've used ${percentage.toFixed(1)}% of your ${budget.category} budget`,
          });
          notifiedBudgets.current.add(budgetKey);
        } else if (percentage >= 100) {
          addNotification({
            type: 'budget',
            title: 'Budget Exceeded',
            message: `You've exceeded your ${budget.category} budget by ${(percentage - 100).toFixed(1)}%`,
          });
          notifiedBudgets.current.add(budgetKey);
        }
      }
    });
  }, [budgets, spendingByCategory]);

  // Goal completion alerts
  useEffect(() => {
    if (!goals) return;

    goals.forEach(goal => {
      const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
      const goalKey = `${goal.id}-${Math.floor(progress / 25)}`;
      
      if (!notifiedGoals.current.has(goalKey)) {
        if (progress >= 100) {
          addNotification({
            type: 'goal',
            title: 'Goal Achieved!',
            message: `Congratulations! You've completed your "${goal.name}" goal`,
          });
          notifiedGoals.current.add(goalKey);
        } else if (progress >= 75 && progress < 100) {
          addNotification({
            type: 'goal',
            title: 'Goal Progress',
            message: `You're ${progress.toFixed(1)}% towards your "${goal.name}" goal`,
          });
          notifiedGoals.current.add(goalKey);
        }
      }
    });
  }, [goals]);

  // Large expense alerts
  useEffect(() => {
    if (!expenses || expenses.length === 0) return;

    const recentExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const daysDiff = (Date.now() - expenseDate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 1;
    });

    const avgExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length;

    recentExpenses.forEach(expense => {
      if (expense.amount > avgExpense * 2 && !notifiedExpenses.current.has(expense.id)) {
        addNotification({
          type: 'expense',
          title: 'Large Expense Detected',
          message: `You spent $${expense.amount.toFixed(2)} on ${expense.category}`,
        });
        notifiedExpenses.current.add(expense.id);
      }
    });
  }, [expenses]);
};