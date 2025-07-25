'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react'; // Import useEffect
import { useTransactions } from '@/hooks/useTransactions';
// 1. Import the categories
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTransactionModal = ({ isOpen, onClose }: AddTransactionModalProps) => {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  // 2. Set the default category to the first item in our list
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]); 
  const [description, setDescription] = useState('');

  const { addExpense, addIncome, isCreating } = useTransactions();
  
  // This effect will reset the category when the transaction type changes
  useEffect(() => {
    if (transactionType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(''); // Reset source to empty
    }
  }, [transactionType]);

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

    if (transactionType === 'expense') {
      addExpense({ amount: numericAmount, category, description });
    } else {
      // For income, 'category' state holds the source
      addIncome({ amount: numericAmount, category: category, description });
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
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add {transactionType === 'expense' ? 'Expense' : 'Income'}
          </Dialog.Title>
          
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTransactionType('expense')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                transactionType === 'expense' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('income')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                transactionType === 'income' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Income
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
            </div>

           
            <div>
              <label htmlFor="category" className="text-sm font-medium text-gray-700">
                {transactionType === 'expense' ? 'Category' : 'Source'}
              </label>
              {transactionType === 'expense' ? (
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md bg-white"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md"
                  placeholder="e.g., Salary, Freelance"
                  required
                />
              )}
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., Bought a coffee" required />
            </div>
          </div>
          
         
            <div className="flex justify-end gap-4 mt-6">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" disabled={isCreating} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                {isCreating ? 'Adding...' : 'Add Transaction'}
              </button>
            </div>
          </form>
          
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddTransactionModal;