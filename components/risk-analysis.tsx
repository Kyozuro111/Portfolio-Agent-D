"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, TrendingDown, Shield, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function RiskAnalysis() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Risk Analysis</h2>
          <p className="text-muted-foreground">Comprehensive risk metrics and portfolio health assessment</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Activity className="mr-2 h-4 w-4" />
          Run Analysis
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Sharpe Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.18</div>
            <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return</p>
            <Progress value={59} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Max Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">-18.7%</div>
            <p className="text-xs text-muted-foreground mt-1">Largest peak-to-trough decline</p>
            <Progress value={18.7} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-3" />
              Volatility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42.1%</div>
            <p className="text-xs text-muted-foreground mt-1">Annualized standard deviation</p>
            <Progress value={42.1} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>90-day rolling window analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sortino Ratio</span>
              <span className="font-mono font-medium">1.64</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Beta vs BTC</span>
              <span className="font-mono font-medium">0.87</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Value at Risk (95%)</span>
              <span className="font-mono font-medium text-destructive">-5.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conditional VaR (95%)</span>
              <span className="font-mono font-medium text-destructive">-7.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>Risk policy violations and warnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm">High Concentration Risk</div>
                <p className="text-xs text-muted-foreground mt-1">BTC allocation exceeds 35% threshold</p>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
              <AlertCircle className="h-5 w-5 text-chart-4 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm">Low Stable Allocation</div>
                <p className="text-xs text-muted-foreground mt-1">Stablecoin percentage below 20% minimum</p>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Correlation Matrix</CardTitle>
          <CardDescription>Asset correlation analysis for diversification insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium">Asset</th>
                  <th className="text-center p-2 font-medium">BTC</th>
                  <th className="text-center p-2 font-medium">ETH</th>
                  <th className="text-center p-2 font-medium">SOL</th>
                  <th className="text-center p-2 font-medium">USDC</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-2 font-medium">BTC</td>
                  <td className="text-center p-2 font-mono">1.00</td>
                  <td className="text-center p-2 font-mono">0.78</td>
                  <td className="text-center p-2 font-mono">0.65</td>
                  <td className="text-center p-2 font-mono">-0.12</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-2 font-medium">ETH</td>
                  <td className="text-center p-2 font-mono">0.78</td>
                  <td className="text-center p-2 font-mono">1.00</td>
                  <td className="text-center p-2 font-mono">0.72</td>
                  <td className="text-center p-2 font-mono">-0.08</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-2 font-medium">SOL</td>
                  <td className="text-center p-2 font-mono">0.65</td>
                  <td className="text-center p-2 font-mono">0.72</td>
                  <td className="text-center p-2 font-mono">1.00</td>
                  <td className="text-center p-2 font-mono">-0.15</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">USDC</td>
                  <td className="text-center p-2 font-mono">-0.12</td>
                  <td className="text-center p-2 font-mono">-0.08</td>
                  <td className="text-center p-2 font-mono">-0.15</td>
                  <td className="text-center p-2 font-mono">1.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
