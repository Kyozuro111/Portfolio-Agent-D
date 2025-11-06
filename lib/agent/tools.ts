import { fetchWithRetry } from "@/lib/http"
import { cache } from "@/lib/cache"
import type {
  ResolvedAsset,
  RiskMetrics,
  HealthScores,
  RebalanceOutput,
  NewsOutput,
  Alert,
  RiskPolicy,
} from "@/lib/types"

export interface ToolContext {
  userKeys: Map<string, string>
  userId: string
}

export interface ToolInput {
  [key: string]: any
}

export interface ToolOutput {
  [key: string]: any
}

export class AssetResolverTool {
  async run(input: ToolInput, ctx: ToolContext): Promise<ResolvedAsset> {
    const { symbol, chain, address } = input
    const s = symbol.toUpperCase()
    const cacheKey = `resolver:${s}`

    const cached = cache.get<ResolvedAsset>(cacheKey)
    if (cached && !cached.stale) {
      return cached.data
    }

    const cgKey = ctx.userKeys.get("COINGECKO_API_KEY") || ""
    const cmcKey = ctx.userKeys.get("COINMARKETCAP_API_KEY") || ""

    const asset: ResolvedAsset = {
      symbol: s,
      name: s,
      cgId: null,
      cmcId: null,
      contracts: {},
      logoUrl: `/logo/${s}.svg`,
      source: "manual",
    }

    if (address && chain) {
      asset.contracts[chain.toUpperCase()] = address
    }

    if (!asset.cgId && cgKey) {
      try {
        const response = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(s)}&x_cg_demo_api_key=${cgKey}`,
        )

        if (!response.ok) {
          console.error(`[portfolio-agent] CG search failed for ${s}: HTTP ${response.status}`)
        } else {
          const data = await response.json()
          const hit = (data.coins || []).find((c: any) => (c.symbol || "").toUpperCase() === s)
          if (hit) {
            asset.cgId = hit.id
            asset.name = hit.name
            asset.logoUrl = hit.large || hit.thumb || asset.logoUrl
            asset.source = "search"
            console.log(`[portfolio-agent] Resolved ${s} via CoinGecko: ${asset.cgId}`)
          }
        }
      } catch (error) {
        console.error(`[portfolio-agent] CG search error for ${s}:`, error instanceof Error ? error.message : String(error))
      }
    }

    if (!asset.cgId && !asset.cmcId && cmcKey) {
      try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?symbol=${s}`
        console.log(`[portfolio-agent] Attempting CMC map for ${s}`)

        const response = await fetchWithRetry(url, {
          headers: {
            "X-CMC_PRO_API_KEY": cmcKey,
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          console.error(`[portfolio-agent] CMC map failed for ${s}: HTTP ${response.status} ${response.statusText}`)
          const text = await response.text()
          console.error(`[portfolio-agent] CMC response body:`, text.substring(0, 200))
        } else {
          const data = await response.json()
          const hit = Array.isArray(data.data) ? data.data.find((x: any) => x.symbol === s) : null
          if (hit) {
            asset.cmcId = String(hit.id)
            asset.name = hit.name
            asset.source = "search"
            console.log(`[portfolio-agent] Resolved ${s} via CMC: ${asset.cmcId}`)
          }
        }
      } catch (error) {
        console.error(`[portfolio-agent] CMC map error for ${s}:`, error instanceof Error ? error.message : String(error))
      }
    }

    cache.set(cacheKey, asset, 7 * 24 * 60 * 60)
    return asset
  }
}

export class PricesTool {
  async run(input: ToolInput, ctx: ToolContext): Promise<{ data: Record<string, number | null>; stale?: boolean }> {
    const { symbols } = input as { symbols: string[] }
    const prices: Record<string, number | null> = {}
    let stale = false

    const cgKey = ctx.userKeys.get("COINGECKO_API_KEY") || ""
    const cmcKey = ctx.userKeys.get("COINMARKETCAP_API_KEY") || ""
    const birdeyeKey = ctx.userKeys.get("BIRDEYE_API_KEY") || ""

    const SOLANA_ADDRESSES: Record<string, string> = {
      SOL: "So11111111111111111111111111111111111111112",
      BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
      RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      ORCA: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
      USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    }

    const COINGECKO_IDS: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      SOL: "solana",
      BNB: "binancecoin",
      USDC: "usd-coin",
      USDT: "tether",
      ADA: "cardano",
      DOT: "polkadot",
      MATIC: "matic-network",
      AVAX: "avalanche-2",
      LINK: "chainlink",
      UNI: "uniswap",
      ATOM: "cosmos",
      XRP: "ripple",
      DOGE: "dogecoin",
    }

