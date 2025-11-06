"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, TrendingUp, Target, Zap, ArrowRight, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PortfolioOptimizationProps {
  holdings: Array<{
    symbol: string
    amount: string
    price?: number
    value?: number
  }>
  result?: any
  totalValue?: number
}

type RiskProfile = "conservative" | "balanced" | "aggressive"

interface OptimizedAllocation {
  symbol: string
  currentWeight: number
  optimizedWeight: number
  difference: number
  expectedReturn: number
  risk: number
}

export function PortfolioOptimization({ holdings, result, totalValue = 0 }: PortfolioOptimizationProps) {
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("balanced")
  const [showOptimization, setShowOptimization] = useState(false)
  const { toast } = useToast()

  // Calculate optimized allocation based on risk profile
  const optimizedAllocation = useMemo(() => {
    if (holdings.length === 0 || totalValue === 0) return []

    // Risk profile targets
    const targets = {
      conservative: {
        btc: 0.4,
        eth: 0.3,
        stable: 0.2,
        alt: 0.1,
      },
      balanced: {
        btc: 0.35,
        eth: 0.25,
        stable: 0.15,
        alt: 0.25,
      },
      aggressive: {
        btc: 0.25,
        eth: 0.2,
        stable: 0.1,
        alt: 0.45,
      },
    }

    const target = targets[riskProfile]
    const allocations: OptimizedAllocation[] = []

    holdings.forEach((holding) => {
      const symbol = holding.symbol.toUpperCase()
      const currentWeight = holding.value ? holding.value / totalValue : 0

      // Categorize asset
      let category: "btc" | "eth" | "stable" | "alt" = "alt"
      if (symbol === "BTC") category = "btc"
      else if (symbol === "ETH") category = "eth"
      else if (["USDT", "USDC", "DAI", "BUSD"].includes(symbol)) category = "stable"
      else category = "alt"

      // Calculate optimized weight (distribute category weight equally among assets in category)
      const categoryAssets = holdings.filter((h) => {
        const s = h.symbol.toUpperCase()
        if (category === "btc") return s === "BTC"
        if (category === "eth") return s === "ETH"
        if (category === "stable")
          return ["USDT", "USDC", "DAI", "BUSD"].includes(s)
        return s !== "BTC" && s !== "ETH" && !["USDT", "USDC", "DAI", "BUSD"].includes(s)
      }).length

      const categoryWeight = target[category]
      const optimizedWeight = categoryAssets > 0 ? categoryWeight / categoryAssets : 0

      // Expected return and risk (simplified)
      const expectedReturn =
        category === "btc"
          ? 15
          : category === "eth"
            ? 20
            : category === "stable"
              ? 5
              : riskProfile === "aggressive"
                ? 35
                : 25
      const risk =
        category === "btc"
          ? 60
          : category === "eth"
            ? 70
            : category === "stable"
              ? 10
              : riskProfile === "aggressive"
                ? 90
                : 75

      allocations.push({
        symbol: holding.symbol,
        currentWeight,
        optimizedWeight,
        difference: optimizedWeight - currentWeight,
        expectedReturn,
        risk,
      })
    })

    return allocations.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
  }, [holdings, totalValue, riskProfile])

  const expectedReturn = useMemo(() => {
    return optimizedAllocation.reduce(
      (sum, item) => sum + item.optimizedWeight * item.expectedReturn,
      0,
    )
  }, [optimizedAllocation])

  const expectedRisk = useMemo(() => {
    return optimizedAllocation.reduce((sum, item) => sum + item.optimizedWeight * item.risk, 0)
  }, [optimizedAllocation])

  const optimizationScore = useMemo(() => {
    const totalDeviation = optimizedAllocation.reduce((sum, item) => sum + Math.abs(item.difference), 0)
    return Math.max(0, Math.min(100, 100 - totalDeviation * 200))
  }, [optimizedAllocation])

  const handleOptimize = () => {
    toast({
      title: "Portfolio Optimization",
      description: `Optimized for ${riskProfile} risk profile. Expected return: ${expectedReturn.toFixed(1)}%, Risk: ${expectedRisk.toFixed(1)}%`,
    })
    setShowOptimization(true)
  }

  if (!result || holdings.length === 0 || totalValue === 0) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Portfolio Optimization
          </CardTitle>
          <CardDescription>AI-powered portfolio optimization based on risk profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add holdings and run analysis to see optimization recommendations</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Portfolio Optimization Engine
          </CardTitle>
          <CardDescription>AI optimizes your portfolio based on risk tolerance and return objectives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Profile Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Risk Profile</Label>
              <Select value={riskProfile} onValueChange={(value) => setRiskProfile(value as RiskProfile)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Risk Tolerance</span>
                <span className="font-medium">
                  {riskProfile === "conservative"
                    ? "Low"
                    : riskProfile === "balanced"
                      ? "Medium"
                      : "High"}
                </span>
              </div>
              <Progress
                value={riskProfile === "conservative" ? 30 : riskProfile === "balanced" ? 60 : 90}
                className="h-2"
              />
            </div>
          </div>

          {/* Optimization Preview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Optimization Score</div>
              <div className="text-2xl font-bold text-primary">{optimizationScore.toFixed(0)}%</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Expected Return</div>
              <div className="text-2xl font-bold text-success">+{expectedReturn.toFixed(1)}%</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Expected Risk</div>
              <div className="text-2xl font-bold text-orange-500">{expectedRisk.toFixed(1)}%</div>
            </div>
          </div>

          {/* Optimization Button */}
          <Button onClick={handleOptimize} className="w-full bg-primary hover:bg-primary/90">
            <Zap className="h-4 w-4 mr-2" />
            Generate Optimized Portfolio
          </Button>

          {/* Quick Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommended Changes</h4>
            {optimizedAllocation
              .filter((item) => Math.abs(item.difference) > 0.05)
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-background/50"
                >
                  <span className="text-sm font-medium">{item.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {(item.currentWeight * 100).toFixed(1)}% →
                    </span>
                    <span className="text-xs font-medium">
                      {(item.optimizedWeight * 100).toFixed(1)}%
                    </span>
                    <Badge
                      variant={item.difference > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.difference > 0 ? "+" : ""}
                      {(item.difference * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Details Dialog */}
      <Dialog open={showOptimization} onOpenChange={setShowOptimization}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Optimized Portfolio Allocation</DialogTitle>
            <DialogDescription>
              AI-optimized allocation for {riskProfile} risk profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[500px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Expected Return</div>
                <div className="text-lg font-bold text-success">+{expectedReturn.toFixed(1)}%</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Expected Risk</div>
                <div className="text-lg font-bold text-orange-500">{expectedRisk.toFixed(1)}%</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Optimization Score</div>
                <div className="text-lg font-bold text-primary">{optimizationScore.toFixed(0)}%</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Allocation Changes</h4>
              {optimizedAllocation.map((item) => (
                <div
                  key={item.symbol}
                  className="p-4 rounded-lg border border-border/50 bg-background/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        Return: +{item.expectedReturn}% | Risk: {item.risk}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Current:</span>
                      <span>{(item.currentWeight * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Optimized:</span>
                      <span className="font-medium">{(item.optimizedWeight * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span>Change:</span>
                      <span className={item.difference > 0 ? "text-success" : "text-destructive"}>
                        {item.difference > 0 ? "+" : ""}
                        {(item.difference * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={item.optimizedWeight * 100}
                      className="h-2 mt-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                ⚠️ This is a simulation. Optimization is based on risk profile and historical data. Always review and
                adjust based on your individual circumstances.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
