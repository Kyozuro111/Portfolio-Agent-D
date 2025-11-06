"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import { useMemo } from "react"

interface PerformanceChartProps {
  result?: any
  holdings?: Array<{ symbol: string; amount: string | number }>
}

export function PerformanceChart({ result, holdings }: PerformanceChartProps) {
  const { chartData, maxDrawdownDate } = useMemo(() => {
    const historyData = result?.fetch_history?.data || result?.history?.data || result?.fetch_history

    console.log("[portfolio-agent] PerformanceChart - result exists:", !!result)
    console.log("[portfolio-agent] PerformanceChart - holdings:", holdings?.length || 0, "assets")
    console.log("[portfolio-agent] PerformanceChart - historyData exists:", !!historyData)

    if (historyData) {
      console.log("[portfolio-agent] PerformanceChart - historyData keys:", Object.keys(historyData))
      const firstKey = Object.keys(historyData)[0]
      if (firstKey) {
        console.log("[portfolio-agent] PerformanceChart - First asset structure:", {
          symbol: firstKey,
          hasT: !!historyData[firstKey]?.t,
          hasP: !!historyData[firstKey]?.p,
          tLength: historyData[firstKey]?.t?.length,
          pLength: historyData[firstKey]?.p?.length,
        })
      }
    }

    if (!historyData || !holdings || holdings.length === 0) {
      console.log("[portfolio-agent] PerformanceChart - Missing data, showing empty state")
      return { chartData: [], maxDrawdownDate: null }
    }

    // Create a map of holdings for quick lookup
    const holdingsMap = new Map(
      holdings.map((h) => [h.symbol, typeof h.amount === "string" ? Number.parseFloat(h.amount) : h.amount]),
    )

    console.log("[portfolio-agent] PerformanceChart - Holdings map:", Array.from(holdingsMap.entries()))

    // Get the first asset's timestamps as reference
    const firstAsset = Object.keys(historyData)[0]
    if (!firstAsset || !historyData[firstAsset]?.t || !historyData[firstAsset]?.p) {
      console.log("[portfolio-agent] PerformanceChart - Invalid history data structure", {
        firstAsset,
        hasFirstAsset: !!firstAsset,
        hasT: !!historyData[firstAsset]?.t,
        hasP: !!historyData[firstAsset]?.p,
      })
      return { chartData: [], maxDrawdownDate: null }
    }

    const timestamps = historyData[firstAsset].t
    const dataPoints = Math.min(timestamps.length, 90) // Last 90 days

    console.log("[portfolio-agent] PerformanceChart - Processing", dataPoints, "data points")

    const startIndex = Math.max(0, timestamps.length - dataPoints)
    const data = timestamps.slice(startIndex).map((timestamp: number, relativeIndex: number) => {
      const absoluteIndex = startIndex + relativeIndex
      let totalValue = 0

      // Sum up all assets' values at this timestamp
      Object.keys(historyData).forEach((symbol) => {
        const assetData = historyData[symbol]
        const holdingAmount = holdingsMap.get(symbol) || 0

        if (assetData?.p && assetData.p[absoluteIndex] !== undefined && holdingAmount > 0) {
          totalValue += assetData.p[absoluteIndex] * holdingAmount
        }
      })

      const date = new Date(timestamp)
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        timestamp,
        value: Math.round(totalValue),
      }
    })

    // Calculate max drawdown
    let maxDrawdown = 0
    let maxDrawdownIdx = 0
    let peak = data[0]?.value || 0

    data.forEach((point, idx) => {
      if (point.value > peak) {
        peak = point.value
      }
      const drawdown = ((peak - point.value) / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownIdx = idx
      }
    })

    const maxDDDate = maxDrawdown > 0 ? data[maxDrawdownIdx]?.date : null

    console.log("[portfolio-agent] PerformanceChart - Generated", data.length, "chart points")
    console.log("[portfolio-agent] PerformanceChart - Max drawdown:", maxDrawdown.toFixed(2) + "%", "at", maxDDDate)

    return { chartData: data, maxDrawdownDate: maxDDDate }
  }, [result, holdings])

  // Show message if no data
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        Run analysis to see performance history
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.72 0.2 345)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.72 0.2 345)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 280)" />
        <XAxis dataKey="date" stroke="oklch(0.6 0.01 280)" fontSize={12} />
        <YAxis stroke="oklch(0.6 0.01 280)" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.16 0.01 280)",
            border: "1px solid oklch(0.22 0.01 280)",
            borderRadius: "8px",
          }}
        />
        {maxDrawdownDate && (
          <ReferenceLine
            x={maxDrawdownDate}
            stroke="oklch(0.6 0.2 25)"
            strokeDasharray="3 3"
            label={{
              value: "Max Drawdown",
              position: "top",
              fill: "oklch(0.6 0.2 25)",
              fontSize: 11,
            }}
          />
        )}
        <Area type="monotone" dataKey="value" stroke="oklch(0.72 0.2 345)" fill="url(#colorValue)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
