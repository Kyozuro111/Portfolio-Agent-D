"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown, Target, Zap, Info, ChevronRight, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AIRecommendation {
  id: string
  type: "rebalance" | "alert" | "opportunity" | "risk" | "optimization"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  confidence: number
  reasoning: string
  actions: Array<{ label: string; action: () => void }>
  timestamp: number
}

interface AIIntelligenceCenterProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number }>
  result?: any
  totalValue?: number
}

export function AIIntelligenceCenter({ holdings = [], result, totalValue = 0 }: AIIntelligenceCenterProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!result || !holdings.length) return

    // Only generate on client side to avoid hydration mismatch
    if (typeof window === "undefined") return

    generateRecommendations()
  }, [result, holdings, totalValue])

  const generateRecommendations = () => {
    setLoading(true)

    // Simulate AI analysis delay
    setTimeout(() => {
      const newRecommendations: AIRecommendation[] = []
      const now = typeof window !== "undefined" ? Date.now() : 0

      // Risk-based recommendations
      if (result?.check_alerts && result.check_alerts.length > 0) {
        const highRiskAlerts = result.check_alerts.filter((a: any) => a.severity === "high" || a.severity === "critical")

        if (highRiskAlerts.length > 0) {
          newRecommendations.push({
            id: "risk-1",
            type: "risk",
            priority: "high",
            title: "High Risk Detected",
            description: `${highRiskAlerts.length} critical risk alerts require immediate attention`,
            confidence: 95,
            reasoning: `Your portfolio has ${highRiskAlerts.length} high-severity risk alerts. These include concentration risks, volatility thresholds, and drawdown limits.`,
            actions: [
              {
                label: "View Rebalancing",
                action: () => {
                  const rebalancingSection = document.querySelector('[data-section="rebalancing"]')
                  rebalancingSection?.scrollIntoView({ behavior: "smooth" })
                },
              },
              {
                label: "Run Stress Test",
                action: () => {
                  const stressSection = document.querySelector('[data-section="stress"]')
                  stressSection?.scrollIntoView({ behavior: "smooth" })
                },
              },
            ],
            timestamp: now,
          })
        }
      }

      // Rebalancing recommendations
      if (result?.compute_risk?.volPct && result.compute_risk.volPct > 50) {
        newRecommendations.push({
          id: "rebalance-1",
          type: "rebalance",
          priority: "high",
          title: "Volatility Too High",
          description: "Portfolio volatility is 82.1%, exceeding optimal range. Consider rebalancing to reduce risk.",
          confidence: 88,
          reasoning: `Current volatility of ${result.compute_risk.volPct.toFixed(1)}% is significantly above the recommended 30-50% range. Rebalancing to include more stable assets or reduce high-volatility positions could improve risk-adjusted returns.`,
          actions: [
            {
              label: "Generate Rebalance Plan",
              action: () => {
                toast({
                  title: "Rebalance Advisor",
                  description: "Opening rebalance advisor...",
                })
              },
            },
          ],
          timestamp: now,
        })
      }

      // Diversification recommendations
      if (result?.compute_health?.diversification && result.compute_health.diversification < 50) {
        newRecommendations.push({
          id: "optimization-1",
          type: "optimization",
          priority: "medium",
          title: "Low Diversification",
          description: `Diversification score is ${result.compute_health.diversification}%. Consider adding more assets.`,
          confidence: 82,
          reasoning: `Your portfolio has a diversification score of ${result.compute_health.diversification}%, indicating concentration risk. Adding 3-5 additional assets across different sectors could improve diversification and reduce single-asset risk.`,
          actions: [
            {
              label: "Find Opportunities",
              action: () => {
                const oppSection = document.querySelector('[data-section="opportunities"]')
                oppSection?.scrollIntoView({ behavior: "smooth" })
              },
            },
          ],
          timestamp: now,
        })
      }

      // Opportunity-based recommendations
      if (holdings.length > 0) {
        const symbols = holdings.map((h) => h.symbol.toUpperCase()).join(", ")
        newRecommendations.push({
          id: "opportunity-1",
          type: "opportunity",
          priority: "medium",
          title: "Scan for Opportunities",
          description: `AI detected potential opportunities in the market. Scan your portfolio holdings (${symbols}) for momentum and sentiment signals.`,
          confidence: 75,
          reasoning: "Based on current market conditions and your portfolio composition, there may be opportunities for optimization or new positions with favorable risk/reward ratios.",
          actions: [
            {
              label: "Scan Market",
              action: () => {
                const oppSection = document.querySelector('[data-section="opportunities"]')
                oppSection?.scrollIntoView({ behavior: "smooth" })
              },
            },
          ],
          timestamp: now,
        })
      }

      setRecommendations(newRecommendations)
      setLoading(false)
    }, 1000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "rebalance":
        return <Target className="h-5 w-5 text-primary" />
      case "opportunity":
        return <TrendingUp className="h-5 w-5 text-success" />
      case "optimization":
        return <Zap className="h-5 w-5 text-chart-4" />
      default:
        return <Info className="h-5 w-5 text-primary" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/50"
      case "medium":
        return "bg-orange-500/20 text-orange-500 border-orange-500/50"
      case "low":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const handleDismiss = (id: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id))
    toast({
      title: "Recommendation dismissed",
      description: "This recommendation has been removed from your feed.",
    })
  }

  if (loading) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            AI Intelligence Center
          </CardTitle>
          <CardDescription>Analyzing portfolio for recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Intelligence Center
          </CardTitle>
          <CardDescription>AI-powered recommendations and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations at this time.</p>
            <p className="text-sm mt-2">Run portfolio analysis to get AI insights.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="gradient-card border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                AI Intelligence Center
              </CardTitle>
              <CardDescription className="mt-2">
                Proactive recommendations and insights powered by AI analysis
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 px-3 py-1.5">
              {recommendations.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/70 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge className={getPriorityColor(rec.priority)} variant="outline">
                        {rec.priority}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {rec.confidence}% confident
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {rec.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          onClick={action.action}
                          className="text-xs"
                        >
                          {action.label}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRecommendation(rec)}
                        className="text-xs"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Why AI suggests this
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(rec.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Explanation Dialog */}
      <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRecommendation && getTypeIcon(selectedRecommendation.type)}
              {selectedRecommendation?.title}
            </DialogTitle>
            <DialogDescription>AI Reasoning and Analysis</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-semibold mb-2">Confidence: {selectedRecommendation?.confidence}%</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedRecommendation?.reasoning}</p>
            </div>
            {selectedRecommendation && selectedRecommendation.actions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Recommended Actions:</h4>
                <div className="space-y-2">
                  {selectedRecommendation.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => {
                        action.action()
                        setSelectedRecommendation(null)
                      }}
                      className="w-full justify-start"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
