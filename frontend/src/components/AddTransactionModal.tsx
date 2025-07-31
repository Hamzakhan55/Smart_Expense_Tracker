'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, DollarSign, Tag, FileText, CreditCard, Wallet } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/context/CurrencyContext';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import type { Expense, Income } from '@/types';


type TransactionToEdit = | { type: 'expense'; data: Expense } | { type: 'income'; data: Income };

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: TransactionToEdit | null;
}

const AddTransactionModal = ({ isOpen, onClose, transactionToEdit  }: AddTransactionModalProps) => {
  const isEditMode = !!transactionToEdit;
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]); 
  const [description, setDescription] = useState('');
  
  const { addExpense, addIncome, editExpense, editIncome, isCreating, isUpdating } = useTransactions();
  const { currency } = useCurrency();

 useEffect(() => {
    if (isEditMode) {
      const { type, data } = transactionToEdit;
      setTransactionType(type);
      setAmount(String(data.amount));
      setDescription(data.description || '');
      setCategory(type === 'expense' ? data.category : data.category);
    }
  }, [transactionToEdit, isEditMode]);
  
  // This effect will reset the category when the transaction type changes (only in add mode)
  useEffect(() => {
    if (!isEditMode) {
      if (transactionType === 'expense') {
        setCategory(EXPENSE_CATEGORIES[0]);
      } else {
        setCategory('');
      }
    }
  }, [transactionType, isEditMode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }
    if (!category) {
        alert('Please select a category or source.');
        return;
    }

    if (isEditMode && transactionToEdit) {
      if (transactionToEdit.type === 'expense') {
        editExpense({ id: transactionToEdit.data.id, amount: numericAmount, category, description });
      } else {
        editIncome({ id: transactionToEdit.data.id, amount: numericAmount, category, description });
      }
    } else {
      if (transactionType === 'expense') {
        addExpense({ amount: numericAmount, category, description });
      } else {
        addIncome({ amount: numericAmount, category, description });
      }
    }

    onClose();
  };

  // When the modal closes, reset the state
  const handleOnClose = () => {
    setAmount('');
    setDescription('');
    setTransactionType('expense');
    setCategory(EXPENSE_CATEGORIES[0]);
    onClose();
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOnClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="relative p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/50">
              <Dialog.Title className="text-2xl font-bold text-slate-900 mb-1">
                {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
              </Dialog.Title>
              
              <Dialog.Close asChild>
                <button className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Transaction Type Toggle */}
              <div className="flex gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => setTransactionType('expense')}
                  disabled={isEditMode}
                  className={`flex-1 py-4 px-6 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    transactionType === 'expense'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  } ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <CreditCard size={16} />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('income')}
                  disabled={isEditMode}
                  className={`flex-1 py-4 px-6 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    transactionType === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  } ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <Wallet size={16} />
                  Income
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Field */}
                <div className="space-y-3">
                  <label htmlFor="amount" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <DollarSign size={16} className="text-emerald-500" />
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-semibold pr-16"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                      {currency}
                    </div>
                  </div>
                </div>

                {/* Category Field */}
                <div className="space-y-3">
                  <label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Tag size={16} className="text-blue-500" />
                    {transactionType === 'expense' ? 'Category' : 'Source'}
                  </label>
                  {transactionType === 'expense' ? (
                    <div className="relative">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Salary, Freelance"
                      required
                    />
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-3">
                  <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText size={16} className="text-purple-500" />
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="What was this transaction for?"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 py-4 px-6 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isCreating || isUpdating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      isEditMode ? 'Save Changes' : 'Add Transaction'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddTransactionModal;