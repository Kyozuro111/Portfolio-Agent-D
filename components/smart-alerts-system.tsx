"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Settings,
  Plus,
  X,
  Check,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Alert {
  id: string
  name: string
  type: "price" | "volume" | "news" | "risk" | "custom"
  condition: string
  threshold: number
  enabled: boolean
  channels: string[]
  triggered: boolean
  lastTriggered?: Date
}

interface SmartAlertsSystemProps {
  holdings?: Array<{ symbol: string; amount: string; value?: number }>
  result?: any
}

export function SmartAlertsSystem({ holdings = [], result }: SmartAlertsSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    name: "",
    type: "price",
    condition: "above",
    threshold: 0,
    enabled: true,
    channels: ["in-app"],
  })
  const { toast } = useToast()

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === "undefined") return

    // Load saved alerts from localStorage
    const saved = localStorage.getItem("portfolio-alerts")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAlerts(parsed)
      } catch (e) {
        console.error("Failed to load alerts:", e)
      }
    }

    // Generate smart alerts from portfolio analysis
    if (result?.check_alerts) {
      const smartAlerts: Alert[] = result.check_alerts.map((alert: any, idx: number) => ({
        id: `smart-${idx}`,
        name: alert.message || "Portfolio Risk Alert",
        type: "risk",
        condition: alert.severity === "high" ? "above" : "below",
        threshold: alert.threshold || 0,
        enabled: true,
        channels: ["in-app"],
        triggered: true,
        lastTriggered: typeof window !== "undefined" ? new Date() : undefined,
      }))

      setAlerts((prev) => {
        const existingIds = new Set(prev.map((a) => a.id))
        const newOnes = smartAlerts.filter((a) => !existingIds.has(a.id))
        return [...prev, ...newOnes]
      })
    }
  }, [result])

  useEffect(() => {
    // Save alerts to localStorage
    if (alerts.length > 0) {
      localStorage.setItem("portfolio-alerts", JSON.stringify(alerts))
    }
  }, [alerts])

  const handleCreateAlert = () => {
    if (!newAlert.name || !newAlert.threshold) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Use a stable ID generation that works on both server and client
    const alertId = typeof window !== "undefined" 
      ? `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      : `alert-${Math.random().toString(36).substr(2, 9)}`

    const alert: Alert = {
      id: alertId,
      name: newAlert.name!,
      type: newAlert.type || "price",
      condition: newAlert.condition || "above",
      threshold: newAlert.threshold!,
      enabled: newAlert.enabled ?? true,
      channels: newAlert.channels || ["in-app"],
      triggered: false,
    }

    setAlerts((prev) => [...prev, alert])
    setNewAlert({
      name: "",
      type: "price",
      condition: "above",
      threshold: 0,
      enabled: true,
      channels: ["in-app"],
    })
    setIsDialogOpen(false)

    toast({
      title: "Alert Created",
      description: `"${alert.name}" has been created and is now active.`,
    })
  }

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)),
    )
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    toast({
      title: "Alert Deleted",
      description: "The alert has been removed.",
    })
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "price":
        return <TrendingUp className="h-4 w-4" />
      case "volume":
        return <TrendingDown className="h-4 w-4" />
      case "risk":
        return <AlertTriangle className="h-4 w-4" />
      case "news":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: string, triggered: boolean) => {
    if (triggered) return "bg-destructive/20 border-destructive/50"
    switch (type) {
      case "risk":
        return "bg-orange-500/20 border-orange-500/50"
      case "price":
        return "bg-primary/20 border-primary/50"
      case "news":
        return "bg-chart-3/20 border-chart-3/50"
      default:
        return "bg-muted border-border"
    }
  }

  const activeAlerts = alerts.filter((a) => a.enabled)
  const triggeredAlerts = alerts.filter((a) => a.triggered && a.enabled)

  return (
    <Card className="gradient-card border-border/50" data-section="alerts">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Smart Alerts System
            </CardTitle>
            <CardDescription>Custom alerts and notifications for your portfolio</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
                <DialogDescription>Set up a custom alert for your portfolio</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Alert Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., BTC Price Alert"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Alert Type</Label>
                  <Select
                    value={newAlert.type}
                    onValueChange={(value) => setNewAlert({ ...newAlert, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price Alert</SelectItem>
                      <SelectItem value="volume">Volume Alert</SelectItem>
                      <SelectItem value="risk">Risk Alert</SelectItem>
                      <SelectItem value="news">News Alert</SelectItem>
                      <SelectItem value="custom">Custom Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={newAlert.condition}
                      onValueChange={(value) => setNewAlert({ ...newAlert, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      placeholder="0.00"
                      value={newAlert.threshold || ""}
                      onChange={(e) => setNewAlert({ ...newAlert, threshold: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notification Channels</Label>
                  <div className="space-y-2">
                    {[
                      { id: "in-app", label: "In-App", icon: Bell },
                      { id: "email", label: "Email", icon: Mail },
                      { id: "push", label: "Push Notification", icon: Smartphone },
                      { id: "discord", label: "Discord", icon: MessageSquare },
                    ].map((channel) => (
                      <div key={channel.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <channel.icon className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={channel.id} className="cursor-pointer">
                            {channel.label}
                          </Label>
                        </div>
                        <Switch
                          id={channel.id}
                          checked={newAlert.channels?.includes(channel.id)}
                          onCheckedChange={(checked) => {
                            const channels = newAlert.channels || []
                            if (checked) {
                              setNewAlert({ ...newAlert, channels: [...channels, channel.id] })
                            } else {
                              setNewAlert({
                                ...newAlert,
                                channels: channels.filter((c) => c !== channel.id),
                              })
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="enabled">Enabled</Label>
                    <Switch
                      id="enabled"
                      checked={newAlert.enabled}
                      onCheckedChange={(checked) => setNewAlert({ ...newAlert, enabled: checked })}
                    />
                  </div>
                  <Button onClick={handleCreateAlert} className="bg-primary hover:bg-primary/90">
                    <Check className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="text-2xl font-bold">{alerts.length}</div>
            <div className="text-xs text-muted-foreground">Total Alerts</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="text-2xl font-bold text-primary">{activeAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="text-2xl font-bold text-destructive">{triggeredAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Triggered</div>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No alerts configured yet.</p>
            <p className="text-sm mt-2">Create your first alert to get notified about portfolio changes.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all ${getAlertColor(alert.type, alert.triggered)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-background/50">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{alert.name}</h4>
                        {alert.triggered && (
                          <Badge variant="destructive" className="text-xs">
                            Triggered
                          </Badge>
                        )}
                        {!alert.enabled && (
                          <Badge variant="secondary" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.type} • {alert.condition} {alert.threshold}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {alert.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                        {alert.lastTriggered && (
                          <span className="text-xs text-muted-foreground">
                            Last: {alert.lastTriggered.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={alert.enabled} onCheckedChange={() => handleToggleAlert(alert.id)} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