    for (const symbol of symbols) {
      const s = symbol.toUpperCase()
      const cacheKey = `price:${s}`
      const cached = cache.get<number>(cacheKey)

      if (cached && !cached.stale) {
        prices[s] = cached.data
        stale ||= cached.stale
        continue
      }

      let price: number | null = null

      const solanaAddress = SOLANA_ADDRESSES[s]
      if (birdeyeKey && solanaAddress) {
        try {
          console.log(`[portfolio-agent] Fetching ${s} price from Birdeye...`)
          const response = await fetchWithRetry(`https://public-api.birdeye.so/defi/price?address=${solanaAddress}`, {
            headers: { "X-API-KEY": birdeyeKey },
          })

          if (response.ok) {
            const data = await response.json()
            if (data?.data?.value) {
              price = data.data.value
              console.log(`[portfolio-agent] Fetched ${s} price from Birdeye: $${price}`)
            }
          } else {
            console.log(`[portfolio-agent] Birdeye returned ${response.status} for ${s}`)
          }
        } catch (error) {
          console.log(`[portfolio-agent] Birdeye price failed for ${s}:`, error instanceof Error ? error.message : String(error))
        }
      }

      if (price === null && cgKey) {
        try {
          let cgId = COINGECKO_IDS[s]

          if (!cgId) {
            const rKey = `resolver:${s}`
            const rs = cache.get<ResolvedAsset>(rKey)
            cgId = rs?.data.cgId || null

            if (!cgId) {
              const resolver = new AssetResolverTool()
              const resolved = await resolver.run({ symbol: s }, ctx)
              cgId = resolved.cgId
            }
          }

          if (cgId) {
            console.log(`[portfolio-agent] Fetching ${s} price from CoinGecko (ID: ${cgId})...`)
            const response = await fetchWithRetry(
              `https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd&x_cg_demo_api_key=${cgKey}`,
            )

            if (response.ok) {
              const data = await response.json()
              price = data?.[cgId]?.usd ?? null
              if (price) console.log(`[portfolio-agent] Fetched ${s} price from CoinGecko: $${price}`)
            } else {
              console.log(`[portfolio-agent] CoinGecko returned ${response.status} for ${s}`)
            }
          }
        } catch (error) {
          console.log(`[portfolio-agent] CG price failed for ${s}:`, error instanceof Error ? error.message : String(error))
        }
      }

      if (price === null && cmcKey) {
        try {
          const rKey = `resolver:${s}`
          const rs = cache.get<ResolvedAsset>(rKey)
          let cmcId = rs?.data.cmcId

          if (!cmcId) {
            const resolver = new AssetResolverTool()
            const resolved = await resolver.run({ symbol: s }, ctx)
            cmcId = resolved.cmcId
          }

          if (cmcId) {
            console.log(`[portfolio-agent] Fetching ${s} price from CoinMarketCap (ID: ${cmcId})...`)
            const response = await fetchWithRetry(
              `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${cmcId}`,
              { headers: { "X-CMC_PRO_API_KEY": cmcKey } },
            )

            if (response.ok) {
              const data = await response.json()
              const quote = data?.data?.[cmcId]?.quote?.USD?.price
              if (typeof quote === "number") {
                price = quote
                console.log(`[portfolio-agent] Fetched ${s} price from CoinMarketCap: $${price}`)
              }
            } else {
              console.log(`[portfolio-agent] CoinMarketCap returned ${response.status} for ${s}`)
            }
          }
        } catch (error) {
          console.log(`[portfolio-agent] CMC price failed for ${s}:`, error instanceof Error ? error.message : String(error))
        }
      }

      prices[s] = price
      if (price !== null) {
        cache.set(cacheKey, price, 60)
      } else {
        console.log(`[portfolio-agent] Failed to fetch price for ${s} from all sources`)
      }
    }

    return { data: prices, stale }
  }
}

