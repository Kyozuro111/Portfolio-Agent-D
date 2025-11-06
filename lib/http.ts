interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
}

export async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 10000, retries = 2, ...fetchOptions } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries) {
          const backoff = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000)
          await new Promise((resolve) => setTimeout(resolve, backoff))
          continue
        }
      }

      return response
    } catch (error) {
      lastError = error as Error

      if (attempt < retries) {
        const backoff = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000)
        await new Promise((resolve) => setTimeout(resolve, backoff))
        continue
      }
    }
  }

  throw lastError || new Error("Fetch failed after retries")
}
