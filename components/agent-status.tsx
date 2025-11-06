"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, Sparkles, Brain, TrendingUp } from "lucide-react"
import type { AgentEvent } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

interface AgentStatusProps {
  isRunning: boolean
  events: AgentEvent[]
  error: string | null
}

export function AgentStatus({ isRunning, events, error }: AgentStatusProps) {
  if (!isRunning && events.length === 0 && !error) {
    return null
  }

  const completedSteps = events.filter((e) => e.type === "complete").length
  const totalSteps = 5 // fetch_history, compute_risk, compute_health, check_alerts, llm_analysis
  const progress = (completedSteps / totalSteps) * 100

  const latestEvent = events[events.length - 1]
  const isComplete = !isRunning && !error && completedSteps === totalSteps

  return (
    <Card className="gradient-card border-primary/30 animate-slide-in-up overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse opacity-50" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRunning && (
              <div className="relative">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
            )}
            {isComplete && (
              <div className="relative">
                <CheckCircle2 className="h-6 w-6 text-success animate-scale-in" />
                <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
              </div>
            )}
            {error && <XCircle className="h-6 w-6 text-destructive animate-shake" />}
            <span className="text-lg">AI Agent Analysis</span>
          </div>
          {isRunning && (
            <Badge variant="secondary" className="animate-pulse bg-primary/20 text-primary border-primary/30">
              <Brain className="h-3 w-3 mr-1" />
              Processing...
            </Badge>
          )}
          {isComplete && (
            <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Progress bar */}
        {(isRunning || isComplete) && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Current status */}
        {latestEvent && !error && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 animate-slide-in">
            <div className="flex items-start gap-3">
              {latestEvent.type === "progress" && <Loader2 className="h-5 w-5 text-primary animate-spin mt-0.5" />}
              {latestEvent.type === "complete" && (
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 animate-scale-in" />
              )}
              <div className="flex-1">
                <div className="font-medium text-sm capitalize mb-1">{latestEvent.step.replace(/_/g, " ")}</div>
                <p className="text-sm text-muted-foreground">{latestEvent.message}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {new Date(latestEvent.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 animate-shake">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 animate-pulse" />
              <div className="flex-1">
                <div className="font-medium text-sm text-destructive mb-1">Analysis Failed</div>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {isComplete && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/30 animate-scale-in">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <div className="flex-1">
                <div className="font-medium text-sm text-success">Analysis Complete!</div>
                <p className="text-sm text-muted-foreground">Your portfolio insights are ready below.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
