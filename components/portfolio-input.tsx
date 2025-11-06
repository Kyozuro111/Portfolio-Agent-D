"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Loader2,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Coins,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Holding {
  id: string
  symbol: string
  amount: string
  purchasePrice?: string
  purchaseDate?: string
  saleDate?: string
  salePrice?: string
  amountSold?: string
  chain?: string
  price?: number
  value?: number
  change24h?: number
  profitLoss?: number
  profitLossPct?: number
}

interface PortfolioInputProps {
  holdings: Holding[]
  onChange: (holdings: Holding[]) => void
}

export function PortfolioInput({ holdings, onChange }: PortfolioInputProps) {
  const { toast } = useToast()
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [totalValue, setTotalValue] = useState(0)
  const [totalProfitLoss, setTotalProfitLoss] = useState(0)
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())

  const toggleSaleInfo = (id: string) => {
    setExpandedSales((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const fetchPrices = async () => {
    if (holdings.length === 0) return

    setLoadingPrices(true)
    try {
      const symbols = holdings.filter((h) => h.symbol).map((h) => h.symbol)
      if (symbols.length === 0) return

      console.log("[portfolio-agent] Fetching prices for:", symbols.join(", "))
      const response = await fetch(`/api/prices?symbols=${symbols.join(",")}&userId=default`)

      if (response.ok) {
        const data = await response.json()
        console.log("[portfolio-agent] Received price data for", Object.keys(data.prices || {}).length, "assets")

        const updatedHoldings = holdings.map((h) => {
          const priceData = data.prices?.[h.symbol]
          if (priceData) {
            const amount = Number.parseFloat(h.amount) || 0
            const currentValue = amount * priceData.usd
            const purchasePrice = Number.parseFloat(h.purchasePrice || "0")
            const costBasis = amount * purchasePrice
            const profitLoss = purchasePrice > 0 ? currentValue - costBasis : undefined
            const profitLossPct =
              purchasePrice > 0 && costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : undefined

            return {
              ...h,
              price: priceData.usd,
              value: currentValue,
              change24h: priceData.usd_24h_change,
              profitLoss,
              profitLossPct,
            }
          }
          return h
        })
        onChange(updatedHoldings)

        const total = updatedHoldings.reduce((sum, h) => sum + (h.value || 0), 0)
        const totalPL = updatedHoldings.reduce((sum, h) => sum + (h.profitLoss || 0), 0)
        setTotalValue(total)
        setTotalProfitLoss(totalPL)

        toast({
          title: "Prices updated",
          description: "Real-time prices fetched successfully",
        })
      }
    } catch (error) {
      console.error("[portfolio-agent] Failed to fetch prices:", error)
      toast({
        title: "Price fetch failed",
        description: "Could not fetch real-time prices",
        variant: "destructive",
      })
    } finally {
      setLoadingPrices(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchPrices, 500)
    return () => clearTimeout(timer)
  }, [holdings.map((h) => `${h.symbol}-${h.amount}`).join(",")])

  const addHolding = () => {
    const newHolding: Holding = {
      id: Date.now().toString(),
      symbol: "",
      amount: "",
      purchasePrice: "",
      purchaseDate: new Date().toISOString().split("T")[0],
    }
    onChange([...holdings, newHolding])
  }

  const removeHolding = (id: string) => {
    const holding = holdings.find((h) => h.id === id)
    onChange(holdings.filter((h) => h.id !== id))
    toast({
      title: "Asset removed",
      description: `${holding?.symbol || "Asset"} removed from portfolio`,
      variant: "destructive",
    })
  }

  const updateHolding = (id: string, field: keyof Holding, value: string) => {
    onChange(holdings.map((h) => (h.id === id ? { ...h, [field]: value } : h)))
  }

  const validHoldings = holdings.filter((h) => h.symbol && Number.parseFloat(h.amount) > 0)

  return (
    <div className="space-y-6">
      {validHoldings.length > 0 && (
        <div className="relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 shadow-lg animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent animate-pulse-slow" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
              </div>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                {loadingPrices && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>
              {totalProfitLoss !== 0 && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    totalProfitLoss >= 0
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-destructive/20 text-destructive border border-destructive/30"
                  } animate-fade-in`}
                >
                  {totalProfitLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-semibold text-sm">
                    {totalProfitLoss >= 0 ? "+" : ""}$
                    {Math.abs(totalProfitLoss).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-xs opacity-80">Total P/L</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 items-end">
              <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-background/50 backdrop-blur-sm">
                {validHoldings.length} {validHoldings.length === 1 ? "asset" : "assets"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPrices}
                disabled={loadingPrices}
                className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-primary/30"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPrices ? "animate-spin" : ""}`} />
                Update Prices
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {holdings.map((holding, index) => (
          <div
            key={holding.id}
            className="group relative rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg transition-all duration-300 animate-slide-in overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Purchase Information
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`symbol-${holding.id}`} className="text-xs font-medium text-muted-foreground">
                          Symbol *
                        </Label>
                        <div className="relative group/input">
                          <Input
                            id={`symbol-${holding.id}`}
                            placeholder="BTC, ETH, SOL..."
                            value={holding.symbol}
                            onChange={(e) => updateHolding(holding.id, "symbol", e.target.value.toUpperCase())}
                            className="pr-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover/input:text-primary transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${holding.id}`} className="text-xs font-medium text-muted-foreground">
                          Amount *
                        </Label>
                        <Input
                          id={`amount-${holding.id}`}
                          type="number"
                          step="any"
                          placeholder="0.00"
                          value={holding.amount}
                          onChange={(e) => updateHolding(holding.id, "amount", e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`purchase-price-${holding.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Purchase Price
                        </Label>
                        <div className="relative group/input">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover/input:text-primary transition-colors" />
                          <Input
                            id={`purchase-price-${holding.id}`}
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={holding.purchasePrice || ""}
                            onChange={(e) => updateHolding(holding.id, "purchasePrice", e.target.value)}
                            className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`purchase-date-${holding.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Purchase Date
                        </Label>
                        <div className="relative group/input">
                          <Input
                            id={`purchase-date-${holding.id}`}
                            type="date"
                            value={holding.purchaseDate || ""}
                            onChange={(e) => updateHolding(holding.id, "purchaseDate", e.target.value)}
                            className="pr-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-hover/input:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Collapsible open={expandedSales.has(holding.id)} onOpenChange={() => toggleSaleInfo(holding.id)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 w-full justify-start gap-2 rounded-lg transition-all"
                      >
                        {expandedSales.has(holding.id) ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                        Sale Information (Optional)
                        {(holding.saleDate || holding.salePrice || holding.amountSold) && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            Added
                          </Badge>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-5 border-l-2 border-primary/20">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`sale-date-${holding.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Sale Date
                          </Label>
                          <div className="relative group/input">
                            <Input
                              id={`sale-date-${holding.id}`}
                              type="date"
                              value={holding.saleDate || ""}
                              onChange={(e) => updateHolding(holding.id, "saleDate", e.target.value)}
                              className="pr-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-hover/input:text-primary transition-colors" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`sale-price-${holding.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Sale Price
                          </Label>
                          <div className="relative group/input">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover/input:text-primary transition-colors" />
                            <Input
                              id={`sale-price-${holding.id}`}
                              type="number"
                              step="any"
                              placeholder="0.00"
                              value={holding.salePrice || ""}
                              onChange={(e) => updateHolding(holding.id, "salePrice", e.target.value)}
                              className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`amount-sold-${holding.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Amount Sold
                          </Label>
                          <Input
                            id={`amount-sold-${holding.id}`}
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={holding.amountSold || ""}
                            onChange={(e) => updateHolding(holding.id, "amountSold", e.target.value)}
                            className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {holding.price && holding.value && (
                  <div className="hidden lg:flex flex-col items-end justify-center min-w-[180px] p-4 rounded-lg bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 animate-fade-in">
                    <div className="text-lg font-bold">
                      ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      @ $
                      {holding.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                    {holding.change24h !== undefined && (
                      <div
                        className={`flex items-center gap-1 text-xs mt-2 px-2 py-1 rounded-full ${
                          holding.change24h >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {holding.change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(holding.change24h).toFixed(2)}% (24h)
                      </div>
                    )}
                    {holding.profitLoss !== undefined && (
                      <div className="mt-3 pt-3 border-t border-border/50 w-full">
                        <div
                          className={`flex flex-col items-end gap-1 ${holding.profitLoss >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          <span className="text-sm font-semibold">
                            {holding.profitLoss >= 0 ? "+" : ""}${Math.abs(holding.profitLoss).toFixed(2)}
                          </span>
                          {holding.profitLossPct !== undefined && (
                            <span className="text-xs opacity-80">
                              ({holding.profitLossPct >= 0 ? "+" : ""}
                              {holding.profitLossPct.toFixed(2)}%)
                            </span>
                          )}
                          <span className="text-xs opacity-60">P/L</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHolding(holding.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={addHolding}
          className="gap-2 bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
        <div className="flex gap-2">
          {validHoldings.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-success/10 text-success border-success/30 px-4 py-1.5 animate-pulse-glow"
            >
              Ready to analyze
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
