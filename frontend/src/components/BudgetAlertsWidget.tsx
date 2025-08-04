"use client"

import { useBudgets } from "@/hooks/useBudgets"
import { useCurrency } from "@/context/CurrencyContext"
import { useTheme } from "@/context/ThemeContext"
import { AlertTriangle, Target } from "lucide-react"

const BudgetAlertsWidget = () => {
  const today = new Date()
  const { budgets, spendingByCategory } = useBudgets(today.getFullYear(), today.getMonth() + 1)
  const { currency } = useCurrency()
  const { getCardClass } = useTheme()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)

  const budgetAlerts =
    budgets
      ?.map((budget) => {
        const spent = spendingByCategory[budget.category] || 0
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        return { ...budget, spent, percentage }
      })
      .slice(0, 4) || []

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "from-red-500 to-rose-600"
    if (percentage >= 75) return "from-amber-500 to-orange-600"
    if (percentage >= 50) return "from-blue-500 to-indigo-600"
    return "from-emerald-500 to-teal-600"
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="text-red-400" size={16} />
    if (percentage >= 75) return <AlertTriangle className="text-amber-400" size={16} />
    return <Target className="text-emerald-400" size={16} />
  }

  return (
    <div className={`${getCardClass()} overflow-hidden group hover:shadow-2xl transition-all duration-300`}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Budget Alerts</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track your spending limits</p>
          </div>
        </div>

        <div className="space-y-6">
          {budgetAlerts.length > 0 ? (
            budgetAlerts.map((budget) => (
              <div key={budget.id} className="group/item">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(budget.percentage)}
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{budget.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900 dark:text-white font-semibold">{formatCurrency(budget.spent)}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">of {formatCurrency(budget.amount)}</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${getProgressColor(budget.percentage)} h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {budget.percentage.toFixed(1)}% used
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(budget.amount - budget.spent)} left
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No budgets set</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create budgets to track your spending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BudgetAlertsWidget
