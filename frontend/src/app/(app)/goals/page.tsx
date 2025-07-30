'use client';

import { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import GoalCard from '@/components/GoalCard';
import ManageGoalModal from '@/components/ManageGoalModal';
import { PlusCircle } from 'lucide-react';
import type { Goal } from '@/types';

export default function GoalsPage() {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, isMutating } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleCardClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedGoal(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">Loading Goals...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Savings Goals</h1>
          <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <PlusCircle size={16} /> Create New Goal
          </button>
        </div>
        
        {goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => handleCardClick(goal)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-600 dark:text-gray-400">You haven't set any savings goals yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click 'Create New Goal' to get started!</p>
          </div>
        )}
      </div>
      
      <ManageGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goal={selectedGoal}
        onCreate={createGoal}
        onUpdate={updateGoal}
        onDelete={deleteGoal}
        isMutating={isMutating}
      />
    </>
  );
}