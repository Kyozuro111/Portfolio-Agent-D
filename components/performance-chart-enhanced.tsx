"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download, TrendingUp, TrendingDown } from "lucide-react"
import { SkeletonChart } from "@/components/ui/skeleton"

type TimeRange = "1D" | "7D" | "30D" | "90D" | "1Y" | "All"

interface PerformanceChartEnhancedProps {
  result?: any
  holdings?: Array<{ symbol: string; amount: string | number }>
  benchmark?: "BTC" | "ETH" | "NONE"
}

export function PerformanceChartEnhanced({ result, holdings, benchmark = "NONE" }: PerformanceChartEnhancedProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("90D")
  const [loading, setLoading] = useState(false)

  const { chartData, maxDrawdownDate, benchmarkData } = useMemo(() => {
    const historyData = result?.fetch_history?.data || result?.history?.data || result?.fetch_history

    if (!historyData || !holdings || holdings.length === 0) {
      return { chartData: [], maxDrawdownDate: null, benchmarkData: [] }
    }

    const holdingsMap = new Map(
      holdings.map((h) => [h.symbol, typeof h.amount === "string" ? Number.parseFloat(h.amount) : h.amount]),
    )

    const firstAsset = Object.keys(historyData)[0]
    if (!firstAsset || !historyData[firstAsset]?.t || !historyData[firstAsset]?.p) {
      return { chartData: [], maxDrawdownDate: null, benchmarkData: [] }
    }

    const timestamps = historyData[firstAsset].t

    // Calculate data points based on time range
    let dataPoints = timestamps.length
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    switch (timeRange) {
      case "1D":
        dataPoints = Math.min(24, timestamps.length) // Last 24 hours
        break
      case "7D":
        dataPoints = Math.min(7, timestamps.length)
        break
      case "30D":
        dataPoints = Math.min(30, timestamps.length)
        break
      case "90D":
        dataPoints = Math.min(90, timestamps.length)
        break
      case "1Y":
        dataPoints = Math.min(365, timestamps.length)
        break
      case "All":
        dataPoints = timestamps.length
        break
    }

    const startIndex = Math.max(0, timestamps.length - dataPoints)
    const data = timestamps.slice(startIndex).map((timestamp: number, relativeIndex: number) => {
      const absoluteIndex = startIndex + relativeIndex
      let totalValue = 0

      Object.keys(historyData).forEach((symbol) => {
        const assetData = historyData[symbol]
        const holdingAmount = holdingsMap.get(symbol) || 0

        if (assetData?.p && assetData.p[absoluteIndex] !== undefined && holdingAmount > 0) {
          totalValue += assetData.p[absoluteIndex] * holdingAmount
        }
      })

      const date = new Date(timestamp)
      const point: any = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        timestamp,
        value: Math.round(totalValue),
      }

      // Add benchmark data if selected
      if (benchmark !== "NONE" && historyData[benchmark]?.p && historyData[benchmark].p[absoluteIndex]) {
        const benchmarkPrice = historyData[benchmark].p[absoluteIndex]
        point[`benchmark_${benchmark}`] = benchmarkPrice
      }

      return point
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

    // Calculate benchmark data for comparison
    const bmData =
      benchmark !== "NONE" && historyData[benchmark]?.p
        ? timestamps.slice(startIndex).map((timestamp: number, relativeIndex: number) => {
            const absoluteIndex = startIndex + relativeIndex
            const price = historyData[benchmark].p[absoluteIndex]
            const startPrice = historyData[benchmark].p[startIndex] || price
            const normalizedValue = (price / startPrice) * (data[0]?.value || 1)
            return normalizedValue
          })
        : []

    return { chartData: data, maxDrawdownDate: maxDDDate, benchmarkData: bmData }
  }, [result, holdings, timeRange, benchmark])

  const handleExport = () => {
    if (!chartData.length) return

    const csv = [
      ["Date", "Portfolio Value", benchmark !== "NONE" ? `Benchmark (${benchmark})` : ""].join(","),
      ...chartData.map((d) => [
        d.date,
        d.value,
        benchmark !== "NONE" ? d[`benchmark_${benchmark}`] || "" : "",
      ]).join("\n"),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `portfolio-performance-${timeRange.toLowerCase()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <SkeletonChart />
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
        <Calendar className="h-12 w-12 opacity-50" />
        <p>Run analysis to see performance history</p>
      </div>
    )
  }

  const totalReturn = chartData.length > 0
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100
    : 0

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {(["1D", "7D", "30D", "90D", "1Y", "All"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-primary hover:bg-primary/90" : ""}
            >
              {range}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {totalReturn !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${totalReturn >= 0 ? "text-success" : "text-destructive"}`}>
              {totalReturn >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {totalReturn >= 0 ? "+" : ""}
              {totalReturn.toFixed(2)}%
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.72 0.2 345)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.72 0.2 345)" stopOpacity={0} />
            </linearGradient>
            {benchmark !== "NONE" && (
              <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0} />
              </linearGradient>
            )}
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
            formatter={(value: any) => `$${value.toLocaleString()}`}
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
          <Area
            type="monotone"
            dataKey="value"
            stroke="oklch(0.72 0.2 345)"
            fill="url(#colorValue)"
            strokeWidth={2}
            name="Portfolio"
          />
          {benchmark !== "NONE" && (
            <Area
              type="monotone"
              dataKey={`benchmark_${benchmark}`}
              stroke="oklch(0.65 0.18 145)"
              fill="url(#colorBenchmark)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              name={`Benchmark (${benchmark})`}
              opacity={0.6}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
