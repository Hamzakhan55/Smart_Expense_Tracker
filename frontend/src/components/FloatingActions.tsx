'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import AddTransactionModal from './AddTransactionModal';

const FloatingActions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-24 right-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all"
        >
          <Plus size={28} />
        </button>
      </div>
      
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default FloatingActions;