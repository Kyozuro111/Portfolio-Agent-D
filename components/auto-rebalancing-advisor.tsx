"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Zap, ArrowRight, Info, CheckCircle2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AutoRebalancingAdvisorProps {
  holdings: Array<{
    symbol: string
    amount: string
    value?: number
    price?: number
  }>
  result?: any
  totalValue?: number
}

interface RebalanceAction {
  symbol: string
  action: "buy" | "sell" | "hold"
  currentAllocation: number
  targetAllocation: number
  amountUSD: number
  amount: number
  reason: string
}

export function AutoRebalancingAdvisor({ holdings, result, totalValue = 0 }: AutoRebalancingAdvisorProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedAction, setSelectedAction] = useState<RebalanceAction | null>(null)
  const { toast } = useToast()

  // Calculate optimal allocation (equal weight for simplicity, can be enhanced)
  const optimalAllocation = useMemo(() => {
    if (holdings.length === 0 || totalValue === 0) return {}
    
    const equalWeight = 1 / holdings.length
    const allocations: Record<string, number> = {}
    
    holdings.forEach((h) => {
      allocations[h.symbol] = equalWeight
    })
    
    return allocations
  }, [holdings, totalValue])

  // Calculate current allocation
  const currentAllocation = useMemo(() => {
    if (totalValue === 0) return {}
    
    const allocations: Record<string, number> = {}
    holdings.forEach((h) => {
      if (h.value && h.value > 0) {
        allocations[h.symbol] = h.value / totalValue
      }
    })
    
    return allocations
  }, [holdings, totalValue])

  // Detect rebalancing needs (threshold: 5% deviation)
  const rebalanceActions = useMemo(() => {
    const actions: RebalanceAction[] = []
    const threshold = 0.05 // 5% deviation threshold

    holdings.forEach((holding) => {
      const symbol = holding.symbol
      const current = currentAllocation[symbol] || 0
      const target = optimalAllocation[symbol] || 0
      const deviation = Math.abs(current - target)

      if (deviation > threshold && totalValue > 0 && holding.price) {
        const diff = target - current
        const amountUSD = diff * totalValue
        const amount = amountUSD / holding.price

        let action: "buy" | "sell" | "hold" = "hold"
        if (diff > threshold) {
          action = "buy"
        } else if (diff < -threshold) {
          action = "sell"
        }

        let reason = ""
        if (action === "buy") {
          reason = `Underweight by ${(deviation * 100).toFixed(1)}%. Buy to reach target allocation.`
        } else if (action === "sell") {
          reason = `Overweight by ${(deviation * 100).toFixed(1)}%. Sell to reach target allocation.`
        }

        actions.push({
          symbol,
          action,
          currentAllocation: current,
          targetAllocation: target,
          amountUSD: Math.abs(amountUSD),
          amount: Math.abs(amount),
          reason,
        })
      }
    })

    return actions.sort((a, b) => b.amountUSD - a.amountUSD) // Sort by amount descending
  }, [holdings, currentAllocation, optimalAllocation, totalValue])

  const needsRebalancing = rebalanceActions.length > 0
  const totalDeviation = useMemo(() => {
    return Object.keys(currentAllocation).reduce((sum, symbol) => {
      const current = currentAllocation[symbol] || 0
      const target = optimalAllocation[symbol] || 0
      return sum + Math.abs(current - target)
    }, 0)
  }, [currentAllocation, optimalAllocation])

  const handleExecuteRebalance = () => {
    toast({
      title: "Rebalancing Plan Generated",
      description: `Prepared ${rebalanceActions.length} rebalancing actions. This is a simulation - actual execution requires exchange integration.`,
    })
    setShowDetails(true)
  }

  if (!result || holdings.length === 0 || totalValue === 0) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Auto Rebalancing Advisor
          </CardTitle>
          <CardDescription>AI-powered portfolio rebalancing recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add holdings and run analysis to see rebalancing recommendations</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="gradient-card border-border/50" data-section="rebalancing">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Auto Rebalancing Advisor
              </CardTitle>
              <CardDescription>AI detects when your portfolio needs rebalancing and suggests actions</CardDescription>
            </div>
            {needsRebalancing && (
              <Badge variant="destructive" className="animate-pulse">
                Action Needed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Portfolio Health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Portfolio Balance Score</span>
              <span className="text-sm text-muted-foreground">
                {((1 - totalDeviation / 2) * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={(1 - totalDeviation / 2) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {needsRebalancing
                ? `${rebalanceActions.length} assets need rebalancing`
                : "Portfolio is well balanced"}
            </p>
          </div>

          {/* Rebalancing Status */}
          {needsRebalancing ? (
            <div className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Rebalancing Recommended</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Your portfolio has drifted from optimal allocation. Rebalancing can improve risk-adjusted
                      returns.
                    </p>
                    <Button size="sm" onClick={handleExecuteRebalance} className="bg-primary hover:bg-primary/90">
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Rebalance Plan
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Actions Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Suggested Actions</h4>
                {rebalanceActions.slice(0, 3).map((action) => (
                  <div
                    key={action.symbol}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedAction(action)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          action.action === "buy"
                            ? "bg-success/10 text-success"
                            : action.action === "sell"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted"
                        }`}
                      >
                        {action.action === "buy" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : action.action === "sell" ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <Target className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{action.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {action.action.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.amount.toFixed(4)} {action.symbol} (${action.amountUSD.toLocaleString()})
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {rebalanceActions.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    +{rebalanceActions.length - 3} more actions
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Portfolio Well Balanced</h4>
                  <p className="text-xs text-muted-foreground">
                    Your portfolio allocation is within optimal range. No rebalancing needed at this time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current vs Target Allocation */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium">Current vs Target Allocation</h4>
            <div className="space-y-2">
              {holdings.slice(0, 5).map((holding) => {
                const current = currentAllocation[holding.symbol] || 0
                const target = optimalAllocation[holding.symbol] || 0
                const diff = current - target

                return (
                  <div key={holding.symbol} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{holding.symbol}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Current: {(current * 100).toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Target: {(target * 100).toFixed(1)}%</span>
                        {Math.abs(diff) > 0.05 && (
                          <Badge
                            variant={diff > 0 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {diff > 0 ? "+" : ""}
                            {(diff * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div
                        className="bg-primary/30 rounded-l"
                        style={{ width: `${current * 100}%` }}
                      />
                      <div
                        className="bg-muted rounded-r"
                        style={{ width: `${(target - current) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rebalance Plan Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Rebalancing Plan</DialogTitle>
            <DialogDescription>
              Detailed rebalancing actions to optimize your portfolio allocation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[500px] overflow-y-auto">
            {rebalanceActions.map((action) => (
              <div
                key={action.symbol}
                className="p-4 rounded-lg border border-border/50 bg-background/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={action.action === "buy" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {action.action.toUpperCase()}
                    </Badge>
                    <span className="font-semibold">{action.symbol}</span>
                  </div>
                  <span className="text-sm font-medium">
                    ${action.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{action.reason}</p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span>{(action.currentAllocation * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span>{(action.targetAllocation * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Amount:</span>
                    <span>
                      {action.amount.toFixed(4)} {action.symbol}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                ⚠️ This is a simulation. Actual execution requires integration with your exchange. Always review
                rebalancing actions before executing.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Detail Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction?.action.toUpperCase()} {selectedAction?.symbol}
            </DialogTitle>
            <DialogDescription>Detailed rebalancing action</DialogDescription>
          </DialogHeader>
          {selectedAction && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Action:</span>
                  <Badge variant={selectedAction.action === "buy" ? "default" : "destructive"}>
                    {selectedAction.action.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Allocation:</span>
                  <span className="text-sm font-medium">{(selectedAction.currentAllocation * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Target Allocation:</span>
                  <span className="text-sm font-medium">{(selectedAction.targetAllocation * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-medium">
                    {selectedAction.amount.toFixed(4)} {selectedAction.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Value:</span>
                  <span className="text-sm font-medium">
                    ${selectedAction.amountUSD.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-2">Reason:</p>
                <p className="text-xs text-muted-foreground">{selectedAction.reason}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
