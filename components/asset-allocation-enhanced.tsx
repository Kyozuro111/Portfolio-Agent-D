"use client"

import { useState } from "react"
import type React from "react"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { LayoutGrid, PieChart as PieChartIcon } from "lucide-react"

interface Holding {
  id: string
  symbol: string
  amount: string
  purchasePrice?: string
  price?: number
  value?: number
  change24h?: number
}

interface AssetAllocationEnhancedProps {
  holdings?: Holding[]
}

type ViewMode = "list" | "pie"

const CHART_COLORS = [
  "oklch(0.68 0.19 345)", // primary pink
  "oklch(0.65 0.18 145)", // success green
  "oklch(0.7 0.15 265)", // chart-3 purple
  "oklch(0.75 0.18 45)", // chart-4 yellow
  "oklch(0.6 0.16 200)", // chart-5 blue
  "oklch(0.72 0.2 345)", // primary variant
  "oklch(0.55 0.22 25)", // destructive red
]

export function AssetAllocationEnhanced({ holdings = [] }: AssetAllocationEnhancedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0)

  const allocations = holdings
    .filter((h) => h.value && h.value > 0)
    .map((h, index) => {
      const percentage = totalValue > 0 ? (h.value! / totalValue) * 100 : 0
      return {
        symbol: h.symbol,
        name: h.symbol,
        percentage: Math.round(percentage * 100) / 100, // Keep 2 decimals
        value: h.value!,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  if (allocations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        Add holdings and update prices to see allocation
      </div>
    )
  }

  const pieData = allocations.map((asset) => ({
    name: asset.symbol,
    value: asset.percentage,
    color: asset.color,
  }))

  const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
      return null
    }
    
    const data = payload[0]
    const percentage = typeof data.value === 'number' ? data.value : 0
    const assetValue = (percentage * totalValue) / 100
    
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{data.name || data.symbol || 'Unknown'}</p>
        <p className="text-sm text-muted-foreground">
          {percentage.toFixed(2)}% • ${assetValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Asset Allocation</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8"
          >
            <LayoutGrid className="h-3 w-3 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === "pie" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("pie")}
            className="h-8"
          >
            <PieChartIcon className="h-3 w-3 mr-1" />
            Chart
          </Button>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {allocations.map((asset) => (
            <div key={asset.symbol} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="font-medium">{asset.symbol}</span>
                  <span className="text-muted-foreground">{asset.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="font-medium">{asset.percentage.toFixed(2)}%</span>
                </div>
              </div>
              <Progress value={asset.percentage} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Pie Chart View */}
      {viewMode === "pie" && (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {allocations.slice(0, 6).map((asset) => (
              <div key={asset.symbol} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }} />
                <span className="text-muted-foreground">{asset.symbol}</span>
                <span className="font-medium">{asset.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
