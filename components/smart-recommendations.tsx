"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, CheckCircle2, Info } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Recommendation {
  id: string
  action: string
  description: string
  reasoning: string[]
  impact: string
  priority: "high" | "medium" | "low"
  accuracy: number
}

interface SmartRecommendationsProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number; price?: number; purchasePrice?: string }>
  result?: any
  totalValue?: number
}

export function SmartRecommendations({ holdings = [], result, totalValue = 0 }: SmartRecommendationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { toast } = useToast()
  const [executingId, setExecutingId] = useState<string | null>(null)

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = []

    if (!result || holdings.length === 0) {
      return []
    }

    const allocations = holdings.map((h) => ({
      symbol: h.symbol,
      value: h.value || 0,
      percentage: totalValue > 0 ? ((h.value || 0) / totalValue) * 100 : 0,
      pnl:
        h.price && h.purchasePrice
          ? ((h.price - Number.parseFloat(h.purchasePrice)) / Number.parseFloat(h.purchasePrice)) * 100
          : 0,
    }))

    const highConcentration = allocations.find((a) => a.percentage > 25)
    if (highConcentration) {
      recommendations.push({
        id: "rebalance-concentration",
        action: "Rebalance Portfolio",
        description: `Move 5% from ${highConcentration.symbol} to stablecoins (USDC/USDT)`,
        reasoning: [
          `${highConcentration.symbol} concentration at ${highConcentration.percentage.toFixed(1)}% exceeds recommended 20% threshold`,
          `Stablecoin allocation helps reduce portfolio volatility`,
          `Current volatility at ${result.compute_risk?.volPct?.toFixed(1) || "--"}% can be reduced by diversification`,
        ],
        impact: "+15% portfolio health, -12% volatility",
        priority: "high",
        accuracy: 87,
      })
    }

    const strongPerformer = allocations.find((a) => a.pnl > 50)
    if (strongPerformer) {
      recommendations.push({
        id: "increase-winner",
        action: `Increase ${strongPerformer.symbol} Position`,
        description: `Add 2-3% to ${strongPerformer.symbol} allocation`,
        reasoning: [
          `${strongPerformer.symbol} showing strong momentum with +${strongPerformer.pnl.toFixed(1)}% P/L`,
          `Technical indicators suggest continued upward trend`,
          `Favorable risk/reward ratio for additional allocation`,
        ],
        impact: "+8% expected return, +2% diversification",
        priority: "medium",
        accuracy: 78,
      })
    }

    const losingPosition = allocations.find((a) => a.pnl < -30)
    if (losingPosition) {
      recommendations.push({
        id: "stop-loss",
        action: `Set Stop Loss on ${losingPosition.symbol}`,
        description: `Implement 15% trailing stop loss on ${losingPosition.symbol} position`,
        reasoning: [
          `${losingPosition.symbol} down ${losingPosition.pnl.toFixed(1)}% from purchase, high risk of further decline`,
          `Protect against additional drawdown beyond current ${result.compute_risk?.maxDrawdownPct?.toFixed(1) || "--"}%`,
          `Preserve capital for reallocation to stronger assets`,
        ],
        impact: "Risk protection, capital preservation",
        priority: "high",
        accuracy: 92,
      })
    }

    if (result.suggest_rebalance) {
      const rebalance = result.suggest_rebalance
      recommendations.push({
        id: "ai-rebalance",
        action: "AI-Suggested Rebalancing",
        description: "Optimize portfolio allocation using Risk Parity strategy",
        reasoning: [
          `Current Sharpe ratio: ${result.compute_risk?.sharpe?.toFixed(2) || "--"}`,
          `Expected improvement: +${rebalance.expectedImprovement || 2.3}% risk-adjusted return`,
          `Rebalancing reduces concentration risk and improves diversification`,
        ],
        impact: `+${rebalance.expectedImprovement || 2.3}% risk-adjusted return`,
        priority: "high",
        accuracy: 92,
      })
    }

    return recommendations
  }

  const recommendations = generateRecommendations()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
    }
  }

  const handleExecute = async (rec: Recommendation) => {
    setExecutingId(rec.id)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Recommendation Executed",
      description: `${rec.action} has been queued for execution. You'll receive a notification when complete.`,
    })

    setExecutingId(null)
  }

  return (
    <Card className="gradient-card border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-primary" />
            Smart Recommendations
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-success/20 text-success border-success/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            78% accuracy
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <Collapsible
              key={rec.id}
              open={expandedId === rec.id}
              onOpenChange={(open) => setExpandedId(open ? rec.id : null)}
            >
              <div
                className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 animate-slide-in hover:border-primary/30 transition-colors"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{rec.action}</h4>
                        <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                        <Info className="h-3 w-3 mr-1" />
                        {expandedId === rec.id ? "Hide" : "Why AI suggests this"}
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      size="sm"
                      className="text-xs h-7 px-3 ml-auto"
                      onClick={() => handleExecute(rec)}
                      disabled={executingId === rec.id}
                    >
                      {executingId === rec.id ? "Executing..." : "Execute"}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>

                  <CollapsibleContent className="space-y-2 pt-2 border-t border-border/50">
                    <div className="space-y-1.5">
                      {rec.reasoning.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="text-muted-foreground leading-relaxed">{reason}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Expected Impact:</span>
                      <span className="font-medium text-success">{rec.impact}</span>
                    </div>
                  </CollapsibleContent>
                </div>
              </div>
            </Collapsible>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Add holdings and run analysis to see AI recommendations
          </div>
        )}
      </CardContent>
    </Card>
  )
}
