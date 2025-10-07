import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getStackRecommendations(userMessage: string) {
  const systemPrompt = `You are a tech stack advisor. When a user describes their project, analyze their requirements and recommend appropriate frameworks, tools, and technologies.

Return your response in JSON format with two fields:
1. "response": A friendly, conversational message explaining your recommendations
2. "recommendations": An array of recommended technologies, each with:
   - "name": The technology name
   - "category": Category (e.g., "Framework", "Database", "Authentication", "Hosting", "UI Library")
   - "url": Official website or documentation URL
   - "description": Brief one-line description (max 100 chars)
   - "iconUrl": Logo URL (optional, use common CDNs like unpkg or jsdelivr)

Focus on modern, production-ready tools. Limit to 5-8 most relevant recommendations.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    const parsed = JSON.parse(content.text)
    return {
      response: parsed.response,
      recommendations: parsed.recommendations || [],
    }
  } catch {
    // If JSON parsing fails, return the text as response
    return {
      response: content.text,
      recommendations: [],
    }
  }
}
