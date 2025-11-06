"use client"

import { Button } from "@/components/ui/button"
import { Download, FileJson, FileSpreadsheet } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ExportPortfolioProps {
  holdings: Array<{
    id: string
    symbol: string
    amount: string
    purchasePrice?: string
    purchaseDate?: string
    price?: number
    value?: number
    change24h?: number
  }>
  result?: any
  totalValue?: number
}

export function ExportPortfolio({ holdings, result, totalValue = 0 }: ExportPortfolioProps) {
  const { toast } = useToast()

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      portfolio: {
        totalValue,
        holdings: holdings.map((h) => ({
          symbol: h.symbol,
          amount: h.amount,
          purchasePrice: h.purchasePrice,
          purchaseDate: h.purchaseDate,
          currentPrice: h.price,
          value: h.value,
          change24h: h.change24h,
        })),
      },
      analysis: result
        ? {
            health: result.compute_health,
            risk: result.compute_risk,
            recommendations: result.recommendations,
            alerts: result.check_alerts,
          }
        : null,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Portfolio Exported",
      description: "Portfolio data exported as JSON",
    })
  }

  const exportToCSV = () => {
    const headers = ["Symbol", "Amount", "Purchase Price", "Purchase Date", "Current Price", "Value", "24h Change"]
    const rows = holdings.map((h) => [
      h.symbol,
      h.amount,
      h.purchasePrice || "",
      h.purchaseDate || "",
      h.price?.toFixed(2) || "",
      h.value?.toFixed(2) || "",
      h.change24h ? `${h.change24h > 0 ? "+" : ""}${h.change24h.toFixed(2)}%` : "",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Portfolio Exported",
      description: "Portfolio data exported as CSV",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
