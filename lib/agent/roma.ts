import type { ToolContext } from "./tools"
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
} from "./tools"

export interface ROMAPlan {
  name: string
  steps: ROMAPlanStep[]
}

export interface ROMAPlanStep {
  name: string
  tool: string
  input: any
  parallel?: boolean
}

export interface ROMAPlanResult {
  blackboard: Record<string, any>
  events: Array<{ step: string; message: string; timestamp: number }>
}

export class ROMARunner {
  private tools: Map<string, any>
  private ctx: ToolContext

  constructor(ctx: ToolContext) {
    this.ctx = ctx
    this.tools = new Map([
      ["asset_resolver", new AssetResolverTool()],
      ["prices", new PricesTool()],
      ["history", new HistoryTool()],
      ["risk_metrics", new RiskMetricsTool()],
      ["health_scores", new HealthScoresTool()],
      ["alerts", new AlertsTool()],
      ["rebalance", new RebalanceTool()],
      ["news_research", new NewsResearchTool()],
      ["opportunity_scanner", new OpportunityScannerTool()],
    ])
  }

  async executePlan(plan: ROMAPlan, initialBlackboard: Record<string, any> = {}): Promise<ROMAPlanResult> {
    const blackboard = { ...initialBlackboard }
    const events: Array<{ step: string; message: string; timestamp: number }> = []

    console.log("[portfolio-agent] Executing ROMA plan:", plan.name)

    for (const step of plan.steps) {
      console.log("[portfolio-agent] Executing step:", step.name, "with tool:", step.tool)

      events.push({
        step: step.name,
        message: `Executing ${step.name}...`,
        timestamp: Date.now(),
      })

      const tool = this.tools.get(step.tool)
      if (!tool) {
        throw new Error(`Tool ${step.tool} not found`)
      }

      try {
        const input = this.resolveInput(step.input, blackboard)
        console.log("[portfolio-agent] Tool input:", JSON.stringify(input).slice(0, 200))

        const result = await tool.run(input, this.ctx)
        console.log("[portfolio-agent] Tool result:", JSON.stringify(result).slice(0, 200))

        blackboard[step.name] = result

        events.push({
          step: step.name,
          message: `Completed ${step.name}`,
          timestamp: Date.now(),
        })
      } catch (error) {
        console.error(`[portfolio-agent] Error in step ${step.name}:`, error)
        throw error
      }
    }

    return { blackboard, events }
  }

  private resolveInput(input: any, blackboard: Record<string, any>): any {
    if (typeof input === "string" && input.startsWith("$")) {
      const key = input.slice(1)
      return blackboard[key]
    }

    if (typeof input === "object" && input !== null) {
      const resolved: any = Array.isArray(input) ? [] : {}
      for (const [key, value] of Object.entries(input)) {
        resolved[key] = this.resolveInput(value, blackboard)
      }
      return resolved
    }

    return input
  }
}

export const PLAN_ANALYZE_PORTFOLIO: ROMAPlan = {
  name: "Analyze Portfolio",
  steps: [
    {
      name: "fetch_history",
      tool: "history",
      input: { symbols: "$symbols", windowDays: 90 },
    },
    {
      name: "compute_risk",
      tool: "risk_metrics",
      input: { history: "$fetch_history", weights: "$weights" },
    },
    {
      name: "compute_health",
      tool: "health_scores",
      input: { risk: "$compute_risk", pnlPct: 12.5, weights: "$weights", history: "$fetch_history" },
    },
    {
      name: "check_alerts",
      tool: "alerts",
      input: { risk: "$compute_risk", policy: "$policy", weights: "$weights" },
    },
  ],
}

export const PLAN_REBALANCE_ADVISOR: ROMAPlan = {
  name: "Rebalance Advisor",
  steps: [
    {
      name: "fetch_prices",
      tool: "prices",
      input: { symbols: "$symbols" },
    },
    {
      name: "fetch_history",
      tool: "history",
      input: { symbols: "$symbols", windowDays: 90 },
    },
    {
      name: "compute_risk",
      tool: "risk_metrics",
      input: { history: "$fetch_history" },
    },
    {
      name: "generate_rebalance",
      tool: "rebalance",
      input: {
        holdings: "$holdings",
        prices: "$fetch_prices",
        history: "$fetch_history",
        constraints: "$constraints",
      },
    },
    {
      name: "check_alerts",
      tool: "alerts",
      input: { risk: "$compute_risk", policy: "$policy", weights: "$weights" },
    },
  ],
}

export const PLAN_FIND_OPPORTUNITIES: ROMAPlan = {
  name: "Find Opportunities",
  steps: [
    {
      name: "fetch_history",
      tool: "history",
      input: { symbols: "$symbols", windowDays: 90 },
    },
    {
      name: "fetch_news",
      tool: "news_research",
      input: { symbols: "$symbols", lookbackDays: 7 },
    },
    {
      name: "scan_opportunities",
      tool: "opportunity_scanner",
      input: { symbols: "$symbols", history: "$fetch_history", news: "$fetch_news" },
    },
  ],
}
