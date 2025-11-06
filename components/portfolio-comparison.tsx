"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, TrendingDown, BarChart3, Target, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PortfolioComparisonProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number }>
  result?: any
  totalValue?: number
}

type Benchmark = "BTC" | "ETH" | "TotalCrypto" | "Conservative" | "Balanced" | "Aggressive"

interface ComparisonData {
  date: string
  portfolio: number
  benchmark: number
  difference: number
}

export function PortfolioComparison({ holdings = [], result, totalValue = 0 }: PortfolioComparisonProps) {
  const [benchmark, setBenchmark] = useState<Benchmark>("BTC")
  const [timeRange, setTimeRange] = useState<"30D" | "90D" | "1Y">("90D")

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (!result || !totalValue || totalValue === 0) return null

    const history = result.fetch_history?.data || result.history?.data
    if (!history) return null

    const holdingsMap = new Map(
      holdings.map((h) => [h.symbol, typeof h.amount === "string" ? Number.parseFloat(h.amount) : h.amount]),
    )

    // Get first asset timestamps as reference
    const firstAsset = Object.keys(history)[0]
    if (!firstAsset || !history[firstAsset]?.t || !history[firstAsset]?.p) return null

    const timestamps = history[firstAsset].t
    const days = timeRange === "30D" ? 30 : timeRange === "90D" ? 90 : 365
    const dataPoints = Math.min(days, timestamps.length)
    const startIndex = Math.max(0, timestamps.length - dataPoints)

    const data: ComparisonData[] = []
    let portfolioStartValue = 0
    let benchmarkStartValue = 0

    // Calculate portfolio values
    timestamps.slice(startIndex).forEach((timestamp: number, relativeIndex: number) => {
      const absoluteIndex = startIndex + relativeIndex
      let portfolioValue = 0

      Object.keys(history).forEach((symbol) => {
        const assetData = history[symbol]
        const holdingAmount = holdingsMap.get(symbol) || 0

        if (assetData?.p && assetData.p[absoluteIndex] !== undefined && holdingAmount > 0) {
          portfolioValue += assetData.p[absoluteIndex] * holdingAmount
        }
      })

      // Calculate benchmark value
      let benchmarkValue = 0
      if (benchmark === "BTC" && history["BTC"]?.p) {
        const btcPrice = history["BTC"].p[absoluteIndex]
        const btcAmount = holdingsMap.get("BTC") || 0
        benchmarkValue = btcPrice * btcAmount
        // Scale to match portfolio if no BTC in portfolio
        if (btcAmount === 0 && portfolioStartValue > 0) {
          benchmarkValue = (btcPrice / history["BTC"].p[startIndex]) * portfolioStartValue
        }
      } else if (benchmark === "ETH" && history["ETH"]?.p) {
        const ethPrice = history["ETH"].p[absoluteIndex]
        const ethAmount = holdingsMap.get("ETH") || 0
        benchmarkValue = ethPrice * ethAmount
        if (ethAmount === 0 && portfolioStartValue > 0) {
          benchmarkValue = (ethPrice / history["ETH"].p[startIndex]) * portfolioStartValue
        }
      } else {
        // Conservative: 60% BTC, 30% ETH, 10% Stable
        // Balanced: 50% BTC, 30% ETH, 20% Alt
        // Aggressive: 30% BTC, 20% ETH, 50% Alt
        const weights =
          benchmark === "Conservative"
            ? { BTC: 0.6, ETH: 0.3, stable: 0.1 }
            : benchmark === "Balanced"
              ? { BTC: 0.5, ETH: 0.3, alt: 0.2 }
              : { BTC: 0.3, ETH: 0.2, alt: 0.5 }

        if (history["BTC"]?.p && history["ETH"]?.p) {
          const btcPrice = history["BTC"].p[absoluteIndex]
          const ethPrice = history["ETH"].p[absoluteIndex]
          const btcStart = history["BTC"].p[startIndex] || btcPrice
          const ethStart = history["ETH"].p[startIndex] || ethPrice

          if (portfolioStartValue === 0) {
            portfolioStartValue = portfolioValue
            benchmarkStartValue = portfolioStartValue // Start at same value
          }

          benchmarkValue =
            portfolioStartValue *
            (weights.BTC * (btcPrice / btcStart) + weights.ETH * (ethPrice / ethStart) + (weights.stable || weights.alt || 0))
        }
      }

      if (relativeIndex === 0) {
        portfolioStartValue = portfolioValue
        benchmarkStartValue = benchmarkValue || portfolioValue
      }

      // Normalize to start from same value
      if (benchmarkStartValue > 0 && portfolioStartValue > 0) {
        benchmarkValue = (benchmarkValue / benchmarkStartValue) * portfolioStartValue
      }

      const date = new Date(timestamp)
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        portfolio: Math.round(portfolioValue),
        benchmark: Math.round(benchmarkValue),
        difference: portfolioValue - benchmarkValue,
      })
    })

    return data
  }, [result, holdings, totalValue, benchmark, timeRange])

  const portfolioReturn = comparisonData
    ? ((comparisonData[comparisonData.length - 1].portfolio - comparisonData[0].portfolio) /
        comparisonData[0].portfolio) *
      100
    : 0

  const benchmarkReturn = comparisonData
    ? ((comparisonData[comparisonData.length - 1].benchmark - comparisonData[0].benchmark) /
        comparisonData[0].benchmark) *
      100
    : 0

  const outperformance = portfolioReturn - benchmarkReturn

  if (!result || !totalValue || totalValue === 0) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Portfolio Comparison
          </CardTitle>
          <CardDescription>Compare your portfolio performance with benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Run portfolio analysis to see comparison</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gradient-card border-border/50" data-section="comparison">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Portfolio Comparison
            </CardTitle>
            <CardDescription>Compare your portfolio with benchmarks and strategies</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5">
            <Sparkles className="h-3 w-3 mr-1" />
            Performance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Select value={benchmark} onValueChange={(value) => setBenchmark(value as Benchmark)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select benchmark" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
              <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
              <SelectItem value="TotalCrypto">Total Crypto Market</SelectItem>
              <SelectItem value="Conservative">Conservative Strategy</SelectItem>
              <SelectItem value="Balanced">Balanced Strategy</SelectItem>
              <SelectItem value="Aggressive">Aggressive Strategy</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            {(["30D", "90D", "1Y"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "bg-primary hover:bg-primary/90" : ""}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Your Portfolio</div>
            <div
              className={`text-2xl font-bold flex items-center gap-1 ${
                portfolioReturn >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {portfolioReturn >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {portfolioReturn >= 0 ? "+" : ""}
              {portfolioReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">
              {benchmark === "BTC"
                ? "Bitcoin"
                : benchmark === "ETH"
                  ? "Ethereum"
                  : benchmark === "Conservative"
                    ? "Conservative"
                    : benchmark === "Balanced"
                      ? "Balanced"
                      : benchmark === "Aggressive"
                        ? "Aggressive"
                        : "Benchmark"}
            </div>
            <div
              className={`text-2xl font-bold flex items-center gap-1 ${
                benchmarkReturn >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {benchmarkReturn >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {benchmarkReturn >= 0 ? "+" : ""}
              {benchmarkReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Outperformance</div>
            <div
              className={`text-2xl font-bold flex items-center gap-1 ${
                outperformance >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {outperformance >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {outperformance >= 0 ? "+" : ""}
              {outperformance.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        {comparisonData && comparisonData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Performance Comparison</h4>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Your Portfolio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span>
                    {benchmark === "BTC"
                      ? "Bitcoin"
                      : benchmark === "ETH"
                        ? "Ethereum"
                        : benchmark === "Conservative"
                          ? "Conservative"
                          : benchmark === "Balanced"
                            ? "Balanced"
                            : benchmark === "Aggressive"
                              ? "Aggressive"
                              : "Benchmark"}
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 280)" />
                <XAxis dataKey="date" stroke="oklch(0.6 0.01 280)" fontSize={12} />
                <YAxis stroke="oklch(0.6 0.01 280)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.01 280)",
                    border: "1px solid oklch(0.22 0.01 280)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="oklch(0.72 0.2 345)"
                  strokeWidth={2}
                  dot={false}
                  name="Your Portfolio"
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="oklch(0.65 0.18 145)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name={
                    benchmark === "BTC"
                      ? "Bitcoin"
                      : benchmark === "ETH"
                        ? "Ethereum"
                        : benchmark === "Conservative"
                          ? "Conservative"
                          : benchmark === "Balanced"
                            ? "Balanced"
                            : benchmark === "Aggressive"
                              ? "Aggressive"
                              : "Benchmark"
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Strategy Descriptions */}
        {["Conservative", "Balanced", "Aggressive"].includes(benchmark) && (
          <div className="space-y-2 pt-4 border-t border-border/50">
            <h4 className="font-semibold text-sm">Strategy Allocation</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {benchmark === "Conservative" && (
                <p>• 60% Bitcoin, 30% Ethereum, 10% Stablecoins - Lower risk, steady growth</p>
              )}
              {benchmark === "Balanced" && (
                <p>• 50% Bitcoin, 30% Ethereum, 20% Altcoins - Balanced risk/reward</p>
              )}
              {benchmark === "Aggressive" && (
                <p>• 30% Bitcoin, 20% Ethereum, 50% Altcoins - Higher risk, higher reward potential</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
