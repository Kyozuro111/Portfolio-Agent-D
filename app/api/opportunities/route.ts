import type { NextRequest } from "next/server"
import type { Opportunity, AgentEvent } from "@/lib/types"
import { OpportunityScannerTool, HistoryTool, NewsResearchTool } from "@/lib/agent/tools"
import { getUserKeys } from "@/lib/keys"

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
        const { symbols } = body as { symbols: string[] }

        if (!symbols || symbols.length === 0) {
          sendEvent({
            type: "error",
            step: "validation",
            message: "Symbols array is required",
            timestamp: Date.now(),
          })
          controller.close()
          return
        }

        const userKeys = getUserKeys("default")
        const ctx = { userKeys, userId: "default" }

        sendEvent({
          type: "progress",
          step: "start",
          message: "Scanning for opportunities...",
          timestamp: Date.now(),
        })

        sendEvent({
          type: "progress",
          step: "fetch_history",
          message: "Fetching historical price data...",
          timestamp: Date.now(),
        })

        const historyTool = new HistoryTool()
        const historyResult = await historyTool.run({ symbols, windowDays: 90 }, ctx)

        sendEvent({
          type: "progress",
          step: "fetch_news",
          message: "Analyzing news sentiment...",
          timestamp: Date.now(),
        })

        const newsTool = new NewsResearchTool()
        const newsResult = await newsTool.run({ symbols, lookbackDays: 7 }, ctx)

        sendEvent({
          type: "progress",
          step: "analyze",
          message: "Analyzing momentum and sentiment...",
          timestamp: Date.now(),
        })

        const opportunityTool = new OpportunityScannerTool()
        const opportunitiesResult = await opportunityTool.run(
          {
            symbols,
            history: historyResult.data,
            news: newsResult,
          },
          ctx,
        )

        sendEvent({
          type: "complete",
          step: "complete",
          message: "Opportunity scan complete",
          data: opportunitiesResult,
          timestamp: Date.now(),
        })

        controller.close()
      } catch (error) {
        console.error("[portfolio-agent] Opportunities API error:", error)
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
