import { LLMAgent } from "@/lib/agent/llm"
import { getUserKeys } from "@/lib/keys"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    console.log(`[portfolio-agent] [${requestId}] Chat route started`)

    const body = await request.json()
    const { message, portfolio, userId = "default" } = body

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get keys from environment variables only
    const userKeys = getUserKeys(userId)
    const fireworksKey = userKeys.get("FIREWORKS_API_KEY") || ""
    const groqKey = userKeys.get("GROQ_API_KEY") || ""
    const openrouterKey = userKeys.get("OPENROUTER_API_KEY") || ""
    const aimlKey = userKeys.get("AIML_API_KEY") || ""

    // Try Fireworks first if available (user updated key), then fallback to free providers
    const providers = [
      { key: fireworksKey, model: "accounts/fireworks/models/llama-v3p1-70b-instruct", name: "fireworks" }, // Try Fireworks first (user updated key)
      { key: groqKey, model: "llama-3.3-70b-versatile", name: "groq" }, // Fallback 1 (fast, free)
      { key: openrouterKey, model: "meta-llama/llama-3.1-70b-instruct", name: "openrouter" }, // Fallback 2
      { key: aimlKey, model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "aiml" }, // Fallback 3
    ]

    // Build context from portfolio if available
    let context = ""
    if (portfolio && portfolio.holdings) {
      const totalValue = portfolio.holdings.reduce((sum: number, h: any) => sum + Number(h.amount), 0)
      const holdings = portfolio.holdings
        .map((h: any) => {
          const pct = ((Number(h.amount) / totalValue) * 100).toFixed(1)
          return `${h.symbol}: $${Number(h.amount).toLocaleString()} (${pct}%)`
        })
        .join(", ")

      context = `Current portfolio: Total value $${totalValue.toLocaleString()}. Holdings: ${holdings}.`
    }

    // Create a conversational prompt
    const prompt = `You are an expert crypto portfolio advisor. ${context}

User question: ${message}

Provide a helpful, concise response (2-3 sentences max). Focus on actionable insights about portfolio management, risk, diversification, or market trends. Be direct and professional.`

    // Try each provider in order until one succeeds
    let response = ""
    let lastError: Error | null = null

    for (const provider of providers) {
      if (!provider.key) continue

      try {
        console.log(`[portfolio-agent] [${requestId}] Trying ${provider.name}...`)
        const llm = new LLMAgent(provider.key, provider.model, provider.name as any)
        response = await llm.chat(prompt)
        console.log(`[portfolio-agent] [${requestId}] ${provider.name} response received`)
        break
      } catch (error) {
        console.error(`[portfolio-agent] [${requestId}] ${provider.name} failed:`, error)
        lastError = error instanceof Error ? error : new Error(String(error))
        // Continue to next provider
      }
    }

    if (!response) {
      return new Response(
        JSON.stringify({
          response: lastError
            ? "I'm currently experiencing issues with my AI providers. Please check your API keys and billing status, or try again later."
            : "I'm currently unavailable. Please configure an LLM API key (Fireworks, Groq, OpenRouter, or AIML) in the settings to enable chat functionality.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error(`[portfolio-agent] [${requestId}] Chat error:`, error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat message",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
