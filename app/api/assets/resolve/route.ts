import { type NextRequest, NextResponse } from "next/server"
import { AssetResolverTool } from "@/lib/agent/tools"
import { getUserKeys } from "@/lib/keys"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const chain = searchParams.get("chain")
    const address = searchParams.get("address")
    const userId = searchParams.get("userId") || "default"

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const userKeys = getUserKeys(userId)
    const ctx = { userKeys, userId }
    const tool = new AssetResolverTool()

    const asset = await tool.run({ symbol, chain, address }, ctx)

    return NextResponse.json(asset)
  } catch (error) {
    console.error("[portfolio-agent] Asset resolution error:", error)
    return NextResponse.json({ error: "Failed to resolve asset" }, { status: 500 })
  }
}
