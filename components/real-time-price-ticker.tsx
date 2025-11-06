"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RealTimePriceTickerProps {
  holdings: Array<{
    symbol: string
    price?: number
    change24h?: number
    value?: number
  }>
}

export function RealTimePriceTicker({ holdings }: RealTimePriceTickerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const topHoldings = holdings
    .filter((h) => h.price && h.value)
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 5)

  if (topHoldings.length === 0) {
    return null
  }

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Real-time Prices
            </CardTitle>
            <CardDescription className="text-xs">Top holdings live prices</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs border-success/50 text-success">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topHoldings.map((holding) => (
            <div
              key={holding.symbol}
              className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-background/50 hover:bg-background/70 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{holding.symbol}</span>
                  {holding.price && (
                    <span className="text-xs text-muted-foreground">
                      ${holding.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {holding.change24h !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      holding.change24h >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {holding.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {holding.change24h >= 0 ? "+" : ""}
                    {holding.change24h.toFixed(2)}%
                  </div>
                )}
                {holding.value && (
                  <div className="text-xs text-muted-foreground">
                    ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground text-center">
          Auto-refreshes every 30 seconds
        </div>
      </CardContent>
    </Card>
  )
}