export class HistoryTool {
  async run(
    input: ToolInput,
    ctx: ToolContext,
  ): Promise<{ data: Record<string, { t: number[]; p: number[] }>; stale?: boolean }> {
    const { symbols, windowDays = 90 } = input
    const history: Record<string, { t: number[]; p: number[] }> = {}

    const cgKey = ctx.userKeys.get("COINGECKO_API_KEY") || ""

    for (const symbol of symbols) {
      const s = symbol.toUpperCase()
      const cacheKey = `history:${s}:${windowDays}`
      const cached = cache.get<{ t: number[]; p: number[] }>(cacheKey)

      if (cached && !cached.stale) {
        history[s] = cached.data
        continue
      }

      try {
        const resolver = new AssetResolverTool()
        const resolved = await resolver.run({ symbol: s }, ctx)
        const cgId = resolved.cgId

        if (cgId && cgKey) {
          const url = `https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=${windowDays}&interval=daily&x_cg_demo_api_key=${cgKey}`
          const response = await fetchWithRetry(url)

          if (!response.ok) {
            const text = await response.text()
            console.error(`[portfolio-agent] History fetch failed for ${s}: HTTP ${response.status} - ${text.substring(0, 100)}`)

            // If we have cached data (even if stale), use it
            if (cached) {
              console.log(`[portfolio-agent] Using stale cached history for ${s}`)
              history[s] = cached.data
            } else {
              history[s] = { t: [], p: [] }
            }
            continue
          }

          const contentType = response.headers.get("content-type") || ""
          if (!contentType.includes("application/json")) {
            const text = await response.text()
            console.error(`[portfolio-agent] History fetch failed for ${s}: Non-JSON response - ${text.substring(0, 100)}`)

            // If we have cached data (even if stale), use it
            if (cached) {
              console.log(`[portfolio-agent] Using stale cached history for ${s}`)
              history[s] = cached.data
            } else {
              history[s] = { t: [], p: [] }
            }
            continue
          }

          const data = await response.json()

          if (data.prices) {
            const t = data.prices.map((x: [number, number]) => x[0])
            const p = data.prices.map((x: [number, number]) => x[1])
            history[s] = { t, p }
            cache.set(cacheKey, history[s], 6 * 60 * 60)
          } else {
            history[s] = { t: [], p: [] }
          }
        } else {
          history[s] = { t: [], p: [] }
        }
      } catch (error) {
        console.error(`[portfolio-agent] History fetch failed for ${s}:`, error instanceof Error ? error.message : String(error))
        // If we have cached data (even if stale), use it
        if (cached) {
          console.log(`[portfolio-agent] Using stale cached history for ${s}`)
          history[s] = cached.data
        } else {
          history[s] = { t: [], p: [] }
        }
      }
    }

    return { data: this.alignHistories(history) }
  }

  private alignHistories(
    history: Record<string, { t: number[]; p: number[] }>,
  ): Record<string, { t: number[]; p: number[] }> {
    const symbols = Object.keys(history)
    if (symbols.length === 0) return {}

    const minLength = Math.min(...symbols.map((s) => history[s]?.p?.length || 0))
    const aligned: Record<string, { t: number[]; p: number[] }> = {}

    for (const symbol of symbols) {
      const h = history[symbol]
      aligned[symbol] = {
        t: (h?.t || []).slice(-minLength),
        p: (h?.p || []).slice(-minLength),
      }
    }

    return aligned
  }
}

