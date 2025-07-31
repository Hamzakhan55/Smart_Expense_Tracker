'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit, Trash2 } from 'lucide-react';
import type { Expense, Income } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useTransactions } from '@/hooks/useTransactions';

type Transaction = 
  | { type: 'expense'; data: Expense } 
  | { type: 'income'; data: Income };

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit?: () => void;
}

const TransactionDetailModal = ({ transaction, onClose, onEdit }: TransactionDetailModalProps) => {
  const { currency } = useCurrency();
  const { removeExpense, removeIncome } = useTransactions();

  if (!transaction) return null; // Don't render if no transaction is selected

  const isExpense = transaction.type === 'expense';
  const title = isExpense ? transaction.data.category : transaction.data.category;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleDelete = () => {
     {
      if (isExpense) {
        removeExpense(transaction.data.id);
      } else {
        removeIncome(transaction.data.id);
      }
      onClose();
    }
  };

  return (
    <Dialog.Root open={!!transaction} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="relative p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/50">
              <Dialog.Title className="text-2xl font-bold text-slate-900 mb-1">{title}</Dialog.Title>
              <Dialog.Description className="text-slate-600">
                Transaction Details
              </Dialog.Description>
              
              <Dialog.Close asChild>
                <button className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-700">Amount:</span>
                  <span className={`text-2xl font-bold ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(transaction.data.amount)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-700">Description:</span>
                  <span className="text-slate-900 font-medium">{transaction.data.description}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-700">Date:</span>
                  <span className="text-slate-900 font-medium">{formatDate(transaction.data.date)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={onEdit} 
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Edit size={18}/> 
                  Edit
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-2xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Trash2 size={18}/> 
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TransactionDetailModal;