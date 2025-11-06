"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Newspaper, ExternalLink, TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const newsItems = [
  {
    title: "Bitcoin ETF Sees Record Inflows as Institutional Interest Surges",
    url: "#",
    source: "CoinDesk",
    timestamp: "2 hours ago",
    symbols: ["BTC"],
    sentiment: 0.82,
    summary:
      "Major institutional investors continue to pour capital into Bitcoin ETFs, signaling strong confidence in the asset class.",
  },
  {
    title: "Ethereum Network Upgrade Successfully Deployed, Gas Fees Drop 40%",
    url: "#",
    source: "The Block",
    timestamp: "5 hours ago",
    symbols: ["ETH"],
    sentiment: 0.91,
    summary:
      "The latest Ethereum upgrade has significantly improved network efficiency, reducing transaction costs for users.",
  },
  {
    title: "Regulatory Concerns Mount as SEC Announces New Crypto Guidelines",
    url: "#",
    source: "Bloomberg",
    timestamp: "1 day ago",
    symbols: ["BTC", "ETH", "SOL"],
    sentiment: -0.35,
    summary:
      "New regulatory framework could impact crypto exchanges and DeFi protocols operating in the United States.",
  },
]

export function NewsResearch() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">News & Research</h2>
          <p className="text-muted-foreground">AI-powered news aggregation and sentiment analysis</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Newspaper className="mr-2 h-4 w-4" />
          Refresh News
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+42%</div>
            <p className="text-xs text-muted-foreground mt-1">Positive market sentiment</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">BTC Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+68%</div>
            <p className="text-xs text-muted-foreground mt-1">Strong bullish signals</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">ETH Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+54%</div>
            <p className="text-xs text-muted-foreground mt-1">Moderately positive</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {newsItems.map((item, idx) => (
          <Card key={idx} className="gradient-card border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <Newspaper className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium">{item.source}</span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.symbols.map((symbol) => (
                      <Badge key={symbol} variant="secondary">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div
                    className={`flex items-center gap-1 font-medium ${item.sentiment > 0 ? "text-success" : "text-destructive"}`}
                  >
                    {item.sentiment > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{(item.sentiment * 100).toFixed(0)}%</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Research Sources</CardTitle>
          <CardDescription>Powered by OpenDeepSearch and multiple data providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">OpenDeepSearch</p>
                <p className="text-xs text-muted-foreground">Primary research engine</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Serper + Tavily</p>
                <p className="text-xs text-muted-foreground">Fallback search providers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
