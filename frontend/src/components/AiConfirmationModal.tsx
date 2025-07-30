"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Sparkles, DollarSign, Tag, FileText, Check } from "lucide-react"
import { useState, type FormEvent, useEffect } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import type { AiResponse } from "@/types"

interface AiConfirmationModalProps {
  aiData: AiResponse | null
  onClose: () => void
}

const AiConfirmationModal = ({ aiData, onClose }: AiConfirmationModalProps) => {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState("")

  const { addExpense, isCreating } = useTransactions()

  useEffect(() => {
    if (aiData) {
      setAmount(String(aiData.amount))
      setDescription(aiData.description)
      if (EXPENSE_CATEGORIES.includes(aiData.category)) {
        setCategory(aiData.category)
      } else {
        setCategory("Other")
      }
    }
  }, [aiData])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const numericAmount = Number.parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount.")
      return
    }

    addExpense({ amount: numericAmount, category, description })
    onClose()
  }

  return (
    <Dialog.Root open={!!aiData} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in-0 duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="relative p-8 pb-6 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                    AI Expense Detected
                  </Dialog.Title>
                  <Dialog.Description className="text-slate-600 dark:text-slate-400 mt-1">
                    We have transcribed your voice. Please confirm or edit the details below.
                  </Dialog.Description>
                </div>
              </div>

              <Dialog.Close asChild>
                <button className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <DollarSign size={16} className="text-emerald-500" />
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-semibold pr-16"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">
                      USD
                    </div>
                  </div>
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <Tag size={16} className="text-blue-500" />
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <FileText size={16} className="text-purple-500" />
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="What was this expense for?"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 py-4 px-6 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Check size={18} />
                        Save Expense
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AiConfirmationModal
