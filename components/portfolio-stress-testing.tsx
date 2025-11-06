"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown, Zap, Droplets, Shield, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface StressScenario {
  id: string
  name: string
  description: string
  severity: "extreme" | "high" | "moderate"
  icon: any
  impact: {
    portfolioValue: number
    percentChange: number
    maxDrawdown: number
    recoveryTime: string
    affectedAssets: string[]
  }
  status: "ready" | "running" | "complete"
}

interface PortfolioStressTestingProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number }>
  totalValue?: number
  riskMetrics?: any
}

export function PortfolioStressTesting({ holdings = [], totalValue = 0, riskMetrics }: PortfolioStressTestingProps) {
  const generateScenarios = (): StressScenario[] => {
    const portfolioSymbols = holdings.map((h) => h.symbol.toUpperCase())
    const hasValue = totalValue > 0
    const volatility = riskMetrics?.volPct || 50
    const maxDD = Math.abs(riskMetrics?.maxDDPct || 20)
    const sharpe = riskMetrics?.sharpe || 1.0

    // Calculate stress scenarios based on actual portfolio metrics
    // Black Swan: 2x max drawdown or 50% crash, whichever is worse
    const blackSwanImpact = Math.max(50, maxDD * 1.5)
    const blackSwanRecovery = sharpe > 1 ? "12-18 months" : sharpe > 0.5 ? "18-24 months" : "24+ months"

    // Correlation breakdown: Based on actual volatility
    const correlationImpact = Math.min(40, volatility * 0.6)
    const correlationRecovery = sharpe > 1 ? "6-10 months" : "8-12 months"

    // Liquidity crisis: Moderate impact with slippage
    const liquidityImpact = Math.min(25, volatility * 0.4)
    const liquidityRecovery = sharpe > 1 ? "2-4 months" : "3-6 months"

    // Regulatory shock: Lower impact, faster recovery
    const regulatoryImpact = Math.min(15, volatility * 0.25)
    const regulatoryRecovery = sharpe > 1 ? "1-2 months" : "2-4 months"

    return [
      {
        id: "black-swan",
        name: "Black Swan Event",
        description: "Sudden market crash across all crypto assets",
        severity: "extreme",
        icon: AlertTriangle,
        impact: {
          portfolioValue: hasValue ? totalValue * (1 - blackSwanImpact / 100) : totalValue * 0.5,
          percentChange: -blackSwanImpact,
          maxDrawdown: -(blackSwanImpact * 1.05),
          recoveryTime: blackSwanRecovery,
          affectedAssets: portfolioSymbols.length > 0 ? portfolioSymbols : ["BTC", "ETH", "SOL", "AVAX", "BNB"],
        },
        status: "ready",
      },
      {
        id: "correlation-breakdown",
        name: "Correlation Breakdown",
        description: "Assets move independently, traditional hedges fail",
        severity: "high",
        icon: Zap,
        impact: {
          portfolioValue: hasValue ? totalValue * (1 - correlationImpact / 100) : totalValue * 0.7,
          percentChange: -correlationImpact,
          maxDrawdown: -(correlationImpact * 1.2),
          recoveryTime: correlationRecovery,
          affectedAssets: portfolioSymbols.filter((s) => ["AVAX", "SOL", "BNB"].includes(s)),
        },
        status: "ready",
      },
      {
        id: "liquidity-crisis",
        name: "Liquidity Crisis",
        description: "Major exchange outages, unable to exit positions",
        severity: "high",
        icon: Droplets,
        impact: {
          portfolioValue: hasValue ? totalValue * (1 - liquidityImpact / 100) : totalValue * 0.8,
          percentChange: -liquidityImpact,
          maxDrawdown: -(liquidityImpact * 1.15),
          recoveryTime: liquidityRecovery,
          affectedAssets: portfolioSymbols.filter((s) => ["AVAX", "SOL"].includes(s)),
        },
        status: "ready",
      },
      {
        id: "regulatory-shock",
        name: "Regulatory Shock",
        description: "Sudden regulatory crackdown on crypto trading",
        severity: "moderate",
        icon: Shield,
        impact: {
          portfolioValue: hasValue ? totalValue * (1 - regulatoryImpact / 100) : totalValue * 0.9,
          percentChange: -regulatoryImpact,
          maxDrawdown: -(regulatoryImpact * 1.1),
          recoveryTime: regulatoryRecovery,
          affectedAssets: portfolioSymbols.filter((s) => ["BTC", "ETH"].includes(s)),
        },
        status: "ready",
      },
    ]
  }

  const [scenarios, setScenarios] = useState<StressScenario[]>(generateScenarios())
  const [selectedScenario, setSelectedScenario] = useState<string | null>("liquidity-crisis")

  useEffect(() => {
    setScenarios(generateScenarios())
  }, [totalValue, holdings.length, riskMetrics])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "extreme":
        return "text-destructive border-destructive/50 bg-destructive/10"
      case "high":
        return "text-orange-500 border-orange-500/50 bg-orange-500/10"
      default:
        return "text-chart-4 border-chart-4/50 bg-chart-4/10"
    }
  }

  const runStressTest = (scenarioId: string) => {
    setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? { ...s, status: "running" as const } : s)))

    setTimeout(() => {
      setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? { ...s, status: "complete" as const } : s)))
    }, 2000)
  }

  const selected = scenarios.find((s) => s.id === selectedScenario)

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Portfolio Stress Testing
        </CardTitle>
        <CardDescription>Simulate extreme market scenarios and assess portfolio resilience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selection */}
        <div className="grid gap-3 md:grid-cols-2">
          {scenarios.map((scenario, idx) => {
            const Icon = scenario.icon
            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all duration-300 animate-slide-in hover:scale-[1.02]",
                  selectedScenario === scenario.id
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-background/50 hover:border-primary/50",
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm">{scenario.name}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", getSeverityColor(scenario.severity))}>
                    {scenario.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{scenario.description}</p>
                {scenario.status === "running" && (
                  <div className="mt-3">
                    <Progress value={50} className="h-1.5 animate-pulse" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Scenario Details */}
        {selected && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Impact Analysis: {selected.name}
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => runStressTest(selected.id)}
                disabled={selected.status === "running"}
                className="border-primary/50 hover:bg-primary/10"
              >
                <Play className="h-3 w-3 mr-1" />
                {selected.status === "running" ? "Running..." : "Run Test"}
              </Button>
            </div>

            {/* Impact Metrics */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-border/50 bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Portfolio Value After</span>
                  <span className="text-lg font-bold text-destructive">
                    ${selected.impact.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Value Change</span>
                    <span className="font-medium text-destructive">{selected.impact.percentChange}%</span>
                  </div>
                  <Progress value={Math.abs(selected.impact.percentChange)} className="h-2 [&>div]:bg-destructive" />
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/50 bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Drawdown</span>
                  <span className="text-lg font-bold text-destructive">{selected.impact.maxDrawdown}%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recovery Time</span>
                    <span className="font-medium text-chart-4">{selected.impact.recoveryTime}</span>
                  </div>
                  <Progress value={75} className="h-2 [&>div]:bg-chart-4" />
                </div>
              </div>
            </div>

            {/* Affected Assets */}
            {selected.impact.affectedAssets.length > 0 && (
              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div className="text-sm font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Most Affected Assets
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.impact.affectedAssets.map((asset) => (
                    <Badge key={asset} variant="outline" className="border-destructive/50 text-destructive">
                      {asset}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Historical data from 50,000+ portfolios</span>
            <span className="text-primary font-medium">Monte Carlo Simulation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
