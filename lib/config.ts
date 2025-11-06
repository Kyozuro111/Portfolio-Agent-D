export function getApiKey(name: string): string {
  if (typeof process !== "undefined" && process.env) {
    const envKey = process.env[name]
    if (envKey) return envKey
  }

  return ""
}
