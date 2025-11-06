"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, LayoutGrid, Eye, EyeOff, GripVertical } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

type WidgetId =
  | "portfolio-overview"
  | "ai-intelligence"
  | "predictive-analytics"
  | "portfolio-comparison"
  | "news-impact"
  | "stress-testing"
  | "opportunity-scanner"
  | "natural-language"
  | "activity-feed"
  | "predictive-insights"
  | "smart-recommendations"
  | "auto-rebalancing"
  | "performance-attribution"
  | "portfolio-optimization"

interface WidgetConfig {
  id: WidgetId
  name: string
  description: string
  enabled: boolean
  order: number
}

interface CustomizableDashboardProps {
  children?: React.ReactNode
  onWidgetChange?: (widgets: WidgetConfig[]) => void
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "portfolio-overview", name: "Portfolio Overview", description: "Total value and key metrics", enabled: true, order: 0 },
  { id: "ai-intelligence", name: "AI Intelligence Center", description: "Proactive AI recommendations", enabled: true, order: 1 },
  { id: "predictive-analytics", name: "Predictive Analytics", description: "Portfolio forecasts", enabled: true, order: 2 },
  { id: "portfolio-comparison", name: "Portfolio Comparison", description: "Compare with benchmarks", enabled: true, order: 3 },
  { id: "activity-feed", name: "AI Activity Feed", description: "Real-time agent activities", enabled: true, order: 4 },
  { id: "predictive-insights", name: "Predictive Insights", description: "Market predictions", enabled: true, order: 5 },
  { id: "smart-recommendations", name: "Smart Recommendations", description: "AI-powered suggestions", enabled: true, order: 6 },
  { id: "news-impact", name: "News Impact", description: "Real-time news analysis", enabled: true, order: 7 },
  { id: "stress-testing", name: "Stress Testing", description: "Scenario simulations", enabled: true, order: 8 },
  { id: "opportunity-scanner", name: "Opportunity Scanner", description: "Market opportunities", enabled: false, order: 9 },
  { id: "auto-rebalancing", name: "Auto Rebalancing Advisor", description: "AI-powered rebalancing recommendations", enabled: true, order: 10 },
  { id: "performance-attribution", name: "Performance Attribution", description: "Asset contribution analysis", enabled: true, order: 11 },
  { id: "portfolio-optimization", name: "Portfolio Optimization", description: "AI optimizes based on risk profile", enabled: true, order: 12 },
  { id: "natural-language", name: "Natural Language Commands", description: "Voice and text commands", enabled: true, order: 13 },
]

export function CustomizableDashboard({ children, onWidgetChange }: CustomizableDashboardProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved configuration
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboard-widgets")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setWidgets(parsed)
        } catch (e) {
          console.error("Failed to load widget config:", e)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Save configuration
    if (typeof window !== "undefined" && widgets.length > 0) {
      localStorage.setItem("dashboard-widgets", JSON.stringify(widgets))
      onWidgetChange?.(widgets)
    }
  }, [widgets, onWidgetChange])

  const handleToggleWidget = (id: WidgetId) => {
    setWidgets((prev) =>
      prev.map((widget) => (widget.id === id ? { ...widget, enabled: !widget.enabled } : widget)),
    )
    toast({
      title: "Widget Updated",
      description: "Dashboard configuration saved",
    })
  }

  const handleReorder = (id: WidgetId, direction: "up" | "down") => {
    setWidgets((prev) => {
      const newWidgets = [...prev]
      const index = newWidgets.findIndex((w) => w.id === id)
      if (index === -1) return prev

      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newWidgets.length) return prev

      const temp = newWidgets[index].order
      newWidgets[index].order = newWidgets[newIndex].order
      newWidgets[newIndex].order = temp

      return newWidgets.sort((a, b) => a.order - b.order)
    })
    toast({
      title: "Widget Reordered",
      description: "Dashboard layout updated",
    })
  }

  const handleReset = () => {
    setWidgets(DEFAULT_WIDGETS)
    toast({
      title: "Dashboard Reset",
      description: "All widgets restored to default",
    })
  }

  const enabledWidgets = widgets.filter((w) => w.enabled).sort((a, b) => a.order - b.order)

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Customize Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Customize Dashboard
              </DialogTitle>
              <DialogDescription>Enable, disable, and reorder widgets to personalize your dashboard</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label>Widget Configuration</Label>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset to Default
                </Button>
              </div>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={widget.id} className="font-medium cursor-pointer">
                              {widget.name}
                            </Label>
                            {widget.enabled ? (
                              <Eye className="h-3 w-3 text-success" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{widget.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReorder(widget.id, "up")}
                            disabled={widget.order === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReorder(widget.id, "down")}
                            disabled={widget.order === widgets.length - 1}
                          >
                            ↓
                          </Button>
                        </div>
                        <Switch
                          id={widget.id}
                          checked={widget.enabled}
                          onCheckedChange={() => handleToggleWidget(widget.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                <p>• Drag widgets to reorder (coming soon)</p>
                <p>• Toggle widgets on/off to customize your view</p>
                <p>• Configuration is saved automatically</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {children}
    </>
  )
}

// Export hook to get widget config
export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboard-widgets")
      if (saved) {
        try {
          setWidgets(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to load widget config:", e)
        }
      }
    }
  }, [])

  const isWidgetEnabled = (id: WidgetId) => {
    return widgets.find((w) => w.id === id)?.enabled ?? true
  }

  return { widgets, isWidgetEnabled }
}
