"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Target, DollarSign, Tag, Sparkles } from "lucide-react"
import { useState, type FormEvent, useEffect } from "react"
import { useCurrency } from "@/context/CurrencyContext"
import { EXPENSE_CATEGORIES } from "@/lib/constants"

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { category: string; amount: number }) => void
  isSubmitting: boolean
  editingBudget?: { category: string; amount: number } | null
}

const AddBudgetModal = ({ isOpen, onClose, onSubmit, isSubmitting, editingBudget }: AddBudgetModalProps) => {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState("")
  const { currency } = useCurrency()
  const isEditMode = !!editingBudget

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category)
      setAmount(String(editingBudget.amount))
    } else {
      setCategory(EXPENSE_CATEGORIES[0])
      setAmount("")
    }
  }, [editingBudget, isOpen])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const numericAmount = Number.parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount.")
      return
    }
    onSubmit({ category, amount: numericAmount })
    setAmount("")
    onClose()
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
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in-0 duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="relative p-8 pb-6 bg-gradient-to-br from-slate-50/80 via-white/60 to-blue-50/40 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/40 border-b border-slate-200/30 dark:border-slate-600/30">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-3xl shadow-xl shadow-blue-500/20 dark:shadow-blue-600/30">
                  <Target className="text-white" size={28} />
                </div>
                <div>
                  <Dialog.Title className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {isEditMode ? `Edit "${category}" Budget` : 'Set Category Budget'}
                  </Dialog.Title>
                  <Dialog.Description className="text-slate-500 dark:text-slate-400 text-base">
                    {isEditMode ? 'Update your spending limit' : 'Define spending limits for better financial control'}
                  </Dialog.Description>
                </div>
              </div>

              <Dialog.Close asChild>
                <button className="absolute top-6 right-6 p-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 rounded-2xl transition-all duration-200 hover:scale-110">
                  <X size={24} />
                </button>
              </Dialog.Close>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-3">
                  <label
                    htmlFor="category"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <Tag size={16} className="text-blue-500" />
                    Category
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">{getCategoryIcon(category)}</div>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isEditMode}
                      className={`w-full pl-16 pr-12 py-5 bg-slate-50/80 dark:bg-slate-700/60 text-slate-900 dark:text-white rounded-3xl border border-slate-200/60 dark:border-slate-600/60 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:focus:ring-blue-400/50 dark:focus:border-blue-400/50 transition-all duration-300 appearance-none text-lg font-medium shadow-sm hover:shadow-md ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-600/60'}`}
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

                {/* Budget Amount */}
                <div className="space-y-3">
                  <label
                    htmlFor="amount"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <DollarSign size={16} className="text-emerald-500" />
                    Budget Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-5 bg-slate-50/80 dark:bg-slate-700/60 text-slate-900 dark:text-white rounded-3xl border border-slate-200/60 dark:border-slate-600/60 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:focus:ring-blue-400/50 dark:focus:border-blue-400/50 transition-all duration-300 text-xl font-bold pr-20 shadow-sm hover:shadow-md hover:bg-slate-100/80 dark:hover:bg-slate-600/60"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-base font-bold bg-slate-100/80 dark:bg-slate-600/80 px-3 py-1 rounded-xl">
                      {currency}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-200/30 dark:border-blue-700/30">
                    <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
                    This will be your monthly spending limit for {category}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-8">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 py-5 px-8 text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 rounded-3xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg text-lg"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-5 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-3xl font-bold hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-xl shadow-blue-500/30 dark:shadow-blue-400/20 hover:shadow-2xl hover:shadow-blue-500/40 dark:hover:shadow-blue-400/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Setting Budget...
                      </div>
                    ) : (
                      isEditMode ? "Update Budget" : "Set Budget"
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

export default AddBudgetModal
