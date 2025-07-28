// src/components/FloatingActions.tsx
'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import AddTransactionModal from './AddTransactionModal';
import VoiceRecorder from './VoiceRecorder';
import AiConfirmationModal from './AiConfirmationModal'; // 1. Import the new modal
import { useTransactions } from '@/hooks/useTransactions'; // We need the hook here now
import type { AiResponse } from '@/types';

const FloatingActions = () => {
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  // 2. State to hold the AI result and control the confirmation modal
  const [aiData, setAiData] = useState<AiResponse | null>(null);

  // 3. Get the processing function from the hook
  const { processVoice, isProcessingVoice } = useTransactions();

  const handleVoiceResult = (audioFile: File) => {
    // 4. Call the mutation. The onSuccess will be handled here.
    processVoice(audioFile, {
      onSuccess: (data) => {
        // On success, we set the AI data, which opens our new modal
        setAiData(data);
      },
    });
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 flex flex-col items-center gap-4">
        {/* The VoiceRecorder is now slightly dumber. It just records. */}
        <VoiceRecorder 
          onRecordingComplete={handleVoiceResult}
          isProcessing={isProcessingVoice}
        />
        
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all"
          aria-label="Add transaction manually"
        >
          <Plus size={28} />
        </button>
      </div>
      
      {/* Manual Add Modal */}
      <AddTransactionModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />

      {/* 5. AI Confirmation Modal */}
      <AiConfirmationModal
        aiData={aiData}
        onClose={() => setAiData(null)}
      />
    </>
  );
};

export default FloatingActions;