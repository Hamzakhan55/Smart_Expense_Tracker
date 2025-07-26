'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import AddTransactionModal from './AddTransactionModal';
import VoiceRecorder from './VoiceRecorder';
import type { Expense, Income } from '@/types';

type TransactionToEdit = | { type: 'expense'; data: Expense } | { type: 'income'; data: Income };

interface FloatingActionsProps {
  onEditTransaction?: (transaction: TransactionToEdit) => void;
}

const FloatingActions = ({ onEditTransaction }: FloatingActionsProps = {}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionToEdit | null>(null);

  const openEditModal = (transaction: TransactionToEdit) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };



  return (
    <>
      <div className="fixed bottom-24 right-6 flex flex-col items-center gap-4">
        <VoiceRecorder />
        <button
          onClick={() => {
            setTransactionToEdit(null);
            setIsModalOpen(true);
          }}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all"
        >
          <Plus size={28} />
        </button>
      </div>
      
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }} 
        transactionToEdit={transactionToEdit}
      />
    </>
  );
};

export default FloatingActions;