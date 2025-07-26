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
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-bold text-gray-800">{title}</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mt-1 mb-4">
            Transaction Details
          </Dialog.Description>

          <div className="space-y-3 text-gray-700">
            <p><strong>Amount:</strong> <span className={isExpense ? 'text-red-600' : 'text-green-600'}>{formatCurrency(transaction.data.amount)}</span></p>
            <p><strong>Description:</strong> {transaction.data.description}</p>
            <p><strong>Date:</strong> {formatDate(transaction.data.date)}</p>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              <Edit size={16}/> Edit
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
              <Trash2 size={16}/> Delete
            </button>
          </div>

          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TransactionDetailModal;