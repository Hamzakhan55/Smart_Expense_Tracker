// src/components/VoiceRecorder.tsx
'use client';

import { Mic } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTransactions } from '@/hooks/useTransactions';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { addExpenseFromVoice, isProcessingVoice } = useTransactions();

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'voice-expense.webm', { type: 'audio/webm' });
          
          addExpenseFromVoice(audioFile);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Microphone access denied. Please allow microphone access.');
        setIsRecording(false);
      }
    }
  };

  const getButtonState = () => {
    if (isProcessingVoice) return { bg: 'bg-yellow-500', text: 'Processing...', disabled: true };
    if (isRecording) return { bg: 'bg-red-500 animate-pulse', text: 'Recording...', disabled: false };
    return { bg: 'bg-blue-600', text: 'Voice Record', disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleRecording}
        disabled={buttonState.disabled}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${buttonState.bg}`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isProcessingVoice ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Mic size={32} />
        )}
      </button>
      <span className="text-xs text-gray-600 font-medium">{buttonState.text}</span>
    </div>
  );
};

export default VoiceRecorder;