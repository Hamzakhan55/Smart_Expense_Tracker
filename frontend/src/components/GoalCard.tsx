"use client"

import type { Goal } from "@/types"
import { useCurrency } from "@/context/CurrencyContext"
import { Target, TrendingUp, Calendar, Award, Edit3 } from "lucide-react"
import { useState } from "react"

interface GoalCardProps {
  goal: Goal
  onClick: () => void
}

const GoalCard = ({ goal, onClick }: GoalCardProps) => {
  const { currency } = useCurrency()
  const [isHovered, setIsHovered] = useState(false)

  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
  const remaining = goal.target_amount - goal.current_amount
  const isCompleted = goal.current_amount >= goal.target_amount

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value)

  const getProgressColor = () => {
    if (isCompleted) return "from-emerald-500 to-teal-600"
    if (progress >= 75) return "from-blue-500 to-indigo-600"
    if (progress >= 50) return "from-purple-500 to-violet-600"
    if (progress >= 25) return "from-amber-500 to-orange-600"
    return "from-rose-500 to-pink-600"
  }

  const getGoalIcon = (goalName: string) => {
    const name = goalName.toLowerCase()
    if (name.includes("emergency") || name.includes("fund")) return "🚨"
    if (name.includes("vacation") || name.includes("travel")) return "✈️"
    if (name.includes("car") || name.includes("vehicle")) return "🚗"
    if (name.includes("house") || name.includes("home")) return "🏠"
    if (name.includes("wedding")) return "💒"
    if (name.includes("education") || name.includes("school")) return "🎓"
    if (name.includes("retirement")) return "🏖️"
    return "🎯"
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center text-2xl">
              {getGoalIcon(goal.name)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{goal.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {isCompleted ? (
                  <>
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed!</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            className={`p-2 rounded-xl transition-all duration-200 ${
              isHovered
                ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <Edit3 size={16} />
          </button>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{progress.toFixed(1)}%</span>
          </div>
          <div className="relative">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${getProgressColor()} h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            {isCompleted && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-1">
                <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Award size={12} />
                  Done!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Current</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(goal.current_amount)}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Target</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(goal.target_amount)}
            </span>
          </div>

          {!isCompleted && (
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Remaining</span>
              </div>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(remaining)}</span>
            </div>
          )}
        </div>

        {/* Action Hint */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-700/50 dark:to-slate-600/50 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-600/50">
            Click to manage this goal
          </span>
        </div>
      </div>
    </div>
  )
}

export default GoalCard
