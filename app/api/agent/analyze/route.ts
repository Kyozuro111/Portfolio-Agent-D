import { ROMARunner, PLAN_ANALYZE_PORTFOLIO } from "@/lib/agent/roma"
import { LLMAgent } from "@/lib/agent/llm"
import { getUserKeys } from "@/lib/keys"
import type { NextRequest } from "next/server"
import type { AgentEvent } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    console.log(`[portfolio-agent] [${requestId}] Route handler started`)

    const body = await request.json()
    console.log(`[portfolio-agent] [${requestId}] Request body received:`, JSON.stringify(body).slice(0, 200))

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: AgentEvent) => {
          const data = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(data))
        }

        try {
          sendEvent({
            type: "progress",
            step: "init",
            message: "Initializing analysis...",
            timestamp: Date.now(),
          })

          console.log(`[portfolio-agent] [${requestId}] Modules loaded successfully`)

          const { portfolio, userId = "default" } = body

          if (!portfolio || !portfolio.holdings || !Array.isArray(portfolio.holdings)) {
            sendEvent({
              type: "error",
              step: "validation_error",
              message: "Invalid portfolio structure",
              timestamp: Date.now(),
            })
            controller.close()
            return
          }

          // Get keys from environment variables only
          const userKeys = getUserKeys(userId)
          console.log(`[portfolio-agent] [${requestId}] Keys loaded:`, Array.from(userKeys.keys()).join(", "))

          const ctx = { userKeys, userId }

          const symbols = portfolio.holdings.map((h: any) => String(h.symbol).toUpperCase())
          const totalAmount = portfolio.holdings.reduce((sum: number, h: any) => sum + Number(h.amount), 0)
          const weights: Record<string, number> = {}

          portfolio.holdings.forEach((h: any) => {
            const symbol = String(h.symbol).toUpperCase()
            const amount = Number(h.amount)
            weights[symbol] = totalAmount > 0 ? amount / totalAmount : 1 / portfolio.holdings.length
          })

          const blackboard = {
            symbols,
            weights,
            policy: {
              maxWeight: 0.35,
              minStablePct: 0.2,
              maxVolPct: 60,
              maxDrawdownDayPct: 25,
            },
          }

          sendEvent({
            type: "progress",
            step: "roma_start",
            message: "Executing portfolio analysis...",
            timestamp: Date.now(),
          })

          const runner = new ROMARunner(ctx)
          const result = await runner.executePlan(PLAN_ANALYZE_PORTFOLIO, blackboard)

          console.log(`[portfolio-agent] [${requestId}] ROMA complete`)

          for (const event of result.events) {
            sendEvent({
              type: "progress",
              step: event.step,
              message: event.message,
              timestamp: event.timestamp,
            })
          }

          sendEvent({
            type: "progress",
            step: "llm_analysis",
            message: "Running AI analysis...",
            timestamp: Date.now(),
          })

          // Try LLM providers in order of preference with automatic fallback
          const fireworksKey = userKeys.get("FIREWORKS_API_KEY") || ""
          const groqKey = userKeys.get("GROQ_API_KEY") || ""
          const openrouterKey = userKeys.get("OPENROUTER_API_KEY") || ""
          const aimlKey = userKeys.get("AIML_API_KEY") || ""

          const providers = [
            { key: fireworksKey, model: "accounts/fireworks/models/llama-v3p1-70b-instruct", name: "fireworks" },
            { key: groqKey, model: "llama-3.3-70b-versatile", name: "groq" },
            { key: openrouterKey, model: "meta-llama/llama-3.1-70b-instruct", name: "openrouter" },
            { key: aimlKey, model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "aiml" },
          ]

          let llmResponse = null
          let lastError: Error | null = null

          // Try each provider in order until one succeeds
          for (const provider of providers) {
            if (!provider.key) continue

            try {
              console.log(`[portfolio-agent] [${requestId}] Trying ${provider.name}...`)
              const llm = new LLMAgent(provider.key, provider.model, provider.name as any)
              llmResponse = await llm.analyze(result.blackboard)
              console.log(`[portfolio-agent] [${requestId}] ${provider.name} analysis successful`)
              break
            } catch (error) {
              console.error(`[portfolio-agent] [${requestId}] ${provider.name} failed:`, error)
              lastError = error instanceof Error ? error : new Error(String(error))
              // Continue to next provider
            }
          }

          if (llmResponse) {
            result.blackboard.llm_insights = llmResponse
          } else {
            result.blackboard.llm_insights = {
              insights: [
                lastError
                  ? "LLM analysis unavailable - all providers failed. Please check your API keys and billing status."
                  : "LLM analysis skipped - no API key configured",
              ],
              actions: [],
              assumptions: [],
              constraints: [],
            }
          }

          sendEvent({
            type: "complete",
            step: "complete",
            message: "Analysis complete",
            data: result.blackboard,
            timestamp: Date.now(),
          })

          console.log(`[portfolio-agent] [${requestId}] Analysis complete`)
          controller.close()
        } catch (error) {
          console.error(`[portfolio-agent] [${requestId}] Stream error:`, error)
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
  } catch (error) {
    console.error(`[portfolio-agent] [${requestId}] Route error:`, error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
