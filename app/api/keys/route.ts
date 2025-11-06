import { type NextRequest, NextResponse } from "next/server"
import { storeUserKeys, getConfiguredKeys } from "@/lib/keys"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = "default", keys } = body

    if (!keys || typeof keys !== "object") {
      return NextResponse.json({ error: "Invalid keys object" }, { status: 400 })
    }

    storeUserKeys(userId, keys)

    return NextResponse.json({
      success: true,
      message: "API keys stored securely",
    })
  } catch (error) {
    console.error("[portfolio-agent] Error storing keys:", error)
    return NextResponse.json({ error: "Failed to store keys" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default"

    const configured = getConfiguredKeys(userId)

    return NextResponse.json({ configured })
  } catch (error) {
    console.error("[portfolio-agent] Error retrieving keys:", error)
    return NextResponse.json({ error: "Failed to retrieve keys" }, { status: 500 })
  }
}
