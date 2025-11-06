import type { NextRequest } from "next/server"
import type { AgentEvent } from "@/lib/types"
import { AssetResolverTool, PricesTool, HistoryTool, RebalanceTool } from "@/lib/agent/tools"
import { getUserKeys } from "@/lib/keys"
import { normalizeHoldings, validateMinimumAssets } from "@/lib/normalize"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  const requestId = uuidv4()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: AgentEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      try {
        const body = await request.json()
        const { portfolio, constraints, userId = "default" } = body

        let holdings: Record<string, number>
        try {
          holdings = normalizeHoldings(portfolio.holdings)
        } catch (error) {
          sendEvent({
            type: "error",
            step: "validation",
            message: error instanceof Error ? error.message : "Invalid input",
            timestamp: Date.now(),
          })
          controller.close()
          return
        }

        const symbols = Object.keys(holdings)
        if (symbols.length === 0) {
          sendEvent({
            type: "error",
            step: "validation",
            message: "No holdings provided",
            timestamp: Date.now(),
          })
          controller.close()
          return
        }

        console.log(`[INFO] [requestId=${requestId}] step=start symbols=${symbols.join(",")} userId=${userId}`)

        const userKeys = getUserKeys(userId)
        const ctx = { userKeys, userId }

        sendEvent({
          type: "progress",
          step: "start",
          message: "Starting rebalance analysis...",
          timestamp: Date.now(),
        })

        sendEvent({
          type: "progress",
          step: "resolve_assets",
          message: "Resolving asset identifiers...",
          timestamp: Date.now(),
        })

        const resolverTool = new AssetResolverTool()
        const startResolve = Date.now()
        for (const symbol of symbols) {
          try {
            await resolverTool.run({ symbol }, ctx)
          } catch (error) {
            console.log(`[WARN] [requestId=${requestId}] step=resolve symbol=${symbol} error=${error}`)
          }
        }
        console.log(`[INFO] [requestId=${requestId}] step=resolve ms=${Date.now() - startResolve}`)

        sendEvent({
          type: "progress",
          step: "fetch_prices",
          message: "Fetching current prices...",
          timestamp: Date.now(),
        })

        const pricesTool = new PricesTool()
        const startPrices = Date.now()
        let pricesResult
        try {
          pricesResult = await pricesTool.run({ symbols }, ctx)
          console.log(
            `[INFO] [requestId=${requestId}] step=prices provider=cg hit=${Object.values(pricesResult.data).filter((p) => p != null).length} miss=${Object.values(pricesResult.data).filter((p) => p == null).length} stale=${pricesResult.stale || false} ms=${Date.now() - startPrices}`,
          )
        } catch (error) {
          console.log(`[ERROR] [requestId=${requestId}] step=prices error=${error}`)
          sendEvent({
            type: "error",
            step: "fetch_prices",
            message: "Failed to fetch prices",
            timestamp: Date.now(),
          })
          controller.close()
          return
        }

        sendEvent({
          type: "progress",
          step: "fetch_history",
          message: "Fetching historical data...",
          timestamp: Date.now(),
        })

        const historyTool = new HistoryTool()
        const startHistory = Date.now()
        let historyResult
        try {
          historyResult = await historyTool.run({ symbols, windowDays: 90 }, ctx)
          console.log(`[INFO] [requestId=${requestId}] step=history ms=${Date.now() - startHistory}`)
        } catch (error) {
          console.log(`[WARN] [requestId=${requestId}] step=history code=HISTORY_FETCH_FAILED using=stale cache=true`)
          sendEvent({
            type: "error",
            step: "fetch_history",
            message: "Failed to fetch history",
            timestamp: Date.now(),
          })
          controller.close()
          return
        }

        const validation = validateMinimumAssets(symbols, pricesResult.data, historyResult.data, 3, 60)

        if (validation.eligible.length < 3) {
          sendEvent({
            type: "complete",
            step: "complete",
            message: "Insufficient data for rebalancing",
            data: {
              targetWeights: {},
              actions: [],
              notes: [`Insufficient eligible assets (${validation.eligible.length}/3)`, ...validation.notes],
            },
            timestamp: Date.now(),
          })
          controller.close()
          return
        }

        sendEvent({
          type: "progress",
          step: "optimize",
          message: "Optimizing portfolio allocation...",
          timestamp: Date.now(),
        })

        const rebalanceTool = new RebalanceTool()
        const startRebalance = Date.now()
        let rebalanceOutput
        try {
          rebalanceOutput = await rebalanceTool.run(
            {
              holdings,
              prices: pricesResult.data,
              history: historyResult.data,
              constraints: constraints || {
                minTradeUSD: 100,
                maxTurnoverPct: 30,
                feeBps: 10,
                maxWeight: 0.35,
              },
            },
            ctx,
          )
          console.log(`[INFO] [requestId=${requestId}] step=rebalance ms=${Date.now() - startRebalance}`)
        } catch (error) {
          console.log(`[ERROR] [requestId=${requestId}] step=rebalance code=REBALANCE_FAILED detail=${error}`)
          sendEvent({
            type: "error",
            step: "optimize",
            message: "Failed to optimize portfolio",
            timestamp: Date.now(),
          })
          controller.close()
          return
        }

        rebalanceOutput.notes = [...validation.notes, ...rebalanceOutput.notes]

        sendEvent({
          type: "complete",
          step: "complete",
          message: "Rebalance plan generated",
          data: rebalanceOutput,
          timestamp: Date.now(),
        })

        console.log(`[INFO] [requestId=${requestId}] step=complete actions=${rebalanceOutput.actions.length}`)
        controller.close()
      } catch (error) {
        console.log(`[ERROR] [requestId=${requestId}] step=error detail=${error}`)
        sendEvent({
          type: "error",
          step: "error",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: Date.now(),
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
