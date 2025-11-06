export interface ResolvedAsset {
  symbol: string
  name: string
  cgId: string | null
  cmcId: string | null
  contracts: Record<string, string>
  logoUrl: string
  source: "registry" | "search" | "manual"
}

export interface RiskMetrics {
  windowDays: number
  volPct: number
  sharpe: number
  sortino: number
  maxDDPct: number
  betaBTC: number
  var95Pct: number
  cvar95Pct: number
  corr: Record<string, Record<string, number>>
}

export interface HealthScores {
  health: number
  diversification: number
  momentum: number
}

export interface RebalanceAction {
  symbol: string
  side: "buy" | "sell" | "hold"
  valueUSD: number
}

export interface RebalanceOutput {
  targetWeights: Record<string, number>
  actions: RebalanceAction[]
  notes: string[]
}

export interface NewsItem {
  title: string
  url: string
  symbols: string[]
  sentiment: number
  summary?: string
  source?: string
  timestamp?: string
}

export interface NewsOutput {
  items: NewsItem[]
  sentiment: Record<string, number>
}

export interface Alert {
  level: "high" | "medium" | "low"
  code: string
  message: string
}

export interface RiskPolicy {
  maxWeight: number
  minStablePct: number
  maxVolPct: number
  maxDrawdownDayPct: number
}

export interface Opportunity {
  symbol: string
  name: string
  score: number
  reasons: string[]
  momentum: string
  sentiment: number
}

export interface Portfolio {
  holdings: Array<{
    symbol: string
    amount: number
    chain?: string
    address?: string
  }>
}

export interface AgentEvent {
  type: "progress" | "complete" | "error"
  step: string
  message: string
  data?: any
  timestamp: number
}
