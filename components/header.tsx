"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Settings, Sparkles, Database, Zap, Brain } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 animate-slide-in-up" suppressHydrationWarning>
        <div className="container mx-auto px-4 py-4" suppressHydrationWarning>
          <div className="flex items-center justify-between" suppressHydrationWarning>
            <div className="flex items-center gap-3 group" suppressHydrationWarning>
              <div className="relative" suppressHydrationWarning>
                <Image
                  src="/sentient-logo.webp"
                  alt="Sentient"
                  width={40}
                  height={40}
                  className="rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" suppressHydrationWarning />
              </div>
              <div suppressHydrationWarning>
                <h1 className="text-xl font-bold transition-colors duration-300 group-hover:text-primary">
                  Portfolio Agent
                </h1>
                <p className="text-xs text-muted-foreground">Built by Kyozuro for Sentient</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="transition-all duration-300 hover:scale-105 hover:bg-primary/10"
                onClick={() => setSettingsOpen(true)}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings & Information
            </DialogTitle>
            <DialogDescription>
              Portfolio Agent configuration and system information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-primary" />
                  System Overview
                </CardTitle>
                <CardDescription>
                  Intelligent portfolio management powered by advanced frameworks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">ROMA Framework</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Plan-based execution system for intelligent portfolio analysis and decision-making
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">OpenDeepSearch</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Real-time news research with sentiment analysis and portfolio impact scoring
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="font-medium">Multi-Source Data</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    CoinGecko, CoinMarketCap, Birdeye for prices. Serper, Jina, Tavily for news research
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Automated portfolio analysis with real-time risk metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Intelligent rebalancing recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Predictive analytics with 7-day and 30-day forecasts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Performance attribution and portfolio optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Real-time news monitoring with sentiment analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Natural language commands for portfolio control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Stress testing and scenario analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Configuration</CardTitle>
                <CardDescription>
                  API keys are configured via environment variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All API keys are securely stored in environment variables and never exposed to clients. 
                  Configure your keys in your hosting platform's environment settings.
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
