"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { Target, TrendingUp, AlertTriangle, CheckCircle, Edit3 } from "lucide-react"
import { useState } from "react"

interface BudgetCardProps {
  category: string
  budget: number
  spent: number
  onEdit?: () => void
}

const BudgetCard = ({ category, budget, spent, onEdit }: BudgetCardProps) => {
  const { currency } = useCurrency()
  const [isHovered, setIsHovered] = useState(false)

  const remaining = budget - spent
  const percentage = budget > 0 ? (spent / budget) * 100 : 0

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value)

  const getStatusColor = () => {
    if (percentage >= 100) return "from-red-500 to-rose-600"
    if (percentage >= 80) return "from-amber-500 to-orange-600"
    if (percentage >= 60) return "from-blue-500 to-indigo-600"
    return "from-emerald-500 to-teal-600"
  }

  const getStatusIcon = () => {
    if (percentage >= 100) return <AlertTriangle className="text-red-400" size={20} />
    if (percentage >= 80) return <AlertTriangle className="text-amber-400" size={20} />
    return <CheckCircle className="text-emerald-400" size={20} />
  }

  const getStatusText = () => {
    if (percentage >= 100) return "Over Budget"
    if (percentage >= 80) return "Near Limit"
    return "On Track"
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      "Food & Drinks": "🍽️",
      Transport: "🚗",
      Shopping: "🛍️",
      Entertainment: "🎬",
      Bills: "📄",
      Health: "🏥",
      Education: "📚",
      Travel: "✈️",
      Other: "📦",
    }
    return iconMap[category] || "📦"
  }

  return (
    <div
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center text-2xl">
              {getCategoryIcon(category)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{category}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon()}
                <span
                  className={`text-sm font-medium ${
                    percentage >= 100
                      ? "text-red-600 dark:text-red-400"
                      : percentage >= 80
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
              isHovered
                ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Edit3 size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{percentage.toFixed(1)}%</span>
          </div>
          <div className="relative">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${getStatusColor()} h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            {percentage > 100 && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-1">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  +{(percentage - 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Spent</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(spent)}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Budget</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(budget)}</span>
          </div>

          <div
            className={`flex justify-between items-center p-4 rounded-2xl ${
              remaining >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {remaining >= 0 ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {remaining >= 0 ? "Remaining" : "Over Budget"}
              </span>
            </div>
            <span
              className={`text-lg font-bold ${
                remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>

        {/* Monthly Badge */}
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-700/50">
            Monthly Budget
          </span>
        </div>
      </div>
    </div>
  )
}

export default BudgetCard
