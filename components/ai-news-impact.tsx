"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Newspaper, TrendingUp, TrendingDown, AlertCircle, ExternalLink, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface AINewsImpactProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number }>
}

export function AINewsImpact({ holdings = [] }: AINewsImpactProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const portfolioSymbols = holdings.map((h) => h.symbol.toUpperCase())

  const fetchNews = async () => {
    if (portfolioSymbols.length === 0) {
      setNews([])
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
        // Convert NewsResearchTool output to NewsItem format
        const newsItems: NewsItem[] = newsOutput.items
          .filter((item: any) => {
            // Only show news relevant to portfolio symbols
            return item.symbols.some((symbol: string) => portfolioSymbols.includes(symbol.toUpperCase()))
          })
          .slice(0, 10) // Limit to 10 items
          .map((item: any) => {
            // Calculate impact score based on sentiment and relevance
            const sentimentScore = item.sentiment || 0.5
            const isExtremeSentiment = sentimentScore > 0.7 || sentimentScore < 0.3
            const impactScore = Math.round(
              50 + (sentimentScore - 0.5) * 60 + (isExtremeSentiment ? 20 : 0),
            )

            let impact: "critical" | "high" | "medium" | "low" = "low"
            if (impactScore >= 85) impact = "critical"
            else if (impactScore >= 70) impact = "high"
            else if (impactScore >= 55) impact = "medium"

            return {
              title: item.title,
              url: item.url,
              symbols: item.symbols,
              sentiment: sentimentScore,
              summary: item.summary || "",
              source: item.source || "News",
              timestamp: item.timestamp || "Recently",
              impact,
              impactScore: Math.min(100, impactScore),
            }
          })

        setNews(newsItems)
        setLastUpdate(new Date())
      } else {
        setNews([])
      }
    } catch (error) {
      console.error("[portfolio-agent] Failed to fetch news:", error)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (portfolioSymbols.length > 0) {
      fetchNews()
      const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
      return () => clearInterval(interval)
    }
  }, [portfolioSymbols.join(",")])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "text-destructive border-destructive/50 bg-destructive/10"
      case "high":
        return "text-chart-3 border-chart-3/50 bg-chart-3/10"
      case "medium":
        return "text-chart-4 border-chart-4/50 bg-chart-4/10"
      default:
        return "text-muted-foreground border-border/50 bg-muted/10"
    }
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.6) return <TrendingUp className="h-4 w-4 text-success" />
    if (sentiment < 0.4) return <TrendingDown className="h-4 w-4 text-destructive" />
    return <AlertCircle className="h-4 w-4 text-chart-4" />
  }

  return (
    <Card className="gradient-card border-border/50 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              AI News Impact Analyzer
            </CardTitle>
            <CardDescription>Real-time news with AI-analyzed portfolio impact</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchNews} disabled={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? "Analyzing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastUpdate && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        <div className="space-y-3">
          {news.length > 0 ? (
            news.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] animate-slide-in",
                  getImpactColor(item.impact),
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {item.symbols.join(", ")}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.impact}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm leading-tight mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                  </div>
                  {getSentimentIcon(item.sentiment)}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-medium">
                      Impact: <span className="text-primary">{item.impactScore}%</span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="sr-only">Open article</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {portfolioSymbols.length === 0
                ? "Add holdings to see relevant news"
                : "No recent news for your portfolio assets"}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Powered by OpenDeepSearch</span>
            <span className="text-primary font-medium">Serper + Jina + Tavily</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
