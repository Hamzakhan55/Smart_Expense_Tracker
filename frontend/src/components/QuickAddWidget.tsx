"use client"

import type React from "react"

import { useState } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { useCurrency } from "@/context/CurrencyContext"
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from "@/lib/constants"
import { Plus, CreditCard, Wallet, Tag } from "lucide-react"

const QuickAddWidget = () => {
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [source, setSource] = useState("")

  const { addExpense, addIncome, isCreating } = useTransactions()
  const { currency } = useCurrency()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = Number.parseFloat(amount)

    if (isNaN(numericAmount) || numericAmount <= 0) return

    if (transactionType === "expense") {
      addExpense({ amount: numericAmount, category, description })
    } else {
      addIncome({ amount: numericAmount, category: source, description })
    }

    setAmount("")
    setDescription("")
    setCategory("")
    setSource("")
  }

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Plus className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quick Add</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add transactions instantly</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTransactionType("expense")}
              className={`flex-1 py-4 px-6 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                transactionType === "expense"
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 scale-105"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              <CreditCard className="w-4 h-4 mx-auto mb-1" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTransactionType("income")}
              className={`flex-1 py-4 px-6 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                transactionType === "income"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-105"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              <Wallet className="w-4 h-4 mx-auto mb-1" />
              Income
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-semibold"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">
                {currency}
              </div>
            </div>

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />

            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              {transactionType === "expense" ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="" disabled hidden>
                    Select a category
                  </option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="" disabled hidden>
                    Select a source
                  </option>
                  {INCOME_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isCreating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : (
              `Add ${transactionType === "expense" ? "Expense" : "Income"}`
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default QuickAddWidget
