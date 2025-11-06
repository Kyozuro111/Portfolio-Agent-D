"use client"

import { Progress } from "@/components/ui/progress"

interface Holding {
  id: string
  symbol: string
  amount: string
  purchasePrice?: string
  price?: number
  value?: number
  change24h?: number
}

interface AssetAllocationProps {
  holdings?: Holding[]
}

export function AssetAllocation({ holdings = [] }: AssetAllocationProps) {
  const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0)

  console.log("[portfolio-agent] AssetAllocation rendering with", holdings.length, "holdings, total value:", totalValue)

  const allocations = holdings
    .filter((h) => h.value && h.value > 0)
    .map((h, index) => {
      const percentage = totalValue > 0 ? (h.value! / totalValue) * 100 : 0
      console.log(`[portfolio-agent] ${h.symbol}: $${h.value} = ${percentage.toFixed(2)}%`)
      return {
        symbol: h.symbol,
        name: h.symbol,
        percentage: Math.round(percentage),
        value: `$${h.value!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        color: `bg-chart-${(index % 5) + 1}` as const,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  // Show message if no data
  if (allocations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        Add holdings and update prices to see allocation
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {allocations.map((asset) => (
        <div key={asset.symbol} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${asset.color}`} />
              <span className="font-medium">{asset.symbol}</span>
              <span className="text-muted-foreground">{asset.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{asset.value}</span>
              <span className="font-medium">{asset.percentage}%</span>
            </div>
          </div>
          <Progress value={asset.percentage} className="h-2" />
        </div>
      ))}
    </div>
  )
}
