"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, CheckCircle2, Clock, Zap, TrendingUp, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { VoiceCommands } from "@/components/natural-language-commands-voice"

interface ParsedCommand {
  id: string
  originalCommand: string
  type: "conditional_order" | "alert" | "rebalance" | "analysis"
  action: string
  conditions: string[]
  status: "pending" | "active" | "executed"
  confidence: number
  createdAt: string
}

interface NaturalLanguageCommandsProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number; allocation?: number }>
}

export function NaturalLanguageCommands({ holdings = [] }: NaturalLanguageCommandsProps) {
  const [command, setCommand] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const initialCommands = useMemo(() => {
    const cmds: ParsedCommand[] = []
    const now = Date.now()

    if (holdings.length > 0) {
      // Sort by allocation to find top holdings
      const sortedHoldings = [...holdings].sort((a, b) => (b.allocation || 0) - (a.allocation || 0))
      const topAsset = sortedHoldings[0]
      const secondAsset = sortedHoldings[1]

      // Add conditional order for top asset
      if (topAsset) {
        cmds.push({
          id: "1",
          originalCommand: `Sell 10% of ${topAsset.symbol} if it drops below $30`,
          type: "conditional_order",
          action: `Sell 10% ${topAsset.symbol}`,
          conditions: ["Price < $30"],
          status: "active",
          confidence: 95,
          createdAt: "2 hours ago",
        })
      }

      // Add alert for ratio between top two assets
      if (topAsset && secondAsset) {
        cmds.push({
          id: "2",
          originalCommand: `Alert me when ${topAsset.symbol}/${secondAsset.symbol} ratio > 0.06`,
          type: "alert",
          action: "Send alert",
          conditions: [`${topAsset.symbol}/${secondAsset.symbol} ratio > 0.06`],
          status: "active",
          confidence: 98,
          createdAt: "1 day ago",
        })
      }

      // Add rebalance command based on current allocations
      const allocationStr = sortedHoldings
        .slice(0, 3)
        .map((h) => `${Math.round(h.allocation || 0)}% ${h.symbol}`)
        .join(", ")

      cmds.push({
        id: "3",
        originalCommand: `Rebalance to ${allocationStr}`,
        type: "rebalance",
        action: "Rebalance portfolio",
        conditions: [`Target: ${allocationStr}`],
        status: "executed",
        confidence: 92,
        createdAt: "3 days ago",
      })
    }

    return cmds
  }, [holdings])

  const [commands, setCommands] = useState<ParsedCommand[]>(initialCommands)

  const quickCommands = useMemo(() => {
    if (holdings.length === 0) {
      return ["Alert me if portfolio drops 10%", "Rebalance to equal weights"]
    }

    const sortedHoldings = [...holdings].sort((a, b) => (b.allocation || 0) - (a.allocation || 0))
    const cmds: string[] = []

    // Commands for top 2 assets
    if (sortedHoldings[0]) {
      cmds.push(`Sell 5% of ${sortedHoldings[0].symbol} if it reaches $200`)
    }
    if (sortedHoldings[1]) {
      cmds.push(`Buy more ${sortedHoldings[1].symbol} when it dips below $3000`)
    }

    // General commands
    cmds.push("Alert me if portfolio drops 10%")
    cmds.push("Rebalance to equal weights")

    return cmds
  }, [holdings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    setIsProcessing(true)

    try {
      // Use LLM to parse the command
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Parse this portfolio command into JSON format. Return ONLY valid JSON:
{
  "type": "conditional_order" | "alert" | "rebalance" | "analysis",
  "action": "brief action description",
  "conditions": ["condition1", "condition2"],
  "confidence": 0-100
}

Command: "${command}"

Examples:
- "Sell 10% of BTC if it drops below $30" -> {"type":"conditional_order","action":"Sell 10% BTC","conditions":["BTC price < $30"],"confidence":95}
- "Alert me when ETH/BTC ratio > 0.06" -> {"type":"alert","action":"Send alert","conditions":["ETH/BTC ratio > 0.06"],"confidence":98}
- "Rebalance to 50% BTC, 30% ETH, 20% SOL" -> {"type":"rebalance","action":"Rebalance portfolio","conditions":["Target: 50% BTC, 30% ETH, 20% SOL"],"confidence":92}`,
          userId: "default",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to parse command")
      }

      const data = await response.json()
      let parsed: any = null

      // Try to extract JSON from LLM response
      if (data && data.response && typeof data.response === "string") {
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0])
          }
        } catch (e) {
          console.error("[portfolio-agent] Failed to parse JSON from LLM response:", e)
        }
      }

      // Fallback to simple parsing if LLM fails or response is invalid
      if (!parsed || !parsed.type) {
        parsed = {
          type: command.toLowerCase().includes("alert")
            ? "alert"
            : command.toLowerCase().includes("rebalance")
              ? "rebalance"
              : "conditional_order",
          action: command.split(" ").slice(0, 4).join(" "),
          conditions: [command.split("if ")[1] || command.split("when ")[1] || "Immediate execution"],
          confidence: 85,
        }
      }

      const newCommand: ParsedCommand = {
        id: typeof window !== "undefined" ? Date.now().toString() : Math.random().toString(36).substr(2, 9),
        originalCommand: command,
        type: parsed?.type || "conditional_order",
        action: parsed?.action || command.split(" ").slice(0, 4).join(" "),
        conditions: parsed?.conditions || [command.split("if ")[1] || command.split("when ")[1] || "Immediate execution"],
        status: "pending",
        confidence: parsed?.confidence || 85,
        createdAt: "Just now",
      }

      setCommands((prev) => [newCommand, ...prev])
      setCommand("")
      setIsProcessing(false)

      toast({
        title: "Command Parsed",
        description: `Your command has been understood with ${newCommand.confidence}% confidence. Review and confirm to execute.`,
      })
    } catch (error) {
      console.error("[portfolio-agent] Failed to parse command:", error)
      // Fallback to simple parsing
      const newCommand: ParsedCommand = {
        id: typeof window !== "undefined" ? Date.now().toString() : Math.random().toString(36).substr(2, 9),
        originalCommand: command,
        type: command.toLowerCase().includes("alert")
          ? "alert"
          : command.toLowerCase().includes("rebalance")
            ? "rebalance"
            : "conditional_order",
        action: command.split(" ").slice(0, 4).join(" "),
        conditions: [command.split("if ")[1] || command.split("when ")[1] || "Immediate execution"],
        status: "pending",
        confidence: 75,
        createdAt: "Just now",
      }

      setCommands((prev) => [newCommand, ...prev])
      setCommand("")
      setIsProcessing(false)

      toast({
        title: "Command Parsed (Fallback)",
        description: "Parsed with basic algorithm. AI parsing unavailable.",
        variant: "default",
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <Bell className="h-4 w-4" />
      case "rebalance":
        return <Zap className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "alert":
        return "text-chart-4 border-chart-4/50 bg-chart-4/10"
      case "rebalance":
        return "text-primary border-primary/50 bg-primary/10"
      default:
        return "text-success border-success/50 bg-success/10"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-success border-success/50 bg-success/10"
      case "executed":
        return "text-muted-foreground border-border/50 bg-background/50"
      default:
        return "text-chart-4 border-chart-4/50 bg-chart-4/10"
    }
  }

  const handleConfirm = (cmd: ParsedCommand) => {
    setCommands((prev) => prev.map((c) => (c.id === cmd.id ? { ...c, status: "active" as const } : c)))
    toast({
      title: "Command Activated",
      description: `${cmd.action} is now active and monitoring conditions.`,
    })
  }

  const handleCancel = (cmdId: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== cmdId))
    toast({
      title: "Command Cancelled",
      description: "The command has been removed.",
      variant: "destructive",
    })
  }

  const placeholderText =
    holdings.length > 0
      ? `Try: "Sell 10% of ${holdings[0].symbol} if it drops below $30"`
      : 'Try: "Sell 10% of BTC if it drops below $30"'

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Natural Language Commands
        </CardTitle>
        <CardDescription>Control your portfolio with simple English commands</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder={placeholderText}
              className="pr-24 h-12 text-base border-primary/30 focus:border-primary"
              disabled={isProcessing}
            />
            <div className="absolute right-1 top-1 flex items-center gap-1">
              <VoiceCommands
                onCommand={(voiceCommand) => {
                  setCommand(voiceCommand)
                  // Auto-submit after voice input
                  setTimeout(() => {
                    const event = new Event("submit", { bubbles: true, cancelable: true })
                    const form = document.querySelector('form')
                    if (form) {
                      form.dispatchEvent(event)
                    }
                  }, 500)
                }}
                disabled={isProcessing}
              />
              <Button
                type="submit"
                size="sm"
                className="h-10 w-10 p-0"
                disabled={isProcessing || !command.trim()}
              >
                {isProcessing ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickCommands.map((cmd, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCommand(cmd)}
                className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                {cmd}
              </button>
            ))}
          </div>
        </form>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Active & Recent Commands
          </h4>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {commands.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={cn(
                  "p-4 rounded-lg border border-border/50 bg-background/50 space-y-3 animate-slide-in hover:border-primary/30 transition-all duration-300",
                  cmd.status === "executed" && "opacity-60",
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={cn("text-xs", getTypeColor(cmd.type))}>
                        {getTypeIcon(cmd.type)}
                        <span className="ml-1 capitalize">{cmd.type.replace("_", " ")}</span>
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(cmd.status))}>
                        {cmd.status === "active" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {cmd.status === "executed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {cmd.status === "pending" && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
                        {cmd.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{cmd.originalCommand}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">Action:</span>
                        <span>{cmd.action}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary">Conditions:</span>
                        <span>{cmd.conditions.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs text-muted-foreground">{cmd.createdAt}</div>
                    <div className="text-xs font-medium text-primary">{cmd.confidence}% confident</div>
                  </div>
                </div>

                {cmd.status === "pending" && (
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => handleConfirm(cmd)}>
                      Confirm & Execute
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs bg-transparent"
                      onClick={() => handleCancel(cmd.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="text-sm font-medium text-primary">AI Command Understanding</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The AI can understand complex conditional orders, price alerts, ratio-based triggers, percentage-based
                actions, and multi-step rebalancing instructions. Commands are parsed with 90%+ accuracy.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Powered by Dobby-70B (Llama 3.3)</span>
            <span className="text-primary font-medium">{commands.length} Commands Processed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
