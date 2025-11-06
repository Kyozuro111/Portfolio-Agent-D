"use client"

import { UnifiedAIDashboard } from "@/components/unified-ai-dashboard"

export function PortfolioDashboard() {
  return (
    <section id="portfolio-dashboard" className="py-12 px-4" suppressHydrationWarning>
      <div className="container mx-auto max-w-7xl" suppressHydrationWarning>
        <UnifiedAIDashboard />
      </div>
    </section>
  )
}
