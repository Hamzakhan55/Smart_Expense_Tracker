'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; amount: number }) => void;
  isSubmitting: boolean;
}

const AddBudgetModal = ({ isOpen, onClose, onSubmit, isSubmitting }: AddBudgetModalProps) => {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ category, amount: parseFloat(amount) });
    setAmount('');
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg">
          <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-white">Set Category Budget</Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600">
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Amount</label>
              <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600" required />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Dialog.Close asChild><button type="button" className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md">Cancel</button></Dialog.Close>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 rounded-md disabled:bg-blue-300">
                {isSubmitting ? 'Saving...' : 'Set Budget'}
              </button>
            </div>
          </form>
          <Dialog.Close asChild><button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddBudgetModal;