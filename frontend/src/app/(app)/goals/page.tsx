"use client"

import { useState } from "react"
import { useGoals } from "@/hooks/useGoals"
import GoalCard from "@/components/GoalCard"
import ManageGoalModal from "@/components/ManageGoalModal"
import { PlusCircle, Target, TrendingUp, Award } from "lucide-react"
import type { Goal } from "@/types"
import { useCurrency } from "@/context/CurrencyContext"

export default function GoalsPage() {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, isMutating } = useGoals()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const {currency} = useCurrency()

  const handleCardClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsModalOpen(true)
  }

  const handleOpenCreateModal = () => {
    setSelectedGoal(null)
    setIsModalOpen(true)
  }

  // Calculate goals statistics
  const totalGoals = goals?.length || 0
  const completedGoals = goals?.filter((goal) => goal.current_amount >= goal.target_amount).length || 0
  const totalTargetAmount = goals?.reduce((sum, goal) => sum + goal.target_amount, 0) || 0
  const totalCurrentAmount = goals?.reduce((sum, goal) => sum + goal.current_amount, 0) || 0
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-medium text-slate-600 dark:text-slate-300">Loading Goals...</p>
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
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Savings Goals</span>
            </div>
            
          </div>

          {/* Goals Overview Stats */}
          {goals && goals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Goals */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl">
                      <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Active Goals
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalGoals}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Goals */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl">
                      <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Completed
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedGoals}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Target */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Total Target
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(totalTargetAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl">
                      <div className="w-6 h-6 rounded-full border-2 border-amber-600 dark:border-amber-400 flex items-center justify-center">
                        <div className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Progress
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{overallProgress.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overall Progress Card */}
          {goals && goals.length > 0 && (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Overall Progress</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {formatCurrency(totalCurrentAmount)} of {formatCurrency(totalTargetAmount)} saved
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <PlusCircle size={20} />
                    Create New Goal
                  </button>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-6 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: `${Math.min(overallProgress, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {overallProgress.toFixed(1)}% of total goals achieved
                    </span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {formatCurrency(totalTargetAmount - totalCurrentAmount)} remaining
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goals Grid */}
          {goals && goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onClick={() => handleCardClick(goal)} />
              ))}
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No savings goals yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Start your financial journey by setting your first savings goal
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle size={18} />
                  Create Your First Goal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ManageGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goal={selectedGoal}
        onCreate={createGoal}
        onUpdate={updateGoal}
        onDelete={deleteGoal}
        isMutating={isMutating}
      />
    </>
  )
}