export class RiskMetricsTool {
  async run(input: ToolInput, ctx: ToolContext): Promise<RiskMetrics> {
    const historyData = input.history?.data || input.history
    const { weights, benchmark = "BTC", windowDays = 90 } = input

    const aligned = this.alignHistories(historyData)
    const assetReturns = this.calculateAssetReturns(aligned)
    const portfolioReturns = this.calculatePortfolioReturns(assetReturns, weights)

    if (portfolioReturns.length === 0) {
      return {
        windowDays,
        volPct: null,
        sharpe: 0,
        sortino: 0,
        maxDDPct: 0,
        betaBTC: 1,
        var95Pct: 0,
        cvar95Pct: 0,
        corr: {},
      }
    }

    const mean = this.mean(portfolioReturns)
    const std = this.stdev(portfolioReturns)
    const volatility = std * Math.sqrt(252)
    const sharpe = (mean / (std || 1e-9)) * Math.sqrt(252)
    const sortino = this.calculateSortino(portfolioReturns)
    const maxDD = this.calculateMaxDrawdownFromReturns(portfolioReturns)

    const betaBTC = assetReturns[benchmark]
      ? this.covariance(portfolioReturns, assetReturns[benchmark]) / (this.variance(assetReturns[benchmark]) || 1e-9)
      : 1.0

    const var95 = this.calculateVaR(portfolioReturns, 0.95)
    const cvar95 = this.calculateCVaR(portfolioReturns, 0.95)
    const corr = this.calculateCorrelation(assetReturns)

    return {
      windowDays,
      volPct: Number((volatility * 100).toFixed(2)),
      sharpe: Number(sharpe.toFixed(2)),
      sortino: Number(sortino.toFixed(2)),
      maxDDPct: Number((maxDD * 100).toFixed(2)),
      betaBTC: Number(betaBTC.toFixed(2)),
      var95Pct: Number((var95 * 100).toFixed(2)),
      cvar95Pct: Number((cvar95 * 100).toFixed(2)),
      corr,
    }
  }

  private alignHistories(history: Record<string, { t: number[]; p: number[] }>): Record<string, number[]> {
    const symbols = Object.keys(history)
    if (symbols.length === 0) return {}

    const minLength = Math.min(...symbols.map((s) => history[s]?.p?.length || 0))

    const aligned: Record<string, number[]> = {}
    for (const symbol of symbols) {
      aligned[symbol] = (history[symbol]?.p || []).slice(-minLength)
    }

    return aligned
  }

  private calculateAssetReturns(aligned: Record<string, number[]>): Record<string, number[]> {
    const returns: Record<string, number[]> = {}

    for (const [symbol, prices] of Object.entries(aligned)) {
      returns[symbol] = []
      for (let i = 1; i < prices.length; i++) {
        returns[symbol].push((prices[i] - prices[i - 1]) / prices[i - 1])
      }
    }

    return returns
  }

  private calculatePortfolioReturns(assetReturns: Record<string, number[]>, weights: Record<string, number>): number[] {
    const symbols = Object.keys(assetReturns)
    if (symbols.length === 0) return []

    const length = assetReturns[symbols[0]].length
    const portfolioReturns: number[] = []

    for (let i = 0; i < length; i++) {
      let dailyReturn = 0
      for (const symbol of symbols) {
        const weight = weights[symbol] || 0
        const assetReturn = assetReturns[symbol]?.[i] || 0
        dailyReturn += weight * assetReturn
      }
      portfolioReturns.push(dailyReturn)
    }

    return portfolioReturns
  }

  private mean(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  }

  private stdev(arr: number[]): number {
    const m = this.mean(arr)
    const variance = arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length
    return Math.sqrt(variance)
  }

  private calculateSortino(returns: number[]): number {
    const meanReturn = this.mean(returns)
    const downside = returns.filter((r) => r < 0)

    if (downside.length === 0) return 0

    const downsideVariance = downside.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downside.length
    const downsideDeviation = Math.sqrt(downsideVariance * 252)

    return downsideDeviation > 0 ? (meanReturn * 252) / downsideDeviation : 0
  }

  private calculateMaxDrawdownFromReturns(returns: number[]): number {
    let cumulative = 1.0
    let peak = 1.0
    let maxDD = 0

    for (const r of returns) {
      cumulative *= 1 + r
      if (cumulative > peak) peak = cumulative
      const dd = (cumulative - peak) / peak
      if (dd < maxDD) maxDD = dd
    }

    return maxDD
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sorted = [...returns].sort((a, b) => a - b)
    const index = Math.floor((1 - confidence) * sorted.length)
    return sorted[index] || 0
  }

  private calculateCVaR(returns: number[], confidence: number): number {
    const sorted = [...returns].sort((a, b) => a - b)
    const index = Math.floor((1 - confidence) * sorted.length)
    const tail = sorted.slice(0, index)
    return tail.length > 0 ? tail.reduce((a, b) => a + b, 0) / tail.length : 0
  }

