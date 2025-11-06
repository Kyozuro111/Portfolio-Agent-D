"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, AlertTriangle, Sparkles, Target, RefreshCw, Clock, TrendingDown } from "lucide-react"
import { PortfolioInput } from "@/components/portfolio-input"
import { AssetAllocationEnhanced } from "@/components/asset-allocation-enhanced"
import { PerformanceChartEnhanced } from "@/components/performance-chart-enhanced"
import { AgentStatus } from "@/components/agent-status"
import { AIActivityFeed } from "@/components/ai-activity-feed"
import { PredictiveInsights } from "@/components/predictive-insights"
import { SmartRecommendations } from "@/components/smart-recommendations"
import { AIChatWidget } from "@/components/ai-chat-widget"
import { AINewsImpactEnhanced } from "@/components/ai-news-impact-enhanced"
import { PortfolioStressTesting } from "@/components/portfolio-stress-testing"
import { NaturalLanguageCommands } from "@/components/natural-language-commands"
import { AIIntelligenceCenter } from "@/components/ai-intelligence-center"
import { PredictiveAnalyticsDashboard } from "@/components/predictive-analytics-dashboard"
import { PortfolioComparison } from "@/components/portfolio-comparison"
import { CustomizableDashboard, useDashboardWidgets } from "@/components/customizable-dashboard"
import { ExportPortfolio } from "@/components/export-portfolio"
import { PortfolioSnapshot } from "@/components/portfolio-snapshot"
import { RealTimePriceTicker } from "@/components/real-time-price-ticker"
import { AutoRebalancingAdvisor } from "@/components/auto-rebalancing-advisor"
import { PerformanceAttribution } from "@/components/performance-attribution"
import { PortfolioOptimization } from "@/components/portfolio-optimization"
import { useAgentStream } from "@/hooks/use-agent-stream"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Holding {
  id: string
  symbol: string
  amount: string
  purchasePrice?: string
  purchaseDate?: string
  saleDate?: string
  salePrice?: string
  amountSold?: string
  price?: number
  value?: number
  change24h?: number
}

