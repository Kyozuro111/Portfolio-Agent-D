export interface LLMResponse {
  insights: string[]
  actions: Array<{
    action: string
    pros: string[]
    cons: string[]
  }>
  assumptions: string[]
  constraints: string[]
}

export class LLMAgent {
  private apiKey: string
  private model: string
  private provider: "fireworks" | "groq" | "openrouter" | "aiml"

  constructor(
    apiKey: string,
    model = "accounts/fireworks/models/llama-v3p1-70b-instruct",
    provider: "fireworks" | "groq" | "openrouter" | "aiml" = "fireworks",
  ) {
    this.apiKey = apiKey
    this.model = model
    this.provider = provider
  }

  async analyze(context: any): Promise<LLMResponse> {
    const systemPrompt = `You are a portfolio analysis AI. You MUST respond with ONLY valid JSON in this exact format:

{
  "insights": ["insight 1", "insight 2"],
  "actions": [
    {
      "action": "action description",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"]
    }
  ],
  "assumptions": ["assumption 1"],
  "constraints": ["constraint 1"]
}

DO NOT include any text before or after the JSON. DO NOT wrap in markdown code blocks. Return ONLY the raw JSON object.`

    try {
      console.log(`[portfolio-agent] LLM request to ${this.provider} with model:`, this.model)

      const { endpoint, headers, body } = this.getProviderConfig(systemPrompt, context)

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[portfolio-agent] ${this.provider} API error response:`, errorText)
        throw new Error(`LLM API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      let content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No response from LLM")
      }

      content = this.extractJSON(content)

      const parsed = JSON.parse(content)

      if (!this.validateResponse(parsed)) {
        throw new Error("Invalid LLM response format")
      }

      console.log(`[portfolio-agent] ${this.provider} analysis successful`)
      return parsed
    } catch (error) {
      console.error(`[portfolio-agent] ${this.provider} analysis failed:`, error)
      return this.getFallbackResponse()
    }
  }

  async chat(prompt: string): Promise<string> {
    try {
      console.log(`[portfolio-agent] LLM chat request to ${this.provider}`)

      const { endpoint, headers, body } = this.getChatProviderConfig(prompt)

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[portfolio-agent] ${this.provider} chat API error:`, errorText)
        throw new Error(`LLM API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No response from LLM")
      }

      console.log(`[portfolio-agent] ${this.provider} chat successful`)
      return content
    } catch (error) {
      console.error(`[portfolio-agent] ${this.provider} chat failed:`, error)
      return "I apologize, but I'm having trouble processing your request right now. Please try again or check your API configuration."
    }
  }

  private getProviderConfig(systemPrompt: string, context: any) {
    const baseMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(context) },
    ]

    switch (this.provider) {
      case "fireworks":
        return {
          endpoint: "https://api.fireworks.ai/inference/v1/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: {
            model: this.model,
            messages: baseMessages,
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: "json_object" },
          },
        }

      case "groq":
        return {
          endpoint: "https://api.groq.com/openai/v1/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: {
            model: this.model || "llama-3.3-70b-versatile",
            messages: baseMessages,
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: "json_object" },
          },
        }

      case "openrouter":
        return {
          endpoint: "https://openrouter.ai/api/v1/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://portfolio-agent.vercel.app",
            "X-Title": "Portfolio Agent",
          },
          body: {
            model: this.model || "meta-llama/llama-3.1-70b-instruct",
            messages: baseMessages,
            temperature: 0.3,
            max_tokens: 2000,
          },
        }

      case "aiml":
        return {
          endpoint: "https://api.aimlapi.com/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: {
            model: this.model || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages: baseMessages,
            temperature: 0.3,
            max_tokens: 2000,
          },
        }

      default:
        throw new Error(`Unsupported provider: ${this.provider}`)
    }
  }

  private getChatProviderConfig(prompt: string) {
    const messages = [
      {
        role: "system",
        content:
          "You are an expert crypto portfolio advisor. Provide helpful, concise responses (2-3 sentences). Focus on actionable insights.",
      },
      { role: "user", content: prompt },
    ]

    switch (this.provider) {
      case "fireworks":
        return {
          endpoint: "https://api.fireworks.ai/inference/v1/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: {
            model: this.model,
            messages,
            temperature: 0.7,
            max_tokens: 500,
          },
        }

      case "groq":
        return {
          endpoint: "https://api.groq.com/openai/v1/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: {
            model: this.model || "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 500,
          },
        }

      case "openrouter":
        return {
          endpoint: "https://openrouter.ai/api/v1/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://portfolio-agent.vercel.app",
            "X-Title": "Portfolio Agent",
          },
          body: {
            model: this.model || "meta-llama/llama-3.1-70b-instruct",
            messages,
            temperature: 0.7,
            max_tokens: 500,
          },
        }

      case "aiml":
        return {
          endpoint: "https://api.aimlapi.com/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: {
            model: this.model || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages,
            temperature: 0.7,
            max_tokens: 500,
          },
        }

      default:
        throw new Error(`Unsupported provider: ${this.provider}`)
    }
  }

  private extractJSON(content: string): string {
    const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
    if (codeBlockMatch) {
      return codeBlockMatch[1]
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }

    return content
  }

  private validateResponse(response: any): boolean {
    return (
      response &&
      Array.isArray(response.insights) &&
      Array.isArray(response.actions) &&
      Array.isArray(response.assumptions) &&
      Array.isArray(response.constraints)
    )
  }

  private getFallbackResponse(): LLMResponse {
    return {
      insights: [
        "Portfolio analysis completed using quantitative metrics",
        "Review the risk metrics and alerts for detailed insights",
        "Consider diversifying concentrated positions",
      ],
      actions: [
        {
          action: "Review portfolio concentration",
          pros: ["Identify overweight positions", "Reduce single-asset risk"],
          cons: ["May require rebalancing costs"],
        },
      ],
      assumptions: ["LLM analysis unavailable, using rule-based insights"],
      constraints: ["Limited to quantitative analysis only"],
    }
  }
}
