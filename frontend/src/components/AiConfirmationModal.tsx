// src/components/AiConfirmationModal.tsx
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import type { AiResponse } from '@/types';

interface AiConfirmationModalProps {
  aiData: AiResponse | null;
  onClose: () => void;
}

const AiConfirmationModal = ({ aiData, onClose }: AiConfirmationModalProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');

  const { addExpense, isCreating } = useTransactions();

  // This powerful effect populates the form whenever new AI data arrives
  useEffect(() => {
    if (aiData) {
      setAmount(String(aiData.amount));
      setDescription(aiData.description);
      // Set the category only if it's one of our known categories
      if (EXPENSE_CATEGORIES.includes(aiData.category)) {
        setCategory(aiData.category);
      } else {
        setCategory('Other'); // Fallback to 'Other'
      }
    }
  }, [aiData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    // Use the regular addExpense mutation to save the final data
    addExpense({ amount: numericAmount, category, description });
    onClose();
  };

  return (
    <Dialog.Root open={!!aiData} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg">
          <Dialog.Title className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Sparkles className="text-blue-500" />
            Confirm Your Expense
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mt-1 mb-4">
            We have transcribed your voice. Please confirm or edit the details below.
          </Dialog.Description>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount</label>
                <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
              </div>
              <div>
                <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
              </Dialog.Close>
              <button type="submit" disabled={isCreating} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-blue-300">
                {isCreating ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AiConfirmationModal;