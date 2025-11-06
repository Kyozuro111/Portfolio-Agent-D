import type { NextRequest } from "next/server"
import type { AgentEvent } from "@/lib/types"
import { NewsResearchTool } from "@/lib/agent/tools"

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: AgentEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      try {
        const body = await request.json()
        const { symbols, lookbackDays = 7 } = body as { 
          symbols: string[]
          lookbackDays?: number
        }

        const { getUserKeys } = await import("@/lib/keys")
        
        // Get keys from environment variables only
        const userKeys = getUserKeys("default")
        
        const ctx = {
          userKeys,
          userId: "default",
        }

        sendEvent({
          type: "progress",
          step: "start",
          message: "Starting news research...",
          timestamp: Date.now(),
        })

        sendEvent({
          type: "progress",
          step: "search",
          message: "Searching news sources...",
          timestamp: Date.now(),
        })

        const newsTool = new NewsResearchTool()
        let newsOutput
        try {
          newsOutput = await newsTool.run({ symbols, lookbackDays }, ctx)
        } catch (toolError) {
          console.error("[portfolio-agent] NewsResearchTool error:", toolError)
          sendEvent({
            type: "error",
            step: "tool_error",
            message: toolError instanceof Error ? toolError.message : "News research tool failed",
            timestamp: Date.now(),
          })
          controller.close()
          return
        }

        sendEvent({
          type: "progress",
          step: "analyze_sentiment",
          message: "Analyzing sentiment...",
          timestamp: Date.now(),
        })

        await new Promise((resolve) => setTimeout(resolve, 500))

        // Ensure newsOutput has items array
        if (!newsOutput || !newsOutput.items || !Array.isArray(newsOutput.items)) {
          console.log("[portfolio-agent] NewsResearchTool returned empty or invalid data")
          newsOutput = { items: [], sentiment: {} }
        }

        sendEvent({
          type: "complete",
          step: "complete",
          message: "News research complete",
          data: newsOutput,
          timestamp: Date.now(),
        })

        controller.close()
      } catch (error) {
        console.error("[portfolio-agent] News route error:", error)
        sendEvent({
          type: "error",
          step: "error",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: Date.now(),
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
