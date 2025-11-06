import { type NextRequest, NextResponse } from "next/server"
import { PricesTool, AssetResolverTool } from "@/lib/agent/tools"
import { getUserKeys } from "@/lib/keys"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get("symbols")
    const userId = searchParams.get("userId") || "default"

    if (!symbolsParam) {
      return NextResponse.json(
        { error: { code: "MISSING_PARAM", detail: "Symbols parameter is required" } },
        { status: 400 },
      )
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase())

    // Get keys from environment variables only
    const userKeys = getUserKeys(userId)
    const ctx = { userKeys, userId }

    const resolver = new AssetResolverTool()
    const resolvePromises = symbols.map((symbol) => resolver.run({ symbol }, ctx))
    await Promise.all(resolvePromises)

    const tool = new PricesTool()
    const result = await tool.run({ symbols }, ctx)

    const formattedPrices: Record<string, { usd: number; usd_24h_change?: number }> = {}

    for (const [symbol, price] of Object.entries(result.data)) {
      if (price !== null) {
        formattedPrices[symbol] = {
          usd: price,
          usd_24h_change: 0, // We don't have 24h change data yet
        }
      }
    }

    return NextResponse.json({ prices: formattedPrices, stale: result.stale })
  } catch (error) {
    console.error("[portfolio-agent] Price fetch error:", error)
    return NextResponse.json(
      { error: { code: "PRICE_FETCH_FAILED", detail: error instanceof Error ? error.message : "Unknown error" } },
      { status: 500 },
    )
  }
}
