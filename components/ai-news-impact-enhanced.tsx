"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Filter,
  X,
  Search,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NewsItem {
  title: string
  url: string
  symbols: string[]
  sentiment: number
  summary: string
  source: string
  timestamp: string
  impact: "critical" | "high" | "medium" | "low"
  impactScore: number
}

interface AINewsImpactEnhancedProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number }>
}

export function AINewsImpactEnhanced({ holdings = [] }: AINewsImpactEnhancedProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [symbolFilter, setSymbolFilter] = useState<string>("all")
  const [impactFilter, setImpactFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  const portfolioSymbols = holdings.map((h) => h.symbol.toUpperCase())

  const fetchNews = async () => {
    // Only fetch on client side
    if (typeof window === "undefined") return
    if (portfolioSymbols.length === 0) {
      setNews([])
      setFilteredNews([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: portfolioSymbols, lookbackDays: 7 }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch news")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let newsOutput: any = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6))
              if (event.type === "complete" && event.data) {
                newsOutput = event.data
              }
            } catch (e) {
              console.error("[portfolio-agent] Failed to parse event:", e)
            }
          }
        }
      }

      if (newsOutput && newsOutput.items) {
        const newsItems: NewsItem[] = newsOutput.items
          .filter((item: any) => {
            return item.symbols.some((symbol: string) => portfolioSymbols.includes(symbol.toUpperCase()))
          })
          .slice(0, 20)
          .map((item: any) => {
            const sentimentScore = item.sentiment || 0.5
            const isExtremeSentiment = sentimentScore > 0.7 || sentimentScore < 0.3
            const impactScore = Math.round(50 + (sentimentScore - 0.5) * 60 + (isExtremeSentiment ? 20 : 0))

            let impact: "critical" | "high" | "medium" | "low" = "low"
            if (impactScore >= 85) impact = "critical"
            else if (impactScore >= 70) impact = "high"
            else if (impactScore >= 55) impact = "medium"

            return {
              title: item.title || "No title",
              url: item.url || "#",
              symbols: item.symbols || [],
              sentiment: sentimentScore,
              summary: item.summary || item.snippet || "",
              source: item.source || "Unknown",
              timestamp: item.publishedAt || (typeof window !== "undefined" ? new Date().toISOString() : ""),
              impact,
              impactScore,
            }
          })
          .sort((a: NewsItem, b: NewsItem) => b.impactScore - a.impactScore)

        setNews(newsItems)
        setFilteredNews(newsItems)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("[portfolio-agent] Failed to fetch news:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [portfolioSymbols.join(",")])

  // Apply filters
  useEffect(() => {
    let filtered = [...news]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.symbols.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Symbol filter
    if (symbolFilter !== "all") {
      filtered = filtered.filter((item) => item.symbols.includes(symbolFilter))
    }

    // Impact filter
    if (impactFilter !== "all") {
      filtered = filtered.filter((item) => item.impact === impactFilter)
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((item) => item.source.toLowerCase().includes(sourceFilter.toLowerCase()))
    }

    setFilteredNews(filtered)
  }, [searchQuery, symbolFilter, impactFilter, sourceFilter, news])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/50"
      case "high":
        return "bg-orange-500/20 text-orange-500 border-orange-500/50"
      case "medium":
        return "bg-chart-4/20 text-chart-4 border-chart-4/50"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.6) return <TrendingUp className="h-4 w-4 text-success" />
    if (sentiment < 0.4) return <TrendingDown className="h-4 w-4 text-destructive" />
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />
  }

  const uniqueSymbols = Array.from(
    new Set(
      news.flatMap((item) => item.symbols).filter((s) => s && typeof s === "string" && s.trim() !== "")
    )
  ).sort()
  const uniqueSources = Array.from(
    new Set(news.map((item) => item.source).filter((s) => s && typeof s === "string" && s.trim() !== ""))
  ).sort()

  return (
    <>
      <Card className="gradient-card border-border/50" data-section="news">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                AI News Impact Analyzer
              </CardTitle>
              <CardDescription>Real-time news with AI-analyzed portfolio impact</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={fetchNews} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={symbolFilter} onValueChange={setSymbolFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Symbols" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Symbols</SelectItem>
                {uniqueSymbols.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Impact Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impact Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear filters */}
          {(searchQuery || symbolFilter !== "all" || impactFilter !== "all" || sourceFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSymbolFilter("all")
                setImpactFilter("all")
                setSourceFilter("all")
              }}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}

          {/* News List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No news found matching your filters.</p>
              {news.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setSearchQuery("")
                  setSymbolFilter("all")
                  setImpactFilter("all")
                  setSourceFilter("all")
                }} className="mt-2">
                  Clear filters to see all news
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
              {filteredNews.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedNews(item)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.title}</h4>
                        <Badge className={getImpactColor(item.impact)} variant="outline">
                          {item.impact} ({item.impactScore}%)
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          {getSentimentIcon(item.sentiment)}
                          Sentiment: {(item.sentiment * 100).toFixed(0)}%
                        </span>
                        <span>{item.source}</span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        {item.symbols.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>Symbols:</span>
                            {item.symbols.map((symbol) => (
                              <Badge key={symbol} variant="secondary" className="text-xs">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* News Detail Dialog */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              {selectedNews?.title}
            </DialogTitle>
            <DialogDescription>Detailed Impact Analysis</DialogDescription>
          </DialogHeader>
          {selectedNews && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getImpactColor(selectedNews.impact)} variant="outline">
                  {selectedNews.impact} Impact ({selectedNews.impactScore}%)
                </Badge>
                <Badge variant="secondary">{selectedNews.source}</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedNews.timestamp).toLocaleString()}
                </span>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedNews.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Sentiment Score</h4>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(selectedNews.sentiment)}
                    <span className="text-sm">{(selectedNews.sentiment * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Affected Assets</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNews.symbols.map((symbol) => (
                      <Badge key={symbol} variant="secondary">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(selectedNews.url, "_blank")}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Read Full Article
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
