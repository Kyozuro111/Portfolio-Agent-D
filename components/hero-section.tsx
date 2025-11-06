"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  const handleGetStarted = () => {
    const portfolioSection = document.getElementById("portfolio-dashboard")
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleViewDocs = () => {
    window.location.href = "/docs"
  }

  return (
    <section className="gradient-hero py-20 px-4 relative overflow-hidden" suppressHydrationWarning>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "0s" }}
          suppressHydrationWarning
        />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
          suppressHydrationWarning
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
          suppressHydrationWarning
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" suppressHydrationWarning>
        <div className="text-center space-y-6" suppressHydrationWarning>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm animate-fade-in border-glow" suppressHydrationWarning>
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-primary font-medium">Powered by ROMA Framework + OpenDeepSearch</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-slide-in-up">
            <span className="text-balance">Intelligent Portfolio</span>
            <br />
            <span className="text-gradient">Agent</span>
          </h1>

          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance animate-slide-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Automated portfolio analysis, risk management, and intelligent rebalancing. Get real-time insights, predictive analytics, and AI-powered recommendations for your crypto portfolio.
          </p>

          <div
            className="flex items-center justify-center gap-4 pt-4 animate-slide-in-up"
            style={{ animationDelay: "0.2s" }}
            suppressHydrationWarning
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90 animate-pulse-glow" onClick={handleGetStarted}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-glow bg-transparent" onClick={handleViewDocs}>
              View Documentation
            </Button>
          </div>

          <div
            className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.3s" }}
            suppressHydrationWarning
          >
            <div className="text-center group" suppressHydrationWarning>
              <div className="text-3xl font-bold text-primary group-hover:animate-number-pop" suppressHydrationWarning>11+</div>
              <div className="text-sm text-muted-foreground" suppressHydrationWarning>Specialized Tools</div>
            </div>
            <div className="text-center group" suppressHydrationWarning>
              <div className="text-3xl font-bold text-primary group-hover:animate-number-pop" suppressHydrationWarning>24/7</div>
              <div className="text-sm text-muted-foreground" suppressHydrationWarning>Monitoring</div>
            </div>
            <div className="text-center group" suppressHydrationWarning>
              <div className="text-3xl font-bold text-primary group-hover:animate-number-pop" suppressHydrationWarning>Auto</div>
              <div className="text-sm text-muted-foreground" suppressHydrationWarning>Rebalancing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
