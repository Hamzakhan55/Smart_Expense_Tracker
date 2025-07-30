"use client"

import { useState } from "react"
import { useBudgets } from "@/hooks/useBudgets"
import BudgetCard from "@/components/BudgetCard"
import AddBudgetModal from "@/components/AddBudgetModal"
import { PlusCircle, Target, Calendar, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

export default function BudgetsPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { budgets, spendingByCategory, setBudget, isSettingBudget, isLoading } = useBudgets(year, month)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<{ category: string; amount: number } | null>(null)

  const handleSetBudget = (data: { category: string; amount: number }) => {
    setBudget({ ...data, year, month })
    setEditingBudget(null)
  }

  const handleEditBudget = (category: string, amount: number) => {
    setEditingBudget({ category, amount })
    setIsModalOpen(true)
  }

  // Calculate budget statistics
  const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0
  const totalSpent = budgets?.reduce((sum, budget) => sum + (spendingByCategory[budget.category] || 0), 0) || 0
  const totalRemaining = totalBudget - totalSpent
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Budget status counts
  const budgetStats = budgets?.reduce(
    (stats, budget) => {
      const spent = spendingByCategory[budget.category] || 0
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

      if (percentage >= 100) stats.overBudget++
      else if (percentage >= 80) stats.nearLimit++
      else stats.onTrack++

      return stats
    },
    { onTrack: 0, nearLimit: 0, overBudget: 0 },
  ) || { onTrack: 0, nearLimit: 0, overBudget: 0 }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)

  const getMonthName = (monthNum: number) => {
    return new Date(year, monthNum - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-medium text-slate-600 dark:text-slate-300">Loading Budgets...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-slate-700/50">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Budget Management</span>
            </div>
            
          </div>

          {/* Month Selector and Add Budget */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{getMonthName(month)}</h2>
                    <p className="text-slate-600 dark:text-slate-400">Budget overview and management</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle size={20} />
                  Set New Budget
                </button>
              </div>
            </div>
          </div>

          {/* Budget Overview Stats */}
          {budgets && budgets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Budget */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl">
                      <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Total Budget
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalBudget)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Spent */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Total Spent
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        totalRemaining >= 0
                          ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
                          : "bg-gradient-to-br from-red-500/10 to-rose-500/10"
                      }`}
                    >
                      {totalRemaining >= 0 ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Remaining
                      </h3>
                      <p
                        className={`text-2xl font-bold ${
                          totalRemaining >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(Math.abs(totalRemaining))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl">
                      <div className="w-6 h-6 rounded-full border-2 border-purple-600 dark:border-purple-400 flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Progress
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {overallPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Status Summary */}
          {budgets && budgets.length > 0 && (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Budget Status Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{budgetStats.onTrack}</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">On Track</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{budgetStats.nearLimit}</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Near Limit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{budgetStats.overBudget}</p>
                      <p className="text-sm text-red-700 dark:text-red-300">Over Budget</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Cards */}
          {budgets && budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  category={budget.category}
                  budget={budget.amount}
                  spent={spendingByCategory[budget.category] || 0}
                  onEdit={() => handleEditBudget(budget.category, budget.amount)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No budgets set</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  You have not set any budgets for {getMonthName(month)}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle size={18} />
                  Set Your First Budget
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBudget(null)
        }}
        onSubmit={handleSetBudget}
        isSubmitting={isSettingBudget}
        editingBudget={editingBudget}
      />
    </>
  )
}