export function UnifiedAIDashboard() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [analyzedHoldings, setAnalyzedHoldings] = useState<Holding[]>([])
  const [nextRefresh, setNextRefresh] = useState(300) // 5 minutes in seconds
  const [autoAnalyzed, setAutoAnalyzed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Load holdings from localStorage only on client side after mount
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio-holdings")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setHoldings(parsed)
        } catch (e) {
          console.error("[portfolio-agent] Failed to parse saved holdings:", e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const coreData = holdings.map((h) => ({
        id: h.id,
        symbol: h.symbol,
        amount: h.amount,
        purchasePrice: h.purchasePrice,
        purchaseDate: h.purchaseDate,
        saleDate: h.saleDate,
        salePrice: h.salePrice,
        amountSold: h.amountSold,
      }))
      localStorage.setItem("portfolio-holdings", JSON.stringify(coreData))
    }
  }, [holdings])

  const { isRunning, events, result, error, startStream, reset } = useAgentStream()
  const { toast } = useToast()

  const handleAnalyze = async (isAuto = false) => {
    const validHoldings = holdings.filter((h) => h.symbol && Number.parseFloat(h.amount) > 0)

    if (validHoldings.length === 0) {
      if (!isAuto) {
        toast({
          title: "No holdings to analyze",
          description: "Please add at least one asset with a valid amount",
          variant: "destructive",
        })
      }
      return
    }

    setAnalyzedHoldings(validHoldings)
    reset()

    const portfolio = {
      holdings: validHoldings.map((h) => ({
        symbol: h.symbol,
        amount: Number.parseFloat(h.amount),
      })),
    }

    if (!isAuto) {
      toast({
        title: "AI Analysis Started",
        description: `Analyzing ${validHoldings.length} assets with intelligent agents...`,
      })
    }

    await startStream("/api/agent/analyze", { portfolio })

    setNextRefresh(300)
  }

  useEffect(() => {
    if (!autoAnalyzed && holdings.length > 0) {
      const timer = setTimeout(() => {
        handleAnalyze(true)
        setAutoAnalyzed(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [holdings, autoAnalyzed])

  useEffect(() => {
    if (!result) return

    const interval = setInterval(() => {
      setNextRefresh((prev) => {
        if (prev <= 1) {
          handleAnalyze(true)
          return 300
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [result])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const displayHoldings = result && analyzedHoldings.length > 0 ? analyzedHoldings : holdings
  const chartHoldings = analyzedHoldings.length > 0 ? analyzedHoldings : holdings

  // Only calculate values on client side to avoid hydration mismatch
  const totalValue = isClient ? displayHoldings.reduce((sum, h) => sum + (h.value || 0), 0) : 0
  const totalPnL = isClient
    ? displayHoldings.reduce((sum, h) => {
        if (h.purchasePrice && h.price) {
          const cost = Number.parseFloat(h.purchasePrice) * Number.parseFloat(h.amount)
          const current = h.price * Number.parseFloat(h.amount)
          return sum + (current - cost)
        }
        return sum
      }, 0)
    : 0
  const pnlPercentage = isClient
    ? displayHoldings.reduce((sum, h) => {
        if (h.purchasePrice && h.price) {
          const cost = Number.parseFloat(h.purchasePrice)
          return sum + ((h.price - cost) / cost) * 100
        }
        return sum
      }, 0) / (displayHoldings.filter((h) => h.purchasePrice && h.price).length || 1)
    : 0

  const { isWidgetEnabled } = useDashboardWidgets()

  return (
    <CustomizableDashboard>
      <div className="space-y-6" suppressHydrationWarning>
      <div className="flex items-center justify-end gap-2 mb-4" suppressHydrationWarning>
        <ExportPortfolio holdings={displayHoldings} result={result} totalValue={totalValue} />
      </div>
      
      <div className="gradient-card border-border/50 rounded-lg p-8" suppressHydrationWarning>
        <div className="flex items-start justify-between mb-6" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <div className="flex items-center gap-2 mb-2" suppressHydrationWarning>
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">AI-Powered Portfolio Intelligence</span>
            </div>
            <h2 className="text-4xl font-bold mb-2">Total Portfolio Value</h2>
            <div className="text-5xl font-bold text-gradient mb-2">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span
                className={`flex items-center gap-1 font-semibold ${totalPnL >= 0 ? "text-success" : "text-destructive"}`}
              >
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {totalPnL >= 0 ? "+" : ""}
                {totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-muted-foreground">Total P/L</span>
              {pnlPercentage !== 0 && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    pnlPercentage >= 0
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-destructive/20 text-destructive border border-destructive/30"
                  }`}
                >
                  {pnlPercentage >= 0 ? "+" : ""}
                  {pnlPercentage.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 animate-pulse-glow"
              onClick={() => handleAnalyze(false)}
              disabled={isRunning}
            >
              <Activity className="mr-2 h-5 w-5" />
              {isRunning ? "Analyzing..." : "Analyze Portfolio"}
            </Button>
            {result && !isRunning && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Next update in: {formatTime(nextRefresh)}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleAnalyze(false)}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4" suppressHydrationWarning>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50" suppressHydrationWarning>
            <div className="text-sm text-muted-foreground mb-1" suppressHydrationWarning>Assets</div>
            <div className="text-2xl font-bold">{isClient ? displayHoldings.length : 0}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Health Score</div>
            <div className="text-2xl font-bold text-primary">
              {isClient && result?.compute_health?.health ? `${result.compute_health.health}/100` : "--"}
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              {isClient && result?.compute_risk?.volPct ? (
                <>
                  {result.compute_risk.volPct > 50 ? (
                    <>
                      <span className="inline-block w-3 h-3 rounded-full bg-destructive animate-pulse"></span>
                      <span className="text-destructive">High</span>
                    </>
                  ) : result.compute_risk.volPct > 30 ? (
                    <>
                      <span className="inline-block w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
                      <span className="text-orange-500">Moderate</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-block w-3 h-3 rounded-full bg-success animate-pulse"></span>
                      <span className="text-success">Low</span>
                    </>
                  )}
                </>
              ) : (
                "--"
              )}
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Active Alerts</div>
            <div className="text-2xl font-bold text-destructive">{result?.check_alerts?.length || 0}</div>
          </div>
        </div>
      </div>

      <AgentStatus isRunning={isRunning} events={events} error={error} />

      {isWidgetEnabled("ai-intelligence") && (
        <AIIntelligenceCenter holdings={displayHoldings} result={result} totalValue={totalValue} />
      )}

      {isWidgetEnabled("predictive-analytics") && (
        <PredictiveAnalyticsDashboard holdings={displayHoldings} result={result} totalValue={totalValue} />
      )}

      {isWidgetEnabled("portfolio-comparison") && (
        <PortfolioComparison holdings={displayHoldings} result={result} totalValue={totalValue} />
      )}

      <RealTimePriceTicker holdings={displayHoldings} />

      {(isWidgetEnabled("activity-feed") || isWidgetEnabled("predictive-insights") || isWidgetEnabled("smart-recommendations")) && (
        <div className="grid gap-6 lg:grid-cols-3" suppressHydrationWarning>
          {isWidgetEnabled("activity-feed") && <AIActivityFeed holdings={displayHoldings} result={result} />}
          {isWidgetEnabled("predictive-insights") && (
            <PredictiveInsights holdings={displayHoldings} result={result} totalValue={totalValue} />
          )}
          {isWidgetEnabled("smart-recommendations") && (
            <SmartRecommendations holdings={displayHoldings} result={result} totalValue={totalValue} />
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2" suppressHydrationWarning>
        {isWidgetEnabled("news-impact") && <AINewsImpactEnhanced holdings={displayHoldings} />}
        {isWidgetEnabled("stress-testing") && (
          <PortfolioStressTesting
            holdings={displayHoldings}
            totalValue={totalValue}
            riskMetrics={result?.compute_risk}
          />
        )}
      </div>


      {isWidgetEnabled("auto-rebalancing") && (
        <AutoRebalancingAdvisor holdings={displayHoldings} result={result} totalValue={totalValue} />
      )}

        <div className="grid gap-6 lg:grid-cols-2" suppressHydrationWarning>
          {isWidgetEnabled("portfolio-optimization") && (
            <PortfolioOptimization holdings={displayHoldings} result={result} totalValue={totalValue} />
          )}
          {isWidgetEnabled("performance-attribution") && (
            <PerformanceAttribution holdings={displayHoldings} totalValue={totalValue} />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2" suppressHydrationWarning>
          <PortfolioSnapshot holdings={displayHoldings} totalValue={totalValue} />
        </div>

        {isWidgetEnabled("natural-language") && (
          <div className="grid gap-6 lg:grid-cols-2" suppressHydrationWarning>
            <NaturalLanguageCommands holdings={displayHoldings} />
          </div>
        )}

      {result && (
        <Card className="gradient-card border-border/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10 animate-pulse-slow">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  Risk Metrics & Analysis
                </CardTitle>
                <CardDescription className="mt-2">
                  AI-powered risk assessment and portfolio health indicators
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                AI Analyzed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Sharpe Ratio</span>
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono">{result.compute_risk?.sharpe?.toFixed(2) || "--"}</div>
                  <Progress value={(result.compute_risk?.sharpe || 0) * 50} className="h-2 bg-primary/10" />
                  <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
                </div>
              </div>

              <div
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-4 hover:border-chart-3/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "50ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Volatility</span>
                    <div className="p-1.5 rounded-md bg-chart-3/10">
                      <Activity className="h-3.5 w-3.5 text-chart-3" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono text-chart-3">
                    {result.compute_risk?.volPct?.toFixed(2) || "--"}%
                  </div>
                  <Progress value={result.compute_risk?.volPct || 0} className="h-2 bg-chart-3/10" />
                  <p className="text-xs text-muted-foreground">Annual volatility</p>
                </div>
              </div>

              <div
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-4 hover:border-destructive/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Max Drawdown</span>
                    <div className="p-1.5 rounded-md bg-destructive/10">
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono text-destructive">
                    {result.compute_risk?.maxDrawdownPct?.toFixed(2) || "--"}%
                  </div>
                  <Progress
                    value={Math.abs(result.compute_risk?.maxDrawdownPct || 0)}
                    className="h-2 bg-destructive/10"
                  />
                  <p className="text-xs text-muted-foreground">Worst decline</p>
                </div>
              </div>

              <div
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "150ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Beta vs BTC</span>
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Activity className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono">{result.compute_risk?.beta?.toFixed(2) || "--"}</div>
                  <Progress value={(result.compute_risk?.beta || 0) * 50} className="h-2 bg-primary/10" />
                  <p className="text-xs text-muted-foreground">Market correlation</p>
                </div>
              </div>
            </div>

            {result.check_alerts && result.check_alerts.length > 0 && (
              <div className="mt-6 space-y-4 animate-fade-in">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-destructive/10 animate-pulse">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  Active Risk Alerts
                </h4>
                <div className="grid gap-3">
                  {result.check_alerts.map((alert: any, idx: number) => (
                    <div
                      key={idx}
                      className={`group relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 hover:shadow-md animate-slide-in ${
                        alert.severity === "high"
                          ? "bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30 hover:border-destructive/50"
                          : "bg-gradient-to-r from-chart-4/10 to-chart-4/5 border-chart-4/30 hover:border-chart-4/50"
                      }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div
                        className={`p-2 rounded-lg ${alert.severity === "high" ? "bg-destructive/20" : "bg-chart-4/20"}`}
                      >
                        <AlertTriangle
                          className={`h-5 w-5 ${alert.severity === "high" ? "text-destructive" : "text-chart-4"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-1">{alert.type}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                      </div>
                      <Badge variant={alert.severity === "high" ? "destructive" : "secondary"} className="shrink-0">
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

        <div className="grid gap-6 lg:grid-cols-2" suppressHydrationWarning>
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Portfolio Composition</CardTitle>
              <CardDescription>Current asset allocation and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetAllocationEnhanced holdings={displayHoldings} />
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>90-day portfolio value trend</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChartEnhanced result={result} holdings={chartHoldings} />
            </CardContent>
          </Card>
        </div>

      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Manage Holdings</CardTitle>
          <CardDescription>Add or update your portfolio holdings for AI-powered analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioInput holdings={holdings} onChange={setHoldings} />
        </CardContent>
      </Card>

      <AIChatWidget />
      </div>
    </CustomizableDashboard>
  )
}
