"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, TrendingUp, Zap, Star, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Opportunity } from "@/lib/types"

interface OpportunityScannerProps {
  symbols?: string[]
}

export function OpportunityScanner({ symbols = [] }: OpportunityScannerProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const scanOpportunities = async () => {
    if (symbols.length === 0) {
      toast({
        title: "No symbols",
        description: "Add portfolio holdings to scan opportunities",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols }),
      })

      if (!response.ok) {
        throw new Error("Failed to scan opportunities")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let opportunitiesResult: any = null
      let buffer = "" // Buffer for incomplete lines

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const lines = buffer.split("\n")
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonStr = line.slice(6).trim()
                  if (jsonStr) {
                    const event = JSON.parse(jsonStr)
                    if (event.type === "complete" && event.data) {
                      opportunitiesResult = event.data
                    }
                  }
                } catch (e) {
                  // Ignore parse errors for incomplete JSON
                  if (e instanceof SyntaxError && !e.message.includes("Unexpected end")) {
                    console.error("[portfolio-agent] Failed to parse event:", e)
                  }
                }
              }
            }
          }
          break
        }

        // Decode chunk and append to buffer
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        
        // Keep last incomplete line in buffer
        buffer = lines.pop() || ""

        // Process complete lines
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6).trim()
              if (jsonStr) {
                const event = JSON.parse(jsonStr)
                if (event.type === "complete" && event.data) {
                  opportunitiesResult = event.data
                }
              }
            } catch (e) {
              // Ignore parse errors for incomplete JSON
              if (e instanceof SyntaxError && !e.message.includes("Unexpected end") && !e.message.includes("Unterminated")) {
                console.error("[portfolio-agent] Failed to parse event:", e)
              }
            }
          }
        }
      }

      if (opportunitiesResult && opportunitiesResult.opportunities) {
        setOpportunities(opportunitiesResult.opportunities)
        toast({
          title: "Scan complete",
          description: `Found ${opportunitiesResult.opportunities.length} opportunities`,
        })
      } else {
        setOpportunities([])
      }
    } catch (error) {
      console.error("[portfolio-agent] Failed to scan opportunities:", error)
      toast({
        title: "Scan failed",
        description: "Could not scan for opportunities",
        variant: "destructive",
      })
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (symbols.length > 0) {
      scanOpportunities()
    }
  }, [symbols.join(",")])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Opportunity Scanner</h2>
          <p className="text-muted-foreground">AI-powered market opportunities and investment signals</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={scanOpportunities} disabled={loading || symbols.length === 0}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Scan Market
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {opportunities.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {symbols.length === 0
              ? "Add portfolio holdings to scan for opportunities"
              : "No opportunities found. Try scanning again."}
          </div>
        )}
        {opportunities.map((opp) => (
          <Card key={opp.symbol} className="gradient-card border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{opp.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{opp.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{opp.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                    <span className="font-bold text-2xl text-primary">{opp.score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Opportunity Score</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Momentum</p>
                    <p className="font-medium text-success">{opp.momentum || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-chart-4" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sentiment</p>
                    <p className="font-medium">
                      {opp.sentiment ? `${(opp.sentiment * 100).toFixed(0)}% Positive` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Key Signals:</p>
                <div className="flex flex-wrap gap-2">
                  {opp.reasons.map((reason, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Scanning Criteria</CardTitle>
          <CardDescription>Factors considered in opportunity analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Technical Indicators</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 12-2 month momentum</li>
                <li>• Moving average crossovers</li>
                <li>• RSI and oversold conditions</li>
                <li>• Volume trends</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Fundamental Factors</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• News sentiment analysis</li>
                <li>• Social media trends</li>
                <li>• Partnership announcements</li>
                <li>• Ecosystem developments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
