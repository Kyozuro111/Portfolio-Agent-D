"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Shield, Target, Activity, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AnalysisResultsProps {
  result: any
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  if (!result) return null

  const riskMetrics = result.compute_risk
  const healthScores = result.compute_health
  const alerts = result.check_alerts || []
  const insights = result.llm_insights?.insights || []

  return (
    <div className="space-y-6 animate-slide-in-up">
      <Card className="gradient-card border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Analysis Results
          </CardTitle>
          <CardDescription>AI-powered portfolio insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Metrics */}
          {riskMetrics && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Risk Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 animate-scale-in">
                  <div className="text-xs text-muted-foreground mb-1">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-primary animate-number-pop">{riskMetrics.sharpe || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Risk-adjusted return</div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border animate-scale-in cursor-help"
                        style={{ animationDelay: "0.1s" }}
                      >
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <span>Volatility</span>
                          <Info className="h-3 w-3" />
                        </div>
                        <div className="text-2xl font-bold animate-number-pop">{riskMetrics.volPct || 0}%</div>
                        <div className="text-xs text-muted-foreground mt-1">Annual volatility</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-4" side="bottom">
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Annualized Volatility Calculation</p>
                        <div className="text-xs space-y-1">
                          <p>
                            <strong>Formula:</strong> Daily Std Dev × √252
                          </p>
                          <p>
                            <strong>Sample:</strong> {riskMetrics.windowDays || 90} days of price data
                          </p>
                          <p>
                            <strong>Why it's large:</strong> Annualization multiplies daily volatility by ~15.87 (√252)
                            to project yearly risk
                          </p>
                          <p className="text-muted-foreground mt-2">
                            Example: 8.4% daily volatility → 133% annualized (8.4% × 15.87)
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div
                  className="p-4 rounded-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20 animate-scale-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="text-xs text-muted-foreground mb-1">Max Drawdown</div>
                  <div className="text-2xl font-bold text-destructive animate-number-pop">
                    {riskMetrics.maxDDPct || 0}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Worst decline</div>
                </div>
                <div
                  className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 animate-scale-in"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="text-xs text-muted-foreground mb-1">Beta vs BTC</div>
                  <div className="text-2xl font-bold text-accent animate-number-pop">{riskMetrics.betaBTC || 1}</div>
                  <div className="text-xs text-muted-foreground mt-1">Market correlation</div>
                </div>
              </div>
            </div>
          )}

          {/* Health Scores */}
          {healthScores && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                Health Scores
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20 animate-scale-in">
                  <div className="text-xs text-muted-foreground mb-2">Overall Health</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <div className="text-3xl font-bold text-success animate-number-pop">{healthScores.health || 0}</div>
                    <div className="text-lg text-muted-foreground">/100</div>
                  </div>
                  <Progress value={healthScores.health || 0} className="h-2" />
                </div>
                <div
                  className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 animate-scale-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="text-xs text-muted-foreground mb-2">Diversification</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <div className="text-3xl font-bold text-primary animate-number-pop">
                      {healthScores.diversification || 0}
                    </div>
                    <div className="text-lg text-muted-foreground">/100</div>
                  </div>
                  <Progress value={healthScores.diversification || 0} className="h-2" />
                </div>
                <div
                  className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 animate-scale-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="text-xs text-muted-foreground mb-2">Momentum</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <div className="text-3xl font-bold text-accent animate-number-pop">
                      {healthScores.momentum || 0}
                    </div>
                    <div className="text-lg text-muted-foreground">/100</div>
                  </div>
                  <Progress value={healthScores.momentum || 0} className="h-2" />
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Active Alerts ({alerts.length})
              </h4>
              <div className="space-y-2">
                {alerts.map((alert: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border animate-slide-in ${
                      alert.level === "critical"
                        ? "bg-destructive/10 border-destructive/30"
                        : alert.level === "warning"
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : "bg-primary/10 border-primary/30"
                    }`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 ${
                          alert.level === "critical"
                            ? "text-destructive"
                            : alert.level === "warning"
                              ? "text-yellow-500"
                              : "text-primary"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{alert.code}</span>
                          <Badge variant={alert.level === "critical" ? "destructive" : "secondary"} className="text-xs">
                            {alert.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                AI Insights
              </h4>
              <div className="space-y-2">
                {insights.map((insight: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 animate-slide-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
