"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { TrendingUp, Activity, DollarSign, PieChart, AlertTriangle, HelpCircle } from "lucide-react"
import { PortfolioInput } from "@/components/portfolio-input"
import { AssetAllocation } from "@/components/asset-allocation"
import { PerformanceChart } from "@/components/performance-chart"
import { AgentStatus } from "@/components/agent-status"
import { AnalysisResults } from "@/components/analysis-results"
import { AIActivityFeed } from "@/components/ai-activity-feed"
import { PredictiveInsights } from "@/components/predictive-insights"
import { SmartRecommendations } from "@/components/smart-recommendations"
import { AIChatWidget } from "@/components/ai-chat-widget"
import { QuickActionsFAB } from "@/components/quick-actions-fab"
import { useAgentStream } from "@/hooks/use-agent-stream"
import { useToast } from "@/hooks/use-toast"

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

export function PortfolioOverview() {
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio-holdings")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          console.log("[portfolio-agent] Loaded holdings from localStorage:", parsed.length, "assets")
          return parsed
        } catch (e) {
          console.error("[portfolio-agent] Failed to parse saved holdings:", e)
        }
      }
    }
    console.log("[portfolio-agent] No saved holdings found, starting with empty portfolio")
    return []
  })

  const [analyzedHoldings, setAnalyzedHoldings] = useState<Holding[]>([])

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
      console.log("[portfolio-agent] Saved holdings to localStorage:", holdings.length, "assets")
    }
  }, [holdings])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "a":
            e.preventDefault()
            handleAnalyze()
            break
          case "r":
            e.preventDefault()
            handleRefreshPrices()
            break
          case "k":
            e.preventDefault()
            // Open command palette (future feature)
            break
        }
      } else if (e.key === "?") {
        e.preventDefault()
        // Show keyboard shortcuts dialog
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [holdings])

  const { isRunning, events, result, error, startStream, reset } = useAgentStream()
  const { toast } = useToast()

  const handleAnalyze = async () => {
    const validHoldings = holdings.filter((h) => h.symbol && Number.parseFloat(h.amount) > 0)

    if (validHoldings.length === 0) {
      toast({
        title: "No holdings to analyze",
        description: "Please add at least one asset with a valid amount",
        variant: "destructive",
      })
      return
    }

    console.log("[portfolio-agent] Starting analysis with holdings:", validHoldings)

    setAnalyzedHoldings(validHoldings)
    console.log("[portfolio-agent] Saved analyzed holdings snapshot:", validHoldings.length, "assets")

    reset()

    const portfolio = {
      holdings: validHoldings.map((h) => ({
        symbol: h.symbol,
        amount: Number.parseFloat(h.amount),
      })),
    }

    console.log("[portfolio-agent] Sending portfolio to API:", portfolio)

    toast({
      title: "Analysis started",
      description: `Analyzing ${validHoldings.length} assets with AI agent...`,
    })

    await startStream("/api/agent/analyze", { portfolio })
  }

  const handleRefreshPrices = async () => {
    toast({
      title: "Refreshing prices",
      description: "Fetching latest market data...",
    })
    // Trigger price refresh logic
    await handleAnalyze()
  }

  const handleImportCSV = (importedHoldings: any[]) => {
    const newHoldings = importedHoldings.map((h) => ({
      id: Math.random().toString(36).substr(2, 9),
      symbol: h.symbol?.toUpperCase() || "",
      amount: h.amount || "0",
      purchasePrice: h.purchase_price || "",
      purchaseDate: h.purchase_date || "",
    }))
    setHoldings([...holdings, ...newHoldings])
    toast({
      title: "Import successful",
      description: `Added ${newHoldings.length} holdings to your portfolio`,
    })
  }

  const handleAddHolding = () => {
    const addSection = document.querySelector("[data-add-holdings]")
    if (addSection) {
      addSection.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const displayHoldings = result && analyzedHoldings.length > 0 ? analyzedHoldings : holdings
  const chartHoldings = analyzedHoldings.length > 0 ? analyzedHoldings : holdings

  console.log("[portfolio-agent] Displaying", displayHoldings.length, "holdings, result exists:", !!result)
  console.log("[portfolio-agent] Chart holdings:", chartHoldings.length, "assets")

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Portfolio Overview</h2>
            <p className="text-muted-foreground">Monitor your portfolio performance and health metrics</p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 animate-pulse-glow"
            onClick={handleAnalyze}
            disabled={isRunning}
          >
            <Activity className="mr-2 h-4 w-4" />
            {isRunning ? "Analyzing..." : "Analyze Portfolio"}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <AIActivityFeed />
          <PredictiveInsights />
          <SmartRecommendations />
        </div>

        <AgentStatus isRunning={isRunning} events={events} error={error} />

        <AnalysisResults result={result} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="gradient-card border-border/50 hover-lift animate-fade-in-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Total Value
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total current value of all your holdings</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-counter-up">
                $
                {displayHoldings
                  .reduce((sum, h) => sum + (h.value || 0), 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                Real-time prices
              </p>
            </CardContent>
          </Card>

          <Card
            className="gradient-card border-border/50 hover-lift animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Portfolio Health
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI-calculated health score based on diversification and risk</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary animate-counter-up">
                {result?.compute_health?.health || "--"}/100
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {result?.compute_health?.health ? "Good diversification" : "Run analysis"}
              </p>
            </CardContent>
          </Card>

          <Card
            className="gradient-card border-border/50 hover-lift animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Risk Score
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Portfolio volatility and risk assessment</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-counter-up">
                {result?.compute_risk?.volPct
                  ? result.compute_risk.volPct > 50
                    ? "High"
                    : result.compute_risk.volPct > 30
                      ? "Moderate"
                      : "Low"
                  : "--"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Volatility: {result?.compute_risk?.volPct || "--"}%</p>
            </CardContent>
          </Card>

          <Card
            className="gradient-card border-border/50 hover-lift animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Active Alerts
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of risk alerts requiring attention</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-counter-up">{result?.check_alerts?.length || "--"}</div>
              <p className="text-xs text-destructive mt-1">
                {result?.check_alerts?.length ? "Requires attention" : "Run analysis"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Portfolio Composition</CardTitle>
              <CardDescription>Current asset allocation and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetAllocation holdings={displayHoldings} />
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>90-day portfolio value trend</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart result={result} holdings={chartHoldings} />
            </CardContent>
          </Card>
        </div>

        <Card className="gradient-card border-border/50" data-add-holdings>
          <CardHeader>
            <CardTitle>Add Holdings</CardTitle>
            <CardDescription>Input your portfolio holdings for AI-powered analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioInput holdings={holdings} onChange={setHoldings} />
          </CardContent>
        </Card>

        <AIChatWidget />

        <QuickActionsFAB
          onAddHolding={handleAddHolding}
          onAnalyze={handleAnalyze}
          onImportCSV={handleImportCSV}
          onRefreshPrices={handleRefreshPrices}
        />
      </div>
    </TooltipProvider>
  )
}
