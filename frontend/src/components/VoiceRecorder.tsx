"use client"

import { Mic, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: File) => void
  isProcessing: boolean
}

const VoiceRecorder = ({ onRecordingComplete, isProcessing }: VoiceRecorderProps) => {
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (isProcessing) {
      setStatus("processing")
    } else if (status === "processing" && !isProcessing) {
      setStatus("idle")
    }
  }, [isProcessing, status])

  const startRecording = async () => {
    if (status !== "idle") return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStatus("recording")

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        if (audioBlob.size > 0) {
          const audioFile = new File([audioBlob], "voice-expense.webm", { type: "audio/webm" })
          onRecordingComplete(audioFile)
        }
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setStatus("idle")
      alert("Microphone access was denied. Please allow it in your browser settings.")
    }
  }

  const stopRecording = () => {
    if (status !== "recording" || !mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
  }

  const isDisabled = status === "processing"

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
    <div className="relative">
      {/* Pulse rings for recording state */}
      {status === "recording" && (
        <>
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150"></div>
          <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping scale-125 animation-delay-75"></div>
        </>
      )}

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        onTouchCancel={stopRecording}
        disabled={isDisabled}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 transform active:scale-95 ${getButtonClasses()}`}
        aria-label="Hold to record expense"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {status === "processing" ? (
          <div className="relative">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 w-4 h-4 m-auto text-white/60" />
          </div>
        ) : (
          <Mic size={32} className="relative z-10" />
        )}

        {/* Status indicator */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border transition-all duration-200 ${
              status === "recording"
                ? "bg-red-500/90 text-white border-red-400/50"
                : status === "processing"
                  ? "bg-amber-500/90 text-white border-amber-400/50"
                  : "bg-white/90 text-slate-700 border-white/50 opacity-0 group-hover:opacity-100"
            }`}
          >
            {status === "recording" ? "Recording..." : status === "processing" ? "Processing..." : "Hold to record"}
          </div>
        </div>
      </button>
    </div>
  )
}

export default VoiceRecorder
