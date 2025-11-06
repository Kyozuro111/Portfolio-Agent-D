"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceCommandsProps {
  onCommand: (command: string) => void
  disabled?: boolean
}

export function VoiceCommands({ onCommand, disabled = false }: VoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " "
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript || interimTranscript)

          if (finalTranscript) {
            onCommand(finalTranscript.trim())
            setIsListening(false)
            recognitionRef.current.stop()
            toast({
              title: "Voice Command Received",
              description: finalTranscript.trim(),
            })
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
          toast({
            title: "Voice Recognition Error",
            description: event.error === "no-speech" ? "No speech detected" : "Please try again",
            variant: "destructive",
          })
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [onCommand, toast])

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser does not support voice recognition",
        variant: "destructive",
      })
      return
    }

    try {
      setTranscript("")
      setIsListening(true)
      recognitionRef.current.start()
      toast({
        title: "Listening...",
        description: "Speak your command now",
      })
    } catch (error) {
      console.error("Failed to start recognition:", error)
      setIsListening(false)
      toast({
        title: "Failed to Start",
        description: "Could not start voice recognition",
        variant: "destructive",
      })
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // Speak response using Web Speech API
  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!isSupported) {
    return null // Don't show if not supported
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || !isSupported}
        className="relative"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-2" />
            Listening...
            <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Voice
          </>
        )}
      </Button>
      {transcript && (
        <div className="text-xs text-muted-foreground max-w-[200px] truncate">
          "{transcript}"
        </div>
      )}
    </div>
  )
}

// Export speak function for use in other components
export const speakText = (text: string) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    window.speechSynthesis.speak(utterance)
  }
}
