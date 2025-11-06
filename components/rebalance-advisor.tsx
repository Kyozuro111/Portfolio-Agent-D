"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowRight, TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AgentStatus } from "@/components/agent-status"
import { useAgentStream } from "@/hooks/use-agent-stream"

const rebalanceActions = [
  { symbol: "BTC", action: "Sell", amount: "$2,450.00", percentage: -5.5, reason: "Reduce concentration risk" },
  { symbol: "ETH", action: "Hold", amount: "$0.00", percentage: 0, reason: "Optimal allocation" },
  { symbol: "SOL", action: "Buy", amount: "$1,200.00", percentage: 2.8, reason: "Increase diversification" },
  { symbol: "USDC", action: "Buy", amount: "$1,250.00", percentage: 2.7, reason: "Meet stability target" },
]

export function RebalanceAdvisor() {
  const { isRunning, events, result, error, startStream, reset } = useAgentStream()

  const handleGenerate = async () => {
    reset()
    await startStream("/api/analyze/rebalance", {
      portfolio: {
        holdings: [
          { symbol: "BTC", amount: 0.5 },
          { symbol: "ETH", amount: 5.2 },
          { symbol: "SOL", amount: 100 },
        ],
      },
      constraints: {
        maxWeight: 0.35,
        minTradeUSD: 100,
        maxTurnoverPct: 10,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rebalance Advisor</h2>
          <p className="text-muted-foreground">AI-powered portfolio rebalancing recommendations</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleGenerate} disabled={isRunning}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {isRunning ? "Generating..." : "Generate Plan"}
        </Button>
      </div>

      <AgentStatus isRunning={isRunning} events={events} error={error} />

      {result && (
        <Card className="gradient-card border-primary/30">
          <CardHeader>
            <CardTitle>Rebalancing Plan</CardTitle>
            <CardDescription>AI-generated recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.targetWeights && (
                <div>
                  <h4 className="font-medium mb-2">Target Allocation</h4>
                  <div className="space-y-2">
                    {Object.entries(result.targetWeights).map(([symbol, weight]: [string, any]) => (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="font-medium">{symbol}</span>
                        <span className="text-primary">{(weight * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Expected Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+8.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Sharpe ratio increase</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Turnover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$4,900</div>
            <p className="text-xs text-muted-foreground mt-1">3.9% of portfolio</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estimated Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$24.50</div>
            <p className="text-xs text-muted-foreground mt-1">0.5% of trades</p>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>Risk-parity optimized rebalancing strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rebalanceActions.map((action) => (
              <div
                key={action.symbol}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">{action.symbol}</span>
                    <Badge
                      variant={
                        action.action === "Buy" ? "default" : action.action === "Sell" ? "destructive" : "secondary"
                      }
                      className={action.action === "Buy" ? "bg-success" : ""}
                    >
                      {action.action}
                    </Badge>
                    <span className="font-mono font-medium">{action.amount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.reason}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`flex items-center gap-1 font-medium ${action.percentage > 0 ? "text-success" : action.percentage < 0 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {action.percentage > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : action.percentage < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : null}
                    {action.percentage > 0 ? "+" : ""}
                    {action.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Current Allocation</CardTitle>
            <CardDescription>Before rebalancing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>BTC</span>
                <span className="font-medium">35%</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ETH</span>
                <span className="font-medium">30%</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>SOL</span>
                <span className="font-medium">20%</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>USDC</span>
                <span className="font-medium">15%</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Target Allocation
              <ArrowRight className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription>After rebalancing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>BTC</span>
                <span className="font-medium">29.5%</span>
              </div>
              <Progress value={29.5} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ETH</span>
                <span className="font-medium">30%</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>SOL</span>
                <span className="font-medium">22.8%</span>
              </div>
              <Progress value={22.8} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>USDC</span>
                <span className="font-medium">17.7%</span>
              </div>
              <Progress value={17.7} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
