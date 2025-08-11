"use client"

import { Mic, Sparkles, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"

interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: File) => void
  isProcessing: boolean
  onCancel?: () => void
}

const VoiceRecorder = ({ onRecordingComplete, isProcessing, onCancel }: VoiceRecorderProps) => {
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle")
  const [showModal, setShowModal] = useState(false)
  const { getModalClass, getTextClass } = useTheme()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (isProcessing) {
      setStatus("processing")
      setShowModal(true)
    } else if (status === "processing" && !isProcessing) {
      setStatus("idle")
      setShowModal(false)
    }
  }, [isProcessing, status])

  const toggleRecording = async () => {
    if (status === "idle") {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          } 
        })
        setStatus("recording")

        let mimeType = "audio/webm"
        if (!MediaRecorder.isTypeSupported("audio/webm")) {
          if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4"
          } else if (MediaRecorder.isTypeSupported("audio/wav")) {
            mimeType = "audio/wav"
          }
        }
        
        const recorder = new MediaRecorder(stream, { mimeType })
        mediaRecorderRef.current = recorder
        audioChunksRef.current = []

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
          
          if (audioBlob.size > 0) {
            const audioFile = new File([audioBlob], "voice-expense.webm", { type: mimeType })
            onRecordingComplete(audioFile)
          } else {
            alert("Recording failed. Please try again.")
            setStatus("idle")
            return
          }
          
          stream.getTracks().forEach((track) => track.stop())
        }

        recorder.onerror = () => {
          setStatus("idle")
          stream.getTracks().forEach((track) => track.stop())
          alert("Recording error occurred. Please try again.")
        }

        recorder.start(100)
        
      } catch (error) {
        setStatus("idle")
        alert("Microphone access was denied. Please allow it in your browser settings.")
      }
    } else if (status === "recording") {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }

  const cancelProcessing = () => {
    // Call parent cancel function to stop API request
    onCancel?.()
    
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    
    // Stop all media tracks
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    
    // Reset state
    setStatus("idle")
    setShowModal(false)
    mediaRecorderRef.current = null
    audioChunksRef.current = []
  }



  const getButtonClasses = () => {
    switch (status) {
      case "recording":
        return "bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/30 animate-pulse scale-110"
      case "processing":
        return "bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/30 cursor-not-allowed"
      case "idle":
      default:
        return "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
    }
  }

  return (
    <>
      <div className="relative">
        {/* Pulse rings for recording state */}
        {status === "recording" && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150"></div>
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping scale-125 animation-delay-75"></div>
          </>
        )}

        <button
          onClick={toggleRecording}
          disabled={status === "processing"}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 transform active:scale-95 ${getButtonClasses()}`}
          aria-label={status === "idle" ? "Click to start recording" : status === "recording" ? "Click to stop recording" : "Processing..."}
        >
          <Mic size={32} className="relative z-10" />

          {/* Status indicator */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border transition-all duration-200 ${
                status === "recording"
                  ? "bg-red-500/90 text-white border-red-400/50"
                  : "bg-white/90 text-slate-700 border-white/50 opacity-0 group-hover:opacity-100"
              }`}
            >
              {status === "recording" ? "Click to stop" : "Click to record"}
            </div>
          </div>
        </button>
      </div>

      {/* Processing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${getModalClass()} p-8 max-w-sm mx-4 text-center`}>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 w-8 h-8 m-auto text-blue-600/60" />
              </div>
              <h3 className={`text-xl font-semibold ${getTextClass('primary')} mb-2`}>Processing Your Expense</h3>
              <p className={getTextClass('secondary')}>AI is analyzing your voice recording...</p>
            </div>
            
            <button
              onClick={cancelProcessing}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <X size={20} />
              Cancel Command
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default VoiceRecorder
