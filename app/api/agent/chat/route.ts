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

    // Try LLM providers in order of preference
    let llm: LLMAgent | null = null
    let provider = ""

    if (fireworksKey) {
      llm = new LLMAgent(fireworksKey, "accounts/fireworks/models/llama-v3p1-70b-instruct", "fireworks")
      provider = "fireworks"
    } else if (groqKey) {
      llm = new LLMAgent(groqKey, "llama-3.3-70b-versatile", "groq")
      provider = "groq"
    } else if (openrouterKey) {
      llm = new LLMAgent(openrouterKey, "meta-llama/llama-3.1-70b-instruct", "openrouter")
      provider = "openrouter"
    } else if (aimlKey) {
      llm = new LLMAgent(aimlKey, "meta-llama/Llama-3.3-70B-Instruct-Turbo", "aiml")
      provider = "aiml"
    }

    if (!llm) {
      return new Response(
        JSON.stringify({
          response:
            "I'm currently unavailable. Please configure an LLM API key (Fireworks, Groq, OpenRouter, or AIML) in the settings to enable chat functionality.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

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

    console.log(`[portfolio-agent] [${requestId}] Sending to LLM`)

    // Use the LLM to generate a response
    const response = await llm.chat(prompt)

    console.log(`[portfolio-agent] [${requestId}] LLM response received`)

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