  private calculateCorrelation(returns: Record<string, number[]>): Record<string, Record<string, number>> {
    const symbols = Object.keys(returns)
    const corr: Record<string, Record<string, number>> = {}

    for (const sym1 of symbols) {
      corr[sym1] = {}
      for (const sym2 of symbols) {
        if (sym1 === sym2) {
          corr[sym1][sym2] = 1.0
        } else {
          const cov = this.covariance(returns[sym1], returns[sym2])
          const std1 = this.stdev(returns[sym1])
          const std2 = this.stdev(returns[sym2])
          corr[sym1][sym2] = std1 > 0 && std2 > 0 ? cov / (std1 * std2) : 0
        }
      }
    }

    return corr
  }

  private covariance(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length)
    const meanX = this.mean(x.slice(0, n))
    const meanY = this.mean(y.slice(0, n))
    return x.slice(0, n).reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0) / n
  }

  private variance(x: number[]): number {
    const m = this.mean(x)
    return x.reduce((sum, xi) => sum + Math.pow(xi - m, 2), 0) / x.length
  }
}

export class HealthScoresTool {
  async run(input: ToolInput, ctx: ToolContext): Promise<HealthScores> {
    const { risk, pnlPct, weights, history } = input as {
      risk: RiskMetrics
      pnlPct: number
      weights: Record<string, number>
      history?: any
    }

    const historyData = history?.data || history

    const volPct = risk.volPct ?? 0

    const sharpeScore = Math.min(100, Math.max(0, (risk.sharpe / 2) * 100))
    const pnlScore = Math.min(100, Math.max(0, 50 + pnlPct))
    const ddScore = Math.min(100, Math.max(0, 100 + risk.maxDDPct))
    const volScore = Math.min(100, Math.max(0, 100 - volPct))

    const health = Math.round(sharpeScore * 0.4 + pnlScore * 0.25 + ddScore * 0.2 + volScore * 0.15)

    const hhi = Object.values(weights).reduce((sum, w) => sum + w * w, 0)
    const diversification = Math.round((1 - hhi) * 100)

    let momentum = 50
    if (historyData) {
      const symbols = Object.keys(historyData)
      if (symbols.length > 0) {
        const prices = historyData[symbols[0]]?.p || []
        momentum = this.calcMomentum12_2(prices)
      }
    }

    return { health, diversification, momentum }
  }

  private calcMomentum12_2(prices: number[]): number {
    if (prices.length < 12) return 50

    const now = prices[prices.length - 1]
    const m12 = prices[Math.max(0, prices.length - 12)]
    const m2 = prices[Math.max(0, prices.length - 2)]

    if (m12 === 0 || m2 === 0) return 50

    const mom = now / m12 - now / m2
    return Math.max(0, Math.min(100, Math.round(50 + 400 * mom)))
  }
}

export class AlertsTool {
  async run(input: ToolInput, ctx: ToolContext): Promise<Alert[]> {
    const { risk, weights, policy, holdings } = input as {
      risk: RiskMetrics
      weights: Record<string, number>
      policy: RiskPolicy
      holdings?: Array<{ symbol: string; amount: number; value: number }>
    }
    const alerts: Alert[] = []

    const currentWeights = holdings
      ? holdings.reduce(
          (acc, holding) => {
            acc[holding.symbol] = holding.value
            return acc
          },
          {} as Record<string, number>,
        )
      : weights

    const maxW = Math.max(...Object.values(currentWeights))
    if (maxW > policy.maxWeight) {
      const symbol = Object.entries(currentWeights).find(([_, w]) => w === maxW)?.[0] || "Unknown"
      alerts.push({
        level: "high",
        code: "HIGH_CONCENTRATION",
        message: `${symbol} allocation ${(maxW * 100).toFixed(1)}% exceeds ${(policy.maxWeight * 100).toFixed(0)}% threshold`,
      })
    }

    const stableWeight = (currentWeights["USDT"] || 0) + (currentWeights["USDC"] || 0) + (currentWeights["DAI"] || 0)
    if (stableWeight < policy.minStablePct) {
      alerts.push({
        level: "medium",
        code: "LOW_STABLE",
        message: `Stablecoin ${(stableWeight * 100).toFixed(1)}% below ${(policy.minStablePct * 100).toFixed(0)}% minimum`,
      })
    }

    if (risk.volPct > policy.maxVolPct) {
      alerts.push({
        level: "medium",
        code: "HIGH_VOL",
        message: `Volatility ${risk.volPct.toFixed(1)}% exceeds ${policy.maxVolPct}% limit`,
      })
    }

    if (Math.abs(risk.maxDDPct) > policy.maxDrawdownDayPct) {
      alerts.push({
        level: "high",
        code: "HIGH_DRAWDOWN",
        message: `Max drawdown ${risk.maxDDPct.toFixed(1)}% exceeds ${policy.maxDrawdownDayPct}% limit`,
      })
    }

    return alerts
  }
}

