"use client"

import { Card } from "@/components/ui/card"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  LineChart,
  MessageSquare,
  Newspaper,
  Shield,
  TrendingUp,
} from "lucide-react"

export function DocumentationContent() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gradient">Portfolio Agent Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive guide to understanding your portfolio analytics, risk metrics, and intelligent automation
            features.
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            System Overview
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Portfolio Agent is an intelligent portfolio management system that combines real-time market data,
              advanced risk analytics, and automated decision-making. The system continuously monitors your holdings,
              analyzes market conditions, and provides actionable recommendations to optimize your portfolio
              performance.
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">11+</div>
                <div className="text-sm text-muted-foreground">Specialized analysis tools</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">Real-time</div>
                <div className="text-sm text-muted-foreground">Price & news monitoring</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Automated analysis</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Portfolio Health Score */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Portfolio Health Score
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              The Health Score (0-100) provides a holistic view of your portfolio's condition by combining multiple
              risk-adjusted performance metrics.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="font-mono text-primary font-semibold min-w-[60px]">40%</div>
                <div>
                  <div className="font-semibold">Sharpe Ratio</div>
                  <div className="text-sm text-muted-foreground">
                    Risk-adjusted return efficiency. Calculated as (Portfolio Return - Risk-free Rate) / Volatility.
                    Values &gt; 1.0 indicate good risk-adjusted performance.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-mono text-primary font-semibold min-w-[60px]">25%</div>
                <div>
                  <div className="font-semibold">Profit/Loss</div>
                  <div className="text-sm text-muted-foreground">
                    Total portfolio return percentage. Positive returns improve health score, but high returns with
                    excessive risk are penalized.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-mono text-primary font-semibold min-w-[60px]">20%</div>
                <div>
                  <div className="font-semibold">Max Drawdown</div>
                  <div className="text-sm text-muted-foreground">
                    Largest peak-to-trough decline in portfolio value. Lower drawdowns indicate better capital
                    preservation. Threshold: -25%.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-mono text-primary font-semibold min-w-[60px]">15%</div>
                <div>
                  <div className="font-semibold">Volatility</div>
                  <div className="text-sm text-muted-foreground">
                    Annualized standard deviation of daily returns. Lower volatility indicates more stable performance.
                    Threshold: 60%.
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground italic">
                Note: A portfolio can have high returns but low health score if risk metrics (volatility, drawdown,
                concentration) exceed safe thresholds.
              </p>
            </div>
          </Card>
        </section>

        {/* Risk Metrics */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Risk Metrics & Analysis
          </h2>
          <Card className="p-6 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Sharpe Ratio</h3>
                <p className="text-sm text-muted-foreground">
                  Measures return per unit of risk. Calculated using 90-day historical returns and volatility. Values
                  &gt; 1.0 are good, &gt; 2.0 are excellent.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Volatility</h3>
                <p className="text-sm text-muted-foreground">
                  Annualized standard deviation of daily returns over 90 days. Indicates price stability. Crypto typical
                  ranges: BTC ~50%, ETH ~60%, Altcoins 70-100%.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Max Drawdown</h3>
                <p className="text-sm text-muted-foreground">
                  Largest percentage decline from peak to trough in your portfolio history. Shows worst-case loss
                  scenario you've experienced.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Beta vs BTC</h3>
                <p className="text-sm text-muted-foreground">
                  Correlation coefficient with Bitcoin price movements. Beta &gt; 1 means more volatile than BTC, Beta
                  &lt; 1 means less volatile.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Auto Rebalancing */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Auto Rebalancing Advisor
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Intelligent rebalancing system that automatically detects portfolio drift and recommends optimal allocation adjustments.
            </p>
            <div className="space-y-3">
              <div>
                <div className="font-semibold">Portfolio Balance Score</div>
                <div className="text-sm text-muted-foreground">
                  Calculates deviation from optimal allocation. Scores below 70 indicate rebalancing is needed.
                </div>
              </div>
              <div>
                <div className="font-semibold">Rebalancing Recommendations</div>
                <div className="text-sm text-muted-foreground">
                  Provides specific buy/sell amounts for each asset to restore optimal allocation with minimal transaction costs.
                </div>
              </div>
              <div>
                <div className="font-semibold">Impact Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Shows expected risk reduction and performance improvement after rebalancing.
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* News Impact Analyzer */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            News Impact Analyzer
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Real-time news monitoring with sentiment analysis and portfolio impact scoring.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Data Sources</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Serper API - Google News aggregation for crypto-related articles</li>
                  <li>Jina API - Full article content extraction and analysis</li>
                  <li>Tavily API - Fallback search with enhanced relevance filtering</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Impact Scoring</h3>
                <p className="text-sm text-muted-foreground">
                  Impact scores (0-100%) combine sentiment analysis, source credibility, and your portfolio exposure to
                  affected assets. Critical news (&gt;80%) requires immediate attention.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Update Frequency</h3>
                <p className="text-sm text-muted-foreground">
                  News feed refreshes every 5 minutes to capture breaking developments. Articles are filtered for
                  relevance to your holdings.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Predictive Insights */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Predictive Insights
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Machine learning models analyze historical patterns and current market conditions to forecast portfolio
              performance and identify opportunities.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Portfolio Growth Forecast</h3>
                <p className="text-sm text-muted-foreground">
                  7-day price projection based on technical indicators, momentum analysis, and historical patterns from
                  50,000+ similar portfolios.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Market Regime Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Classifies current market as Bull, Bear, or Sideways using MA crossovers, RSI, volume trends, and
                  volatility. Predicts regime changes 7-14 days ahead.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Momentum Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Identifies assets showing strong bullish or bearish momentum using RSI, MACD, and volume analysis.
                  Suggests allocation adjustments.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Rebalancing Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Detects optimal rebalancing timing based on asset correlations, volatility patterns, and expected
                  risk-adjusted return improvements.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Portfolio Stress Testing */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Portfolio Stress Testing
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Simulates extreme market scenarios to assess portfolio resilience and prepare for black swan events.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Black Swan Event (-50% crash)</h3>
                <p className="text-sm text-muted-foreground">
                  Simulates sudden 50% market crash across all assets. Models recovery time based on 2020 COVID crash
                  and 2022 bear market patterns.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Correlation Breakdown</h3>
                <p className="text-sm text-muted-foreground">
                  Tests scenario where asset correlations break down and diversification fails. Calculates impact based
                  on individual asset volatilities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Liquidity Crisis</h3>
                <p className="text-sm text-muted-foreground">
                  Simulates exchange outages and inability to exit positions. Factors in slippage (10-20%) based on
                  order book depth analysis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Regulatory Shock</h3>
                <p className="text-sm text-muted-foreground">
                  Models impact of sudden regulatory changes. BTC/ETH less affected than altcoins due to regulatory
                  clarity and institutional adoption.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Natural Language Commands */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Natural Language Commands
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Control your portfolio using plain English commands. The system parses your intent, validates conditions,
              and executes actions automatically.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Command Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Commands are parsed using Llama 3.3 70B (Dobby) to extract intent, assets, actions, conditions, and
                  quantities with 90%+ accuracy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Supported Commands</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Conditional orders: "Sell 10% of AVAX if it drops below $30"</li>
                  <li>Price alerts: "Alert me when ETH reaches $4000"</li>
                  <li>Ratio triggers: "Notify when ETH/BTC ratio &gt; 0.06"</li>
                  <li>Rebalancing: "Rebalance to 40% BTC, 30% ETH, 30% alts"</li>
                  <li>Complex conditions: "Sell SOL if price &lt; $150 OR RSI &lt; 30"</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Execution Flow</h3>
                <p className="text-sm text-muted-foreground">
                  After confirmation, commands are monitored every 30 seconds. When conditions are met, actions execute
                  automatically with notifications sent to your dashboard.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Portfolio Optimization */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Portfolio Optimization
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              AI-powered portfolio optimization based on your risk profile. The system suggests optimal asset allocation to maximize risk-adjusted returns.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Risk Profiles</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from Conservative, Balanced, or Aggressive risk profiles. Each profile optimizes for different risk-return tradeoffs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Optimization Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzes current portfolio, calculates expected returns and risks, and suggests allocation changes to improve risk-adjusted performance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Performance Attribution</h3>
                <p className="text-sm text-muted-foreground">
                  Identifies which assets contributed most to your gains or losses, helping you understand portfolio performance drivers.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Data Sources */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            Data Sources
          </h2>
          <Card className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Price Data</h3>
                <p className="text-sm text-muted-foreground">
                  Multi-source price data with automatic fallback: Birdeye (Solana tokens), CoinGecko (all tokens), CoinMarketCap (backup). Updates every 30 seconds with 5-minute caching.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">News Research</h3>
                <p className="text-sm text-muted-foreground">
                  Serper API for Google News search, Jina API for content extraction (OpenDeepSearch), with Tavily as backup. Real-time sentiment analysis and portfolio impact scoring.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Historical Data</h3>
                <p className="text-sm text-muted-foreground">
                  CoinGecko API provides 90-day price history for performance analysis, risk metrics calculation, and predictive modeling.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Performance Attribution */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Performance Attribution
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Analyze which assets contributed most to your portfolio gains or losses, helping you understand performance drivers.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Contribution Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Shows each asset's contribution to total return, both in absolute dollar terms and percentage terms. Identifies top performers and underperformers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">P/L Breakdown</h3>
                <p className="text-sm text-muted-foreground">
                  Visual breakdown of profit/loss by asset with color-coded indicators. Helps identify which positions are driving portfolio performance.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Portfolio Comparison */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Portfolio Comparison
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Compare your portfolio performance against benchmarks and standard strategies to evaluate relative performance.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Benchmark Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Compare against BTC-only, ETH-only, or 60/40 BTC/ETH strategies. See how your portfolio outperforms or underperforms these benchmarks.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Time Range Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Select different time periods (7 days, 30 days, 90 days) to see how your portfolio compares over various market conditions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Outperformance Calculation</h3>
                <p className="text-sm text-muted-foreground">
                  Calculates exact percentage points of outperformance or underperformance relative to selected benchmarks.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Real-time Price Ticker */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            Real-time Price Ticker
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Live price updates for all your portfolio assets with instant notifications of significant price movements.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Live Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Prices update every 30 seconds automatically. See real-time price changes, 24h change percentages, and current values for each asset.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Price Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Visual indicators highlight significant price movements. Green for gains, red for losses, with percentage change displayed prominently.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Export & Snapshot */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Export & Portfolio Snapshots
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Export your portfolio data and save snapshots to track performance over time.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Export Formats</h3>
                <p className="text-sm text-muted-foreground">
                  Export portfolio data in JSON or CSV format. Includes all holdings, prices, values, and P/L calculations. Perfect for tax reporting or external analysis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Portfolio Snapshots</h3>
                <p className="text-sm text-muted-foreground">
                  Save snapshots of your portfolio at specific points in time. Compare current portfolio against historical snapshots to track evolution and performance changes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Snapshot Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Compare any two snapshots side-by-side to see exactly how your portfolio composition and value changed over time.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Opportunity Scanner */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Opportunity Scanner
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Automatically scan the market for investment opportunities based on technical indicators, momentum, and news sentiment.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Market Scanning</h3>
                <p className="text-sm text-muted-foreground">
                  Scans top cryptocurrencies for opportunities using momentum analysis, moving average signals, and volume patterns.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Opportunity Scoring</h3>
                <p className="text-sm text-muted-foreground">
                  Each opportunity receives a score (0-100) based on technical strength, momentum, news sentiment, and market conditions. Higher scores indicate stronger opportunities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Integration with News</h3>
                <p className="text-sm text-muted-foreground">
                  Opportunities are enhanced with recent news sentiment analysis. Positive news combined with strong technical signals creates higher-confidence opportunities.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Portfolio Advisor Chat */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Portfolio Advisor Chat
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Interactive chat interface to ask questions about your portfolio, get recommendations, and receive expert insights.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">How to Use</h3>
                <p className="text-sm text-muted-foreground">
                  Click the chat button (bottom-right corner) to open the Portfolio Advisor. Ask questions about your holdings, risk levels, diversification, or investment strategies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Portfolio Context</h3>
                <p className="text-sm text-muted-foreground">
                  The advisor automatically has access to your current portfolio data, so you can ask questions like "Why is my risk high?" or "What should I buy next?" and receive personalized answers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quick Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Use pre-configured quick questions for instant insights: "Why is my risk high?", "What should I buy next?", "How to improve diversification?", "Explain my portfolio health".
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Customizable Dashboard */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Customizable Dashboard
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Personalize your dashboard by enabling or disabling widgets, reordering them, and focusing on the metrics that matter most to you.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Widget Management</h3>
                <p className="text-sm text-muted-foreground">
                  Enable or disable any widget from the dashboard settings. Choose which information you want to see at a glance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Drag & Drop Reordering</h3>
                <p className="text-sm text-muted-foreground">
                  Reorder widgets by dragging them to your preferred positions. Your layout preferences are automatically saved.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Available Widgets</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Portfolio Overview - Total value and key metrics</li>
                  <li>AI Intelligence Center - Proactive recommendations</li>
                  <li>Predictive Analytics - Portfolio forecasts</li>
                  <li>Portfolio Comparison - Benchmark comparisons</li>
                  <li>Auto Rebalancing Advisor - Rebalancing recommendations</li>
                  <li>Performance Attribution - Asset contribution analysis</li>
                  <li>Portfolio Optimization - AI-driven optimization</li>
                  <li>News Impact - Real-time news analysis</li>
                  <li>Stress Testing - Scenario simulations</li>
                  <li>Opportunity Scanner - Market opportunities</li>
                  <li>Natural Language Commands - Voice and text commands</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Auto-Analysis System */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Automated Analysis System
          </h2>
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              The system runs continuous analysis without manual intervention, ensuring you always have up-to-date
              insights.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Auto-run on Load</h3>
                <p className="text-sm text-muted-foreground">
                  Full portfolio analysis executes automatically when you open the dashboard. No manual "Analyze" button
                  required.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Smart Refresh Schedule</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Price data: Every 30 seconds</li>
                  <li>News feed: Every 5 minutes</li>
                  <li>Risk metrics: Every 15 minutes</li>
                  <li>Full analysis: Every 30 minutes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Trigger-based Re-analysis</h3>
                <p className="text-sm text-muted-foreground">
                  System automatically re-analyzes when portfolio value changes &gt;5%, new alerts are detected, or
                  market regime shifts.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>Built by Kyozuro for Sentient</p>
          <p className="mt-2">Powered by ROMA Agent Framework + OpenDeepSearch</p>
        </div>
      </div>
    </div>
  )
}
