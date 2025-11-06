"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react"

interface PerformanceAttributionProps {
  holdings: Array<{
    symbol: string
    amount: string
    purchasePrice?: string
    price?: number
    value?: number
  }>
  totalValue?: number
}

export function PerformanceAttribution({ holdings, totalValue = 0 }: PerformanceAttributionProps) {
  const attributionData = useMemo(() => {
    if (totalValue === 0) return []

    return holdings
      .filter((h) => h.purchasePrice && h.price && h.value)
      .map((h) => {
        const purchasePrice = Number.parseFloat(h.purchasePrice || "0")
        const currentPrice = h.price || 0
        const amount = Number.parseFloat(h.amount)
        const costBasis = purchasePrice * amount
        const currentValue = h.value || 0
        const profitLoss = currentValue - costBasis
        const profitLossPct = purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0
        const contribution = totalValue > 0 ? (profitLoss / totalValue) * 100 : 0

        return {
          symbol: h.symbol,
          profitLoss,
          profitLossPct,
          contribution,
          currentValue,
          costBasis,
          amount,
        }
      })
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
  }, [holdings, totalValue])

  const totalPnL = attributionData.reduce((sum, item) => sum + item.profitLoss, 0)
  const topPerformer = attributionData.length > 0 ? attributionData[0] : null
  const worstPerformer =
    attributionData.length > 0 ? attributionData[attributionData.length - 1] : null

  if (attributionData.length === 0 || totalValue === 0) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Performance Attribution
          </CardTitle>
          <CardDescription>Which assets contributed most to your returns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add purchase prices to see performance attribution</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = attributionData.slice(0, 5).map((item) => ({
    name: item.symbol,
    contribution: item.contribution,
    profitLoss: item.profitLoss,
    value: Math.abs(item.contribution),
  }))

  const COLORS = [
    "oklch(0.65 0.18 145)", // success green
    "oklch(0.72 0.2 345)", // primary pink
    "oklch(0.55 0.22 25)", // destructive red
    "oklch(0.7 0.15 265)", // purple
    "oklch(0.75 0.18 45)", // yellow
  ]

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Performance Attribution
        </CardTitle>
        <CardDescription>Which assets contributed most to your portfolio returns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Total P/L</div>
            <div
              className={`text-2xl font-bold flex items-center gap-1 ${
                totalPnL >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {totalPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              ${totalPnL >= 0 ? "+" : ""}
              {totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          {topPerformer && (
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Top Performer</div>
              <div className="text-lg font-bold">{topPerformer.symbol}</div>
              <div className="text-xs text-success mt-1">
                +{topPerformer.contribution.toFixed(2)}% contribution
              </div>
            </div>
          )}
          {worstPerformer && worstPerformer.contribution < 0 && (
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Worst Performer</div>
              <div className="text-lg font-bold">{worstPerformer.symbol}</div>
              <div className="text-xs text-destructive mt-1">
                {worstPerformer.contribution.toFixed(2)}% contribution
              </div>
            </div>
          )}
        </div>

        {/* Contribution Chart */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Contribution to Total Return</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.01 280)",
                  border: "1px solid oklch(0.22 0.01 280)",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => `${value.toFixed(2)}%`}
              />
              <Bar dataKey="contribution" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.contribution >= 0 ? COLORS[0] : COLORS[2]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Asset Breakdown</h4>
          <div className="space-y-2">
            {attributionData.slice(0, 5).map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      item.contribution >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {item.contribution >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.profitLossPct >= 0 ? "+" : ""}
                        {item.profitLossPct.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ${item.profitLoss >= 0 ? "+" : ""}
                      {item.profitLoss.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      • {item.contribution >= 0 ? "+" : ""}
                      {item.contribution.toFixed(2)}% contribution
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