export class RebalanceTool {
  async run(input: ToolInput, ctx: ToolContext): Promise<RebalanceOutput> {
    const { holdings, prices, history, constraints } = input

    const symbols = Object.keys(holdings)
    if (symbols.length < 3) {
      return {
        targetWeights: {},
        actions: [],
        notes: ["Insufficient assets for rebalancing (minimum 3 required)"],
      }
    }

    const targetWeights = this.calculateRiskParity(symbols, history)

    const currentValue = Object.entries(holdings).reduce((sum, [sym, amt]) => {
      return sum + amt * (prices[sym] || 0)
    }, 0)

    const actions: RebalanceOutput["actions"] = []
    const notes: string[] = []

    for (const symbol of symbols) {
      const price = prices[symbol]
      if (!price) {
        notes.push(`Ignored ${symbol} - no price available`)
        continue
      }

      const currentWeight = (holdings[symbol] * price) / currentValue
      const targetWeight = targetWeights[symbol] || 0
      const diff = targetWeight - currentWeight
      const valueUSD = Math.abs(diff * currentValue)

      if (Math.abs(diff) > 0.02 && valueUSD > (constraints?.minTradeUSD || 100)) {
        actions.push({
          symbol,
          side: diff > 0 ? "buy" : "sell",
          valueUSD: Math.round(valueUSD),
        })
      }
    }

    const totalTurnover = actions.reduce((sum, a) => sum + a.valueUSD, 0)
    const turnoverPct = (totalTurnover / currentValue) * 100

    if (constraints?.maxTurnoverPct && turnoverPct > constraints.maxTurnoverPct) {
      const scale = constraints.maxTurnoverPct / turnoverPct
      actions.forEach((a) => {
        a.valueUSD = Math.round(a.valueUSD * scale)
      })
      notes.push(`Scaled by turnover cap (${constraints.maxTurnoverPct}%)`)
    }

    notes.push("Risk-parity optimized")

    return {
      targetWeights,
      actions,
      notes,
    }
  }

  private calculateRiskParity(
    symbols: string[],
    history: Record<string, { t: number[]; p: number[] }>,
  ): Record<string, number> {
    const aligned = this.alignHistories(history)
    const rets: Record<string, number[]> = {}
    let n = Number.POSITIVE_INFINITY

    for (const s of symbols) {
      const p = aligned[s] || []
      const r: number[] = []
      for (let i = 1; i < p.length; i++) {
        r.push((p[i] - p[i - 1]) / p[i - 1])
      }
      rets[s] = r
      n = Math.min(n, r.length)
    }

    if (n < 2) {
      const equal = 1 / symbols.length
      const weights: Record<string, number> = {}
      symbols.forEach((s) => (weights[s] = equal))
      return weights
    }

    const S = symbols
    const cov: number[][] = Array.from({ length: S.length }, () => Array(S.length).fill(0))

    for (let i = 0; i < S.length; i++) {
      for (let j = i; j < S.length; j++) {
        let c = 0
        const avgI = this.avg(rets[S[i]].slice(0, n))
        const avgJ = this.avg(rets[S[j]].slice(0, n))

        for (let k = 0; k < n; k++) {
          c += (rets[S[i]][k] - avgI) * (rets[S[j]][k] - avgJ)
        }
        c /= n || 1
        cov[i][j] = cov[j][i] = c
      }
    }

    const invVar = S.map((_, i) => 1 / Math.max(cov[i][i], 1e-9))
    const sum = invVar.reduce((a, b) => a + b, 0)
    const w: Record<string, number> = {}
    S.forEach((s, i) => (w[s] = invVar[i] / sum))

    return w
  }

