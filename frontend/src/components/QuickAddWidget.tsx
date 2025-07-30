'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { Plus } from 'lucide-react';

const QuickAddWidget = () => {
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  
  const { addExpense, addIncome, isCreating } = useTransactions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    
    if (transactionType === 'expense') {
      addExpense({ amount: numericAmount, category, description });
    } else {
      addIncome({ amount: numericAmount, category, description });
    }
    
    setAmount('');
    setDescription('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="text-white" size={20} />
        <h3 className="text-lg font-semibold text-white">Quick Add</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTransactionType('expense')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              transactionType === 'expense' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('income')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              transactionType === 'income' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Income
          </button>
        </div>
        
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 bg-gray-700 text-white rounded-lg placeholder-gray-400"
          required
        />
        
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 bg-gray-700 text-white rounded-lg placeholder-gray-400"
          required
        />
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 bg-gray-700 text-white rounded-lg"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Account"
          className="w-full p-3 bg-gray-700 text-white rounded-lg placeholder-gray-400"
        />
        
        <input
          type="text"
          placeholder="Tags (comma separated)"
          className="w-full p-3 bg-gray-700 text-white rounded-lg placeholder-gray-400"
        />
        
        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isCreating ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};

export default QuickAddWidget;