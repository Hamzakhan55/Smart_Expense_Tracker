"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Trash2, Target, DollarSign, Plus, Minus, Award, Sparkles } from "lucide-react"
import { useState, type FormEvent, useEffect } from "react"
import { useCurrency } from "@/context/CurrencyContext"
import type { Goal, GoalCreate } from "@/types"

interface ManageGoalModalProps {
  isOpen: boolean
  onClose: () => void
  goal?: Goal | null
  onCreate: (data: GoalCreate) => void
  onUpdate: (data: { id: number; amount: number }) => void
  onDelete: (id: number) => void
  isMutating: boolean
}

const ManageGoalModal = ({ isOpen, onClose, goal, onCreate, onUpdate, onDelete, isMutating }: ManageGoalModalProps) => {
  const { currency } = useCurrency()
  const isEditMode = !!goal
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [contributionAmount, setContributionAmount] = useState("")

  useEffect(() => {
    if (goal) {
      setName(goal.name)
      setTargetAmount(String(goal.target_amount))
    } else {
      setName("")
      setTargetAmount("")
    }
    setContributionAmount("")
  }, [goal, isOpen])

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    const numericAmount = Number.parseFloat(targetAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid target amount.")
      return
    }
    onCreate({ name, target_amount: numericAmount })
    onClose()
  }

  const handleUpdate = (type: "add" | "withdraw") => {
    const amount = Number.parseFloat(contributionAmount)
    if (goal && amount > 0) {
      onUpdate({ id: goal.id, amount: type === "add" ? amount : -amount })
      setContributionAmount("")
    }
  }

  const handleDelete = () => {
    if (goal && confirm(`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`)) {
      onDelete(goal.id)
      onClose()
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)

  const progress = goal && goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
  const isCompleted = goal && goal.current_amount >= goal.target_amount

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in-0 duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="relative p-8 pb-6 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  {isCompleted ? (
                    <Award className="text-white" size={24} />
                  ) : (
                    <Target className="text-white" size={24} />
                  )}
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                    {isEditMode ? `Manage "${goal?.name}"` : "Create New Goal"}
                  </Dialog.Title>
                  <Dialog.Description className="text-slate-600 dark:text-slate-400 mt-1">
                    {isEditMode
                      ? isCompleted
                        ? "Congratulations! This goal has been completed."
                        : "Add funds or withdraw from your savings goal"
                      : "Set a new savings target to work towards"}
                  </Dialog.Description>
                </div>
              </div>

              {/* Progress for edit mode */}
              {isEditMode && goal && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      {formatCurrency(goal.current_amount)} saved
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Target: {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                </div>
              )}

              <Dialog.Close asChild>
                <button className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {!isEditMode ? (
                <form onSubmit={handleCreate} className="space-y-6">
                  {/* Goal Name */}
                  <div className="space-y-3">
                    <label
                      htmlFor="name"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <Target size={16} className="text-blue-500" />
                      Goal Name
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Emergency Fund, Vacation, New Car"
                      required
                    />
                  </div>

                  {/* Target Amount */}
                  <div className="space-y-3">
                    <label
                      htmlFor="target"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <DollarSign size={16} className="text-emerald-500" />
                      Target Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="target"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-semibold pr-16"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">
                        {currency}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Sparkles size={12} />
                      Set a realistic target amount for your savings goal
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={isMutating}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isMutating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Goal...
                      </div>
                    ) : (
                      "Create Goal"
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Contribution Section */}
                  {!isCompleted && (
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <DollarSign size={16} className="text-blue-500" />
                        Manage Funds
                      </label>
                      <div className="space-y-3">
                        <input
                          type="number"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Amount"
                          step="0.01"
                          min="0"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate("add")}
                            disabled={!contributionAmount || Number.parseFloat(contributionAmount) <= 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-400 disabled:to-teal-400 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 text-sm"
                          >
                            <Plus size={14} />
                            Add
                          </button>
                          <button
                            onClick={() => handleUpdate("withdraw")}
                            disabled={!contributionAmount || Number.parseFloat(contributionAmount) <= 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 disabled:from-amber-400 disabled:to-orange-400 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 text-sm"
                          >
                            <Minus size={14} />
                            Withdraw
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delete Section */}
                  <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {isCompleted ? "Goal completed!" : "Finished with this goal?"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {isCompleted
                            ? "You can delete this completed goal or keep it for reference"
                            : "This action cannot be undone"}
                        </p>
                      </div>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Trash2 size={16} />
                        Delete Goal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ManageGoalModal