  private alignHistories(history: Record<string, { t: number[]; p: number[] }>): Record<string, number[]> {
    const symbols = Object.keys(history)
    if (symbols.length === 0) return {}

    const minLength = Math.min(...symbols.map((s) => history[s]?.p?.length || 0))
    const aligned: Record<string, number[]> = {}

    for (const symbol of symbols) {
      aligned[symbol] = (history[symbol]?.p || []).slice(-minLength)
    }

    return aligned
  }

  private avg(a: number[]): number {
    return a.reduce((x, y) => x + y, 0) / (a.length || 1)
  }
}

export class NewsResearchTool {
  async run(input: ToolInput, ctx: ToolContext): Promise<NewsOutput> {
    const { symbols, lookbackDays = 7 } = input

    const serperKey = ctx.userKeys.get("SERPER_API_KEY") || ""
    const tavilyKey = ctx.userKeys.get("TAVILY_API_KEY") || ""
    const jinaKey = ctx.userKeys.get("JINA_API_KEY") || ""

    const items: NewsOutput["items"] = []
    const sentiment: Record<string, number> = {}

    // Check if we have at least one news source
    if (!serperKey && !tavilyKey) {
      console.warn("[portfolio-agent] No news API keys configured (SERPER_API_KEY or TAVILY_API_KEY required)")
      return { items: [], sentiment: {} }
    }

    for (const symbol of symbols) {
      try {
        if (serperKey && jinaKey) {
          try {
            const query = `${symbol} cryptocurrency news latest analysis`

            const serperResponse = await fetchWithRetry("https://google.serper.dev/search", {
              method: "POST",
              headers: {
                "X-API-KEY": serperKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                q: query,
                num: 10,
                tbm: "nws",
              }),
            })

            const serperData = await serperResponse.json()

            if (serperData.news && Array.isArray(serperData.news)) {
              const newsItems = serperData.news.slice(0, 5)

              for (const article of newsItems) {
                let content = article.snippet || ""

                if (jinaKey && article.link) {
                  try {
                    const jinaResponse = await fetchWithRetry(`https://r.jina.ai/${article.link}`, {
                      headers: {
                        Authorization: `Bearer ${jinaKey}`,
                        "X-Return-Format": "text",
                      },
                    })

                    if (jinaResponse.ok) {
                      const jinaContent = await jinaResponse.text()
                      content = jinaContent.substring(0, 500)
                    }
                  } catch (error) {
                    console.error(
                      `[portfolio-agent] Jina extraction failed for ${article.link}:`,
                      error instanceof Error ? error.message : String(error),
                    )
                  }
                }

                const sentimentScore = this.calculateSentiment(article.title + " " + content)

                items.push({
                  title: article.title,
                  url: article.link,
                  symbols: [symbol],
                  sentiment: sentimentScore,
                  summary: content.substring(0, 200),
                  source: article.source || "News",
                  timestamp: this.formatTimestamp(article.date),
                })
              }

              console.log(`[portfolio-agent] Fetched ${newsItems.length} news items for ${symbol} via OpenDeepSearch (Serper+Jina)`)
            }
          } catch (error) {
            console.error(`[portfolio-agent] OpenDeepSearch (Serper+Jina) failed for ${symbol}:`, error)
          }
        }

        if (items.filter((item) => item.symbols.includes(symbol)).length === 0 && serperKey) {
          const query = `${symbol} cryptocurrency news latest`
          const response = await fetchWithRetry("https://google.serper.dev/search", {
            method: "POST",
            headers: {
              "X-API-KEY": serperKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              q: query,
              num: 3,
              tbm: "nws",
            }),
          })

          const data = await response.json()

          if (data.news && Array.isArray(data.news)) {
            for (const article of data.news.slice(0, 3)) {
              const sentimentScore = this.calculateSentiment(article.title + " " + (article.snippet || ""))

              items.push({
                title: article.title,
                url: article.link,
                symbols: [symbol],
                sentiment: sentimentScore,
                summary: article.snippet || "",
                source: article.source || "News",
                timestamp: this.formatTimestamp(article.date),
              })
            }
          }
        }

        if (items.filter((item) => item.symbols.includes(symbol)).length === 0 && tavilyKey) {
          try {
            const query = `${symbol} cryptocurrency news`
            const response = await fetchWithRetry("https://api.tavily.com/search", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                api_key: tavilyKey,
                query,
                search_depth: "basic",
                max_results: 3,
              }),
            })

            const data = await response.json()

