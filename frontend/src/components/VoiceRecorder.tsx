// src/components/VoiceRecorder.tsx
'use client';

import { Mic } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: File) => void;
  isProcessing: boolean; // We still accept this prop to know when to show the spinner
}

const VoiceRecorder = ({ onRecordingComplete, isProcessing }: VoiceRecorderProps) => {
  // 1. A single state to manage the component's status
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 2. This effect syncs our internal state with the parent's processing prop
  useEffect(() => {
    if (isProcessing) {
      setStatus('processing');
    } else if (status === 'processing' && !isProcessing) {
      // When the parent is done processing, we can become idle again
      setStatus('idle');
    }
  }, [isProcessing, status]);

  const startRecording = async () => {
    // Can only start recording if we are idle
    if (status !== 'idle') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('recording'); // Set our internal state

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          const audioFile = new File([audioBlob], 'voice-expense.webm', { type: 'audio/webm' });
          onRecordingComplete(audioFile);
        }
        // The useEffect will handle changing the status to 'processing'
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('idle'); // Reset on error
      alert('Microphone access was denied. Please allow it in your browser settings.');
    }
  };

  const stopRecording = () => {
    // Can only stop if we are currently recording
    if (status !== 'recording' || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    // We let the 'onstop' event and the useEffect handle the state change
  };

  // 3. The button is only truly disabled when it's processing.
  // It remains active during recording to ensure it receives the 'up' event.
  const isDisabled = status === 'processing';

  const getButtonClasses = () => {
    switch (status) {
      case 'recording':
        return 'bg-red-500 animate-pulse';
      case 'processing':
        return 'bg-yellow-500 cursor-not-allowed';
      case 'idle':
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      onTouchCancel={stopRecording}
      disabled={isDisabled}
      className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${getButtonClasses()}`}
      aria-label="Hold to record expense"
    >
      {status === 'processing' ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <Mic size={32} />
      )}
    </button>
  );
};

export default VoiceRecorder;