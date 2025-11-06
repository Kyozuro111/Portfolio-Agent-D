import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { PortfolioDashboard } from "@/components/portfolio-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen" suppressHydrationWarning>
      <Header />
      <main suppressHydrationWarning>
        <HeroSection />
        <PortfolioDashboard />
      </main>
    </div>
  )
}
