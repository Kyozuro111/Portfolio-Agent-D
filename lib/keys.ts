const SUPPORTED_KEYS = [
  "COINGECKO_API_KEY",
  "COINMARKETCAP_API_KEY",
  "BIRDEYE_API_KEY",
  "DEXSCREENER_API_KEY",
  "CRYPTOCOMPARE_API_KEY",
  "MESSARI_API_KEY",
  "LUNARCRUSH_TOKEN",
  "SERPER_API_KEY",
  "TAVILY_API_KEY",
  "JINA_API_KEY",
  "FIREWORKS_API_KEY",
  "GROQ_API_KEY",
  "OPENROUTER_API_KEY",
  "ETH_API_KEY",
  "SOL_API_KEY",
  "AIML_API_KEY",
]

/**
 * Get API keys from environment variables only.
 * Keys are configured via environment variables when deploying.
 * No hardcoded keys - safe for public GitHub repositories.
 */
export function getUserKeys(userId = "default"): Map<string, string> {
  const keys = new Map<string, string>()

  // Only read from environment variables (server-side)
  if (typeof process !== "undefined" && process.env) {
  for (const key of SUPPORTED_KEYS) {
    const envValue = process.env[key]
    if (envValue) {
      keys.set(key, envValue)
      }
    }
  }

  return keys
}

export function getKeys(userId = "default"): Map<string, string> {
  return getUserKeys(userId)
}

export { SUPPORTED_KEYS }
