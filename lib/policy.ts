/**
 * Default risk policy for portfolio alerts
 */
export interface RiskPolicy {
  maxWeight: number // Maximum single asset weight (e.g., 0.35 = 35%)
  minStablePct: number // Minimum stablecoin allocation (e.g., 0.15 = 15%)
  maxVolPct: number // Maximum annualized volatility (e.g., 60 = 60%)
  maxDrawdownDayPct: number // Maximum drawdown threshold (e.g., 12 = 12%)
  blacklist: string[] // Assets to exclude from recommendations
}

export const DEFAULT_POLICY: RiskPolicy = {
  maxWeight: 0.35,
  minStablePct: 0.15,
  maxVolPct: 60,
  maxDrawdownDayPct: 12,
  blacklist: [],
}

export function loadPolicy(userId?: string): RiskPolicy {
  // In the future, load user-specific policies
  // For now, return default
  return { ...DEFAULT_POLICY }
}
