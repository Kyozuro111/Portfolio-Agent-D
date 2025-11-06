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
        const newsOutput = await newsTool.run({ symbols, lookbackDays }, ctx)

        sendEvent({
          type: "progress",
          step: "analyze_sentiment",
          message: "Analyzing sentiment...",
          timestamp: Date.now(),
        })

        await new Promise((resolve) => setTimeout(resolve, 500))

        sendEvent({
          type: "complete",
          step: "complete",
          message: "News research complete",
          data: newsOutput,
          timestamp: Date.now(),
        })

        controller.close()
      } catch (error) {
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