            if (data.results && Array.isArray(data.results)) {
              for (const result of data.results) {
                const sentimentScore = this.calculateSentiment(result.title + " " + (result.content || ""))

                items.push({
                  title: result.title,
                  url: result.url,
                  symbols: [symbol],
                  sentiment: sentimentScore,
                  summary: result.content || "",
                  source: "Tavily",
                  timestamp: "Recently",
                })
              }
            }
          } catch (error) {
            console.error(`[portfolio-agent] Tavily search failed for ${symbol}:`, error)
          }
        }

        const symbolItems = items.filter((item) => item.symbols.includes(symbol))
        sentiment[symbol] =
          symbolItems.length > 0 ? symbolItems.reduce((sum, item) => sum + item.sentiment, 0) / symbolItems.length : 0.5
      } catch (error) {
        console.error(`[portfolio-agent] News fetch failed for ${symbol}:`, error)
        sentiment[symbol] = 0.5
      }
    }

    return { items, sentiment }
  }

  private calculateSentiment(text: string): number {
    const positive = [
      "surge",
      "rally",
      "bullish",
      "gain",
      "rise",
      "up",
      "growth",
      "strong",
      "positive",
      "breakthrough",
      "success",
      "adoption",
      "upgrade",
    ]
    const negative = [
      "crash",
      "drop",
      "bearish",
      "fall",
      "down",
      "decline",
      "weak",
      "negative",
      "concern",
      "risk",
      "warning",
      "hack",
      "scam",
    ]

    const lowerText = text.toLowerCase()
    let score = 0.5

    positive.forEach((word) => {
      if (lowerText.includes(word)) score += 0.05
    })

    negative.forEach((word) => {
      if (lowerText.includes(word)) score -= 0.05
    })

    return Math.max(0, Math.min(1, score))
  }

  private formatTimestamp(dateStr?: string): string {
    if (!dateStr) return "Recently"

    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

      if (diffHours < 1) return "Just now"
      if (diffHours < 24) return `${diffHours} hours ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString()
    } catch {
      return "Recently"
    }
  }
}

export class OpportunityScannerTool {
  async run(input: ToolInput, ctx: ToolContext): Promise<{ opportunities: any[] }> {
    const { symbols, history, news } = input

    const opportunities: any[] = []

    for (const symbol of symbols) {
      const prices = history[symbol]?.p || []
      if (prices.length < 30) continue

      const momentum12_2 = this.calculateMomentum(prices, 12, 2)
      const ma20 = this.calculateMA(prices, 20)
      const ma50 = this.calculateMA(prices, 50)
      const currentPrice = prices[prices.length - 1]

      const maCross = currentPrice > ma20 && ma20 > ma50
      const strongMomentum = momentum12_2 > 0.15

      const sentimentScore = news?.sentiment?.[symbol] || 0.5
      const sentimentExtreme = sentimentScore > 0.7 || sentimentScore < 0.3

      let score = 50

      if (strongMomentum) score += 20
      if (maCross) score += 15
      if (sentimentExtreme) score += 15

      const reasons: string[] = []
      if (strongMomentum) reasons.push(`Strong momentum (${(momentum12_2 * 100).toFixed(1)}%)`)
      if (maCross) reasons.push("MA crossover signal")
      if (sentimentScore > 0.7) reasons.push("Positive sentiment spike")
      if (sentimentScore < 0.3) reasons.push("Oversold sentiment")

      if (score >= 70 && reasons.length > 0) {
        opportunities.push({
          symbol,
          name: symbol,
          score: Math.min(100, score),
          reasons,
          momentum: `${momentum12_2 > 0 ? "+" : ""}${(momentum12_2 * 100).toFixed(1)}%`,
          sentiment: sentimentScore,
        })
      }
    }

    opportunities.sort((a, b) => b.score - a.score)

    return { opportunities: opportunities.slice(0, 5) }
  }

  private calculateMomentum(prices: number[], period1: number, period2: number): number {
    if (prices.length < period1) return 0

    const recent = prices.slice(-period2)
    const older = prices.slice(-period1, -period1 + period2)

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

    return (recentAvg - olderAvg) / olderAvg
  }

  private calculateMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1]

    const slice = prices.slice(-period)
    return slice.reduce((a, b) => a + b, 0) / slice.length
  }
}
