"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingUp, TrendingDown, Calendar, BarChart3, Target, Sparkles, AlertTriangle } from "lucide-react"
import { SkeletonChart } from "@/components/ui/skeleton"

interface ForecastData {
  date: string
  value: number
  confidenceHigh: number
  confidenceLow: number
}

interface PredictiveAnalyticsDashboardProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number }>
  result?: any
  totalValue?: number
}

type ForecastPeriod = "7D" | "30D"

export function PredictiveAnalyticsDashboard({ holdings = [], result, totalValue = 0 }: PredictiveAnalyticsDashboardProps) {
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>("7D")
  const [scenario, setScenario] = useState<"bullish" | "bearish" | "sideways">("sideways")
  const [loading, setLoading] = useState(false)

  // Calculate forecast based on historical data and scenarios
  const forecastData = useMemo(() => {
    if (!result || !totalValue || totalValue === 0) return null

    const riskMetrics = result.compute_risk
    const healthScores = result.compute_health
    const history = result.fetch_history?.data || result.history?.data

    if (!riskMetrics || !history) return null

    const days = forecastPeriod === "7D" ? 7 : 30
    const volatility = riskMetrics.volPct || 50
    const sharpe = riskMetrics.sharpe || 1.0
    const currentHealth = healthScores.health || 50

    // Calculate base daily return based on Sharpe ratio
    const baseDailyReturn = sharpe > 0 ? (sharpe / Math.sqrt(252)) / 100 : 0.001

    // Scenario multipliers
    const scenarioMultipliers = {
      bullish: 1.5,
      bearish: 0.5,
      sideways: 1.0,
    }

    const multiplier = scenarioMultipliers[scenario]
    const adjustedReturn = baseDailyReturn * multiplier

    // Generate forecast
    const data: ForecastData[] = []
    const today = new Date()
    let currentValue = totalValue

    for (let i = 0; i <= days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)

      // Add some randomness based on volatility
      const volatilityFactor = (volatility / 100) * (Math.random() - 0.5) * 0.5
      const dailyChange = adjustedReturn + volatilityFactor

      currentValue = currentValue * (1 + dailyChange)

      // Calculate confidence intervals (wider for longer periods and higher volatility)
      const confidenceWidth = (volatility / 100) * (i / days) * 0.3
      const confidenceHigh = currentValue * (1 + confidenceWidth)
      const confidenceLow = currentValue * (1 - confidenceWidth)

      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.round(currentValue),
        confidenceHigh: Math.round(confidenceHigh),
        confidenceLow: Math.round(confidenceLow),
      })
    }

    return data
  }, [result, totalValue, forecastPeriod, scenario])

  const forecastReturn = forecastData
    ? ((forecastData[forecastData.length - 1].value - totalValue) / totalValue) * 100
    : 0

  const confidenceInterval = forecastData
    ? {
        high: forecastData[forecastData.length - 1].confidenceHigh,
        low: forecastData[forecastData.length - 1].confidenceLow,
        range: forecastData[forecastData.length - 1].confidenceHigh - forecastData[forecastData.length - 1].confidenceLow,
      }
    : null

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
          <CardDescription>Loading forecast...</CardDescription>
        </CardHeader>
        <CardContent>
          <SkeletonChart />
        </CardContent>
      </Card>
    )
  }

  if (!result || !totalValue || totalValue === 0) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Predictive Analytics Dashboard
          </CardTitle>
          <CardDescription>Portfolio performance forecasts based on AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Run portfolio analysis to see predictive forecasts</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gradient-card border-border/50" data-section="predictive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Predictive Analytics Dashboard
            </CardTitle>
            <CardDescription>AI-powered portfolio performance forecasts</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Forecast
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {(["7D", "30D"] as ForecastPeriod[]).map((period) => (
              <Button
                key={period}
                variant={forecastPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setForecastPeriod(period)}
                className={forecastPeriod === period ? "bg-primary hover:bg-primary/90" : ""}
              >
                {period}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Scenario:</span>
            {(["bullish", "bearish", "sideways"] as const).map((s) => (
              <Button
                key={s}
                variant={scenario === s ? "default" : "outline"}
                size="sm"
                onClick={() => setScenario(s)}
                className={scenario === s ? "bg-primary hover:bg-primary/90 capitalize" : "capitalize"}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Forecast Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Forecasted Value</div>
            <div className="text-2xl font-bold">
              {forecastData
                ? `$${forecastData[forecastData.length - 1].value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "--"}
            </div>
            <div
              className={`text-xs mt-1 flex items-center gap-1 ${
                forecastReturn >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {forecastReturn >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {forecastReturn >= 0 ? "+" : ""}
              {forecastReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Confidence Range</div>
            <div className="text-sm font-medium">
              {confidenceInterval
                ? `$${confidenceInterval.low.toLocaleString()} - $${confidenceInterval.high.toLocaleString()}`
                : "--"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {confidenceInterval ? `±${((confidenceInterval.range / totalValue) * 100).toFixed(1)}%` : "--"}
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Model Confidence</div>
            <div className="text-2xl font-bold text-primary">
              {result?.compute_health?.health ? Math.round(result.compute_health.health * 0.85) : 75}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Based on portfolio health</div>
          </div>
        </div>

        {/* Forecast Chart */}
        {forecastData && forecastData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{forecastPeriod} Forecast</h4>
              <Badge variant="secondary" className="text-xs">
                {scenario} market scenario
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.72 0.2 345)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.72 0.2 345)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <ReferenceLine
                  y={totalValue}
                  stroke="oklch(0.6 0.01 280)"
                  strokeDasharray="3 3"
                  label={{ value: "Current Value", position: "insideRight", fill: "oklch(0.6 0.01 280)" }}
                />
                <Area
                  type="monotone"
                  dataKey="confidenceHigh"
                  stroke="oklch(0.65 0.18 145)"
                  fill="url(#colorConfidence)"
                  strokeWidth={0}
                  opacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="confidenceLow"
                  stroke="oklch(0.65 0.18 145)"
                  fill="url(#colorConfidence)"
                  strokeWidth={0}
                  opacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(0.72 0.2 345)"
                  fill="url(#colorValue)"
                  strokeWidth={2}
                  name="Forecast"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Risk Projection */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Risk Projection
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Projected Volatility</div>
              <div className="font-medium">
                {result?.compute_risk?.volPct
                  ? `${(result.compute_risk.volPct * (scenario === "bearish" ? 1.2 : scenario === "bullish" ? 0.9 : 1.0)).toFixed(1)}%`
                  : "--"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Max Drawdown Risk</div>
              <div className="font-medium">
                {result?.compute_risk?.maxDDPct
                  ? `${(Math.abs(result.compute_risk.maxDDPct) * (scenario === "bearish" ? 1.3 : 1.0)).toFixed(1)}%`
                  : "--"}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
          <p>
            ⚠️ Forecasts are based on historical data and AI modeling. Actual results may vary. Not financial advice.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
