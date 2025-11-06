"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Clock, TrendingUp, TrendingDown, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Snapshot {
  id: string
  timestamp: number
  totalValue: number
  holdings: Array<{
    symbol: string
    amount: string
    price?: number
    value?: number
  }>
  note?: string
}

interface PortfolioSnapshotProps {
  holdings: Array<{
    id: string
    symbol: string
    amount: string
    price?: number
    value?: number
  }>
  totalValue?: number
}

export function PortfolioSnapshot({ holdings, totalValue = 0 }: PortfolioSnapshotProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [note, setNote] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio-snapshots")
      if (saved) {
        try {
          setSnapshots(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to load snapshots:", e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && snapshots.length > 0) {
      localStorage.setItem("portfolio-snapshots", JSON.stringify(snapshots))
    }
  }, [snapshots])

  const takeSnapshot = () => {
    if (totalValue === 0 || holdings.length === 0) {
      toast({
        title: "Cannot Take Snapshot",
        description: "Add holdings first to take a snapshot",
        variant: "destructive",
      })
      return
    }

    const snapshot: Snapshot = {
      id: typeof window !== "undefined" ? Date.now().toString() : Math.random().toString(36),
      timestamp: typeof window !== "undefined" ? Date.now() : 0,
      totalValue,
      holdings: holdings.map((h) => ({
        symbol: h.symbol,
        amount: h.amount,
        price: h.price,
        value: h.value,
      })),
      note: note.trim() || undefined,
    }

    setSnapshots((prev) => [snapshot, ...prev])
    setNote("")
    setIsDialogOpen(false)

    toast({
      title: "Snapshot Saved",
      description: `Portfolio snapshot taken at ${new Date(snapshot.timestamp).toLocaleString()}`,
    })
  }

  const deleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id))
    toast({
      title: "Snapshot Deleted",
      description: "Portfolio snapshot removed",
    })
  }

  const compareWithSnapshot = (snapshot: Snapshot) => {
    const currentValue = totalValue
    const snapshotValue = snapshot.totalValue
    const change = currentValue - snapshotValue
    const changePercent = snapshotValue > 0 ? (change / snapshotValue) * 100 : 0

    toast({
      title: "Snapshot Comparison",
      description: `Current: $${currentValue.toLocaleString()} | Snapshot: $${snapshotValue.toLocaleString()} | Change: ${change >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
    })
  }

  const latestSnapshot = snapshots[0]
  const latestChange = latestSnapshot
    ? totalValue > 0
      ? ((totalValue - latestSnapshot.totalValue) / latestSnapshot.totalValue) * 100
      : 0
    : null

  return (
    <>
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Portfolio Snapshot
              </CardTitle>
              <CardDescription>Track your portfolio state over time</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="transition-all duration-300 hover:scale-105"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Snapshot
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No snapshots yet. Take your first snapshot to track portfolio changes.</p>
            </div>
          ) : (
            <>
              {latestSnapshot && latestChange !== null && (
                <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Last Snapshot</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(latestSnapshot.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {latestChange >= 0 ? (
                        <span className="text-success flex items-center gap-1">
                          <TrendingUp className="h-5 w-5" />
                          +{latestChange.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1">
                          <TrendingDown className="h-5 w-5" />
                          {latestChange.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${latestSnapshot.totalValue.toLocaleString()} → ${totalValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {snapshots.slice(0, 5).map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {new Date(snapshot.timestamp).toLocaleString()}
                          </span>
                          {snapshot.note && (
                            <Badge variant="secondary" className="text-xs">
                              {snapshot.note}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${snapshot.totalValue.toLocaleString()} • {snapshot.holdings.length} assets
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => compareWithSnapshot(snapshot)}
                        >
                          Compare
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => deleteSnapshot(snapshot.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Portfolio Snapshot</DialogTitle>
            <DialogDescription>
              Save the current state of your portfolio for comparison later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Before major rebalancing"
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="text-sm text-muted-foreground">Snapshot will include:</div>
              <div className="text-sm">
                • {holdings.length} holdings
                <br />• Total value: ${totalValue.toLocaleString()}
                <br />• Current prices and allocations
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={takeSnapshot}>
                <Camera className="h-4 w-4 mr-2" />
                Take Snapshot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
