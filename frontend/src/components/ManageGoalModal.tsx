'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2 } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import type { Goal, GoalCreate } from '@/types';

interface ManageGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onCreate: (data: GoalCreate) => void;
  onUpdate: (data: { id: number; amount: number }) => void;
  onDelete: (id: number) => void;
  isMutating: boolean;
}

const ManageGoalModal = ({ isOpen, onClose, goal, onCreate, onUpdate, onDelete, isMutating }: ManageGoalModalProps) => {
  const isEditMode = !!goal;
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.target_amount));
    } else {
      setName('');
      setTargetAmount('');
    }
    setContributionAmount('');
  }, [goal, isOpen]);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    onCreate({ name, target_amount: parseFloat(targetAmount) });
    onClose();
  };
  
  const handleUpdate = (type: 'add' | 'withdraw') => {
    const amount = parseFloat(contributionAmount);
    if (goal && amount > 0) {
      onUpdate({ id: goal.id, amount: type === 'add' ? amount : -amount });
      setContributionAmount('');
    }
  };
  
  const handleDelete = () => {
    if (goal) {
      onDelete(goal.id);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg">
          <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-white">
            {isEditMode ? `Manage '${goal?.name}'` : 'Create New Goal'}
          </Dialog.Title>
          
          {!isEditMode ? (
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal Name</label>
                <input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600" required />
              </div>
              <div>
                <label htmlFor="target" className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount</label>
                <input type="number" id="target" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600" required />
              </div>
              <div className="flex justify-end pt-4"><button type="submit" disabled={isMutating} className="px-4 py-2 text-white bg-blue-600 rounded-md">Create Goal</button></div>
            </form>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="contribution" className="text-sm font-medium text-gray-700 dark:text-gray-300">Add or Withdraw Funds</label>
                <div className="flex gap-2 mt-1">
                  <input type="number" id="contribution" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600" placeholder="Amount" />
                  <button onClick={() => handleUpdate('add')} className="px-4 py-2 text-white bg-green-500 rounded-md">Add</button>
                  <button onClick={() => handleUpdate('withdraw')} className="px-4 py-2 text-white bg-yellow-500 rounded-md">Withdraw</button>
                </div>
              </div>
               <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                 <p className="text-sm text-gray-500 dark:text-gray-400">Finished with this goal?</p>
                 <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md"><Trash2 size={16}/> Delete Goal</button>
               </div>
            </div>
          )}
          <Dialog.Close asChild><button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ManageGoalModal;