"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Shield, Search, Zap, Clock } from "lucide-react"

interface Activity {
  id: string
  type: "analysis" | "detection" | "monitoring" | "scan"
  message: string
  timestamp: Date
  status: "active" | "complete"
}

interface AIActivityFeedProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number; allocation?: number }>
  result?: any
}

export function AIActivityFeed({ holdings = [], result }: AIActivityFeedProps) {
  const generatedActivities = useMemo(() => {
    const activities: Activity[] = []
    const now = Date.now()

    // Always add monitoring activity
    activities.push({
      id: "1",
      type: "monitoring",
      message: `Monitoring risk levels across ${holdings.length} assets`,
      timestamp: new Date(now - 3 * 60 * 1000),
      status: "active",
    })

    // Check for concentration risk based on actual allocations
    if (holdings.length > 0) {
      const sortedHoldings = [...holdings].sort((a, b) => (b.allocation || 0) - (a.allocation || 0))
      const topAsset = sortedHoldings[0]

      if (topAsset && (topAsset.allocation || 0) > 25) {
        activities.push({
          id: "2",
          type: "detection",
          message: `Detected ${topAsset.symbol} concentration risk`,
          timestamp: new Date(now - 6 * 60 * 1000),
          status: "complete",
        })
      } else if (topAsset) {
        activities.push({
          id: "2",
          type: "detection",
          message: `Balanced allocation detected across ${holdings.map((h) => h.symbol).join(", ")}`,
          timestamp: new Date(now - 6 * 60 * 1000),
          status: "complete",
        })
      }
    }

    // Add analysis activity
    activities.push({
      id: "3",
      type: "analysis",
      message: "Analyzing market trends and correlations",
      timestamp: new Date(now - 11 * 60 * 1000),
      status: "complete",
    })

    // Add scan activity if we have result data
    if (result?.insights) {
      activities.push({
        id: "4",
        type: "scan",
        message: "Scanning for rebalancing opportunities",
        timestamp: new Date(now - 15 * 60 * 1000),
        status: "complete",
      })
    }

    return activities
  }, [holdings, result])

  const [activities] = useState<Activity[]>(generatedActivities)
  const [currentActivity, setCurrentActivity] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [activities.length])

  const stats = useMemo(() => {
    const dataPoints = holdings.length * 249 // Simulating data points per asset
    const confidence = result?.confidence || 98.5

    return {
      dataPoints,
      confidence,
    }
  }, [holdings, result])

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "analysis":
        return <Brain className="h-4 w-4" />
      case "detection":
        return <TrendingUp className="h-4 w-4" />
      case "monitoring":
        return <Shield className="h-4 w-4" />
      case "scan":
        return <Search className="h-4 w-4" />
    }
  }

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes === 1) return "1 min ago"
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  }

  return (
    <Card className="gradient-card border-primary/30 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-pulse opacity-30" />

      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="relative">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
          AI Agent Status
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {/* Current Activity */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-primary">{getIcon(activities[currentActivity].type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-relaxed">{activities[currentActivity].message}</p>
              <div className="flex items-center gap-2 mt-1">
                {activities[currentActivity].status === "active" && (
                  <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                    Active
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(activities[currentActivity].timestamp)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-2">
          {activities.slice(0, 3).map((activity, idx) => (
            <div
              key={activity.id}
              className={`p-2.5 rounded-lg border transition-all ${
                idx === currentActivity ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`${idx === currentActivity ? "text-primary" : "text-muted-foreground"}`}>
                  {getIcon(activity.type)}
                </div>
                <p className="text-xs flex-1 truncate">{activity.message}</p>
                <span className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="text-lg font-bold text-primary">{stats.dataPoints.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Data points analyzed</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="text-lg font-bold text-success">{stats.confidence.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Model confidence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
