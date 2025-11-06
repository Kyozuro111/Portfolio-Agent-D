import { type NextRequest, NextResponse } from "next/server"
import { getKeys } from "@/lib/keys"
import { type ROMAPlan, executeROMAPlan } from "@/lib/agent/planner"
import {
  AssetResolverTool,
  PricesTool,
  HistoryTool,
  RiskMetricsTool,
  HealthScoresTool,
  AlertsTool,
  RebalanceTool,
  NewsResearchTool,
  OpportunityScannerTool,
  type ToolContext,
} from "@/lib/agent/tools"
import { LLMAgent } from "@/lib/agent/llm"
import type { RiskPolicy } from "@/lib/types"
import { generateText } from "ai"

const DEFAULT_POLICY: RiskPolicy = {
  maxWeight: 0.35,
  minStablePct: 0.2,
  maxVolPct: 60,
  maxDrawdownDayPct: 25,
}

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).substring(2, 7)
  console.log(`[portfolio-agent] [${reqId}] Route handler started`)

  try {
    const body = await req.json()
    console.log(`[portfolio-agent] [${reqId}] Request body received:`, JSON.stringify(body).substring(0, 200))

    const { portfolio } = body
    if (!portfolio?.holdings || !Array.isArray(portfolio.holdings)) {
      return NextResponse.json({ error: "Invalid portfolio data" }, { status: 400 })
    }

    const keys = getKeys()
    console.log(`[portfolio-agent] [${reqId}] Keys loaded:`, Array.from(keys.keys()).join(", "))

    const ctx: ToolContext = {
      userKeys: keys,
      userId: "default",
    }

    const tools = {
      resolver: new AssetResolverTool(),
      prices: new PricesTool(),
      history: new HistoryTool(),
      risk_metrics: new RiskMetricsTool(),
      health_scores: new HealthScoresTool(),
      alerts: new AlertsTool(),
      rebalance: new RebalanceTool(),
      news: new NewsResearchTool(),
      opportunities: new OpportunityScannerTool(),
    }

    const plan: ROMAPlan = {
      goal: "Analyze Portfolio",
      steps: [
        { name: "fetch_history", tool: "history", input: { symbols: [], windowDays: 90 } },
        { name: "compute_risk", tool: "risk_metrics", input: { history: "$fetch_history", weights: {} } },
        {
          name: "compute_health",
          tool: "health_scores",
          input: { risk: "$compute_risk", pnlPct: 0, weights: {}, history: "$fetch_history" },
        },
        {
          name: "check_alerts",
          tool: "alerts",
          input: { risk: "$compute_risk", weights: {}, holdings: [], policy: DEFAULT_POLICY },
        },
      ],
    }

    const symbols = portfolio.holdings.map((h: any) => h.symbol)
    plan.steps[0].input.symbols = symbols

    const pricesResult = await tools.prices.run({ symbols }, ctx)
    const prices = pricesResult.data

    let totalValue = 0
    const holdings: Array<{ symbol: string; amount: number; value: number }> = []

    for (const h of portfolio.holdings) {
      const price = prices[h.symbol] || 0
      const value = h.amount * price
      totalValue += value
      holdings.push({ symbol: h.symbol, amount: h.amount, value })
    }

    const weights: Record<string, number> = {}
    for (const h of holdings) {
      weights[h.symbol] = totalValue > 0 ? h.value / totalValue : 0
    }

    plan.steps[1].input.weights = weights
    plan.steps[2].input.weights = weights
    plan.steps[3].input.weights = weights
    plan.steps[3].input.holdings = holdings

    console.log(`[portfolio-agent] Executing ROMA plan: ${plan.goal}`)
    const result = await executeROMAPlan(plan, tools, ctx)
    console.log(`[portfolio-agent] [${reqId}] ROMA complete`)

    const fireworksKey = keys.get("FIREWORKS_API_KEY") || ""
    const groqKey = keys.get("GROQ_API_KEY") || ""
    const openrouterKey = keys.get("OPENROUTER_API_KEY") || ""

    let analysis = ""
    let model = ""

    if (fireworksKey) {
      try {
        console.log(`[portfolio-agent] LLM request to fireworks with model: accounts/fireworks/models/llama-v3p1-70b-instruct`)
        const { text } = await generateText({
          model: "fireworks/accounts/fireworks/models/llama-v3p1-70b-instruct",
          prompt: `You are a professional crypto portfolio analyst. Analyze this portfolio data and provide actionable insights in 2-3 concise paragraphs.

Portfolio Data:
${JSON.stringify(result, null, 2)}

Focus on: risk assessment, diversification quality, and specific recommendations.`,
          apiKey: fireworksKey,
        })
        analysis = text
        model = "fireworks"
        console.log(`[portfolio-agent] fireworks analysis successful`)
      } catch (error) {
        console.error(`[portfolio-agent] fireworks failed:`, error)
      }
    }

    if (!analysis && groqKey) {
      try {
        console.log(`[portfolio-agent] LLM request to groq with model: llama-3.3-70b-versatile`)
        const { text } = await generateText({
          model: "groq/llama-3.3-70b-versatile",
          prompt: `You are a professional crypto portfolio analyst. Analyze this portfolio data and provide actionable insights in 2-3 concise paragraphs.

Portfolio Data:
${JSON.stringify(result, null, 2)}

Focus on: risk assessment, diversification quality, and specific recommendations.`,
          apiKey: groqKey,
        })
        analysis = text
        model = "groq"
        console.log(`[portfolio-agent] groq analysis successful`)
      } catch (error) {
        console.error(`[portfolio-agent] groq failed:`, error)
      }
    }

    if (!analysis && openrouterKey) {
      try {
        console.log(`[portfolio-agent] LLM request to openrouter with model: meta-llama/llama-3.1-70b-instruct`)
        const { text } = await generateText({
          model: "openrouter/meta-llama/llama-3.1-70b-instruct",
          prompt: `You are a professional crypto portfolio analyst. Analyze this portfolio data and provide actionable insights in 2-3 concise paragraphs.

Portfolio Data:
${JSON.stringify(result, null, 2)}

Focus on: risk assessment, diversification quality, and specific recommendations.`,
          apiKey: openrouterKey,
        })
        analysis = text
        model = "openrouter"
        console.log(`[portfolio-agent] openrouter analysis successful`)
      } catch (error) {
        console.error(`[portfolio-agent] openrouter failed:`, error)
      }
    }

    if (!analysis) {
      const aimlKey = keys.get("AIML_API_KEY") || ""
      if (aimlKey) {
        try {
          console.log(`[portfolio-agent] LLM request to AIML with model: meta-llama/Llama-3.3-70B-Instruct-Turbo`)
          const llmAgent = new LLMAgent(aimlKey, "meta-llama/Llama-3.3-70B-Instruct-Turbo", "aiml")
          const analysisResponse = await llmAgent.analyze(result)
          // Convert LLMResponse to text
          analysis = [
            ...analysisResponse.insights,
            ...analysisResponse.actions.map((a) => `Action: ${a.action}. Pros: ${a.pros.join(", ")}. Cons: ${a.cons.join(", ")}`),
          ].join("\n\n")
          model = "aiml"
          console.log(`[portfolio-agent] AIML analysis successful`)
        } catch (error) {
          console.error(`[portfolio-agent] AIML failed:`, error)
        }
      }
    }

    if (!analysis) {
      analysis =
        "Portfolio analysis complete. Review the metrics and alerts above for detailed insights into your portfolio's risk profile and health scores."
    }

    console.log(`[portfolio-agent] [${reqId}] Analysis complete`)

    return NextResponse.json({
      ...result,
      analysis,
      model,
      holdings,
      weights,
    })
  } catch (error) {
    console.error(`[portfolio-agent] [${reqId}] Error:`, error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 })
  }
}
