/**
 * Normalize quantity input - handles comma/dot decimal separators
 * Throws error for invalid inputs (NaN, negative, etc.)
 */
export function normalizeQty(x: string | number): number {
  if (typeof x === "number") {
    if (!Number.isFinite(x) || x < 0) {
      throw new Error(`INVALID_QTY: ${x}`)
    }
    return x
  }

  // Convert string: remove spaces, replace comma with dot
  const cleaned = String(x).trim().replace(/\s+/g, "").replace(",", ".")
  const value = Number(cleaned)

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`INVALID_QTY: ${x}`)
  }

  return value
}

/**
 * Validate and normalize portfolio holdings
 */
export function normalizeHoldings(holdings: Record<string, any>): Record<string, number> {
  const normalized: Record<string, number> = {}

  for (const [symbol, amount] of Object.entries(holdings)) {
    try {
      normalized[symbol.toUpperCase()] = normalizeQty(amount)
    } catch (error) {
      throw new Error(`Invalid amount for ${symbol}: ${error}`)
    }
  }

  return normalized
}

/**
 * Check if we have enough valid assets for analysis
 */
export function validateMinimumAssets(
  symbols: string[],
  prices: Record<string, number | null>,
  history: Record<string, { t: number[]; p: number[] }>,
  minAssets = 3,
  minHistoryPoints = 60,
): { eligible: string[]; notes: string[] } {
  const notes: string[] = []
  const eligible: string[] = []

  for (const symbol of symbols) {
    const price = prices[symbol]
    const hist = history[symbol]

    if (price == null) {
      notes.push(`Ignored ${symbol} - no price available`)
      continue
    }

    if (!hist || hist.p.length < minHistoryPoints) {
      notes.push(`Ignored ${symbol} - insufficient history (${hist?.p.length || 0} < ${minHistoryPoints} points)`)
      continue
    }

    eligible.push(symbol)
  }

  if (eligible.length < minAssets) {
    notes.push(`WARNING: Only ${eligible.length} eligible assets (minimum ${minAssets} recommended)`)
  }

  return { eligible, notes }
}
