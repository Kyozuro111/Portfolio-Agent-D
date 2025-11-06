"use client"

import { useState, useCallback, useRef } from "react"
import type { AgentEvent } from "@/lib/types"

export interface AgentStreamState {
  isRunning: boolean
  events: AgentEvent[]
  result: any | null
  error: string | null
}

export function useAgentStream() {
  const [state, setState] = useState<AgentStreamState>({
    isRunning: false,
    events: [],
    result: null,
    error: null,
  })

  const eventSourceRef = useRef<EventSource | null>(null)

  const startStream = useCallback(async (endpoint: string, body: any) => {
    setState({
      isRunning: true,
      events: [],
      result: null,
      error: null,
    })

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let buffer = "" // Buffer for incomplete lines

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const lines = buffer.split("\n")
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonStr = line.slice(6).trim()
                  if (jsonStr) {
                    const event: AgentEvent = JSON.parse(jsonStr)

                    setState((prev) => ({
                      ...prev,
                      events: [...prev.events, event],
                    }))

                    if (event.type === "complete") {
                      setState((prev) => ({
                        ...prev,
                        isRunning: false,
                        result: event.data,
                      }))
                    } else if (event.type === "error") {
                      setState((prev) => ({
                        ...prev,
                        isRunning: false,
                        error: event.message,
                      }))
                    }
                  }
                } catch (e) {
                  // Ignore parse errors for incomplete JSON
                  if (e instanceof SyntaxError && !e.message.includes("Unexpected end") && !e.message.includes("Unterminated")) {
                    console.error("[portfolio-agent] Failed to parse event:", e)
                  }
                }
              }
            }
          }
          break
        }

        // Decode chunk and append to buffer
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        
        // Keep last incomplete line in buffer
        buffer = lines.pop() || ""

        // Process complete lines
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6).trim()
              if (jsonStr) {
                const event: AgentEvent = JSON.parse(jsonStr)

                setState((prev) => ({
                  ...prev,
                  events: [...prev.events, event],
                }))

                if (event.type === "complete") {
                  setState((prev) => ({
                    ...prev,
                    isRunning: false,
                    result: event.data,
                  }))
                } else if (event.type === "error") {
                  setState((prev) => ({
                    ...prev,
                    isRunning: false,
                    error: event.message,
                  }))
                }
              }
            } catch (e) {
              // Ignore parse errors for incomplete JSON
              if (e instanceof SyntaxError && !e.message.includes("Unexpected end") && !e.message.includes("Unterminated")) {
                console.error("[portfolio-agent] Failed to parse event:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("[portfolio-agent] Stream error:", error)
      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }))
    }
  }, [])

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setState({
      isRunning: false,
      events: [],
      result: null,
      error: null,
    })
  }, [])

  return {
    ...state,
    startStream,
    reset,
  }
}
