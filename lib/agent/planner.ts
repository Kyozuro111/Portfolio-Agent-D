export interface ROMAPlan {
  goal: string
  steps: Array<{
    name: string
    tool: string
    input: Record<string, any>
  }>
}

export async function executeROMAPlan(
  plan: ROMAPlan,
  tools: Record<string, any>,
  ctx: any,
): Promise<Record<string, any>> {
  const results: Record<string, any> = {}

  for (const step of plan.steps) {
    const tool = tools[step.tool]
    if (!tool) {
      throw new Error(`Tool ${step.tool} not found`)
    }

    const resolvedInput: Record<string, any> = {}
    for (const [key, value] of Object.entries(step.input)) {
      if (typeof value === "string" && value.startsWith("$")) {
        const refName = value.substring(1)
        resolvedInput[key] = results[refName]
      } else {
        resolvedInput[key] = value
      }
    }

    console.log(`[portfolio-agent] Executing step: ${step.name} with tool: ${step.tool}`)
    console.log(`[portfolio-agent] Tool input:`, JSON.stringify(resolvedInput).substring(0, 200))

    const result = await tool.run(resolvedInput, ctx)
    results[step.name] = result

    console.log(`[portfolio-agent] Tool result:`, JSON.stringify(result).substring(0, 200))
  }

  return results
}
