import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getStackRecommendations(userMessage: string) {
  const systemPrompt = `You are a tech stack advisor. When a user describes their project, analyze their requirements and recommend appropriate frameworks, tools, and technologies.

IMPORTANT: You MUST return ONLY valid JSON, nothing else. No markdown, no code blocks, just raw JSON.

Return this exact JSON structure:
{
  "response": "A friendly, conversational message explaining your recommendations",
  "recommendations": [
    {
      "name": "Technology Name",
      "category": "Framework|Database|Authentication|Hosting|UI Library",
      "url": "https://official-site.com",
      "description": "Brief one-line description (max 100 chars)"
    }
  ]
}

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
    // Remove any markdown code block formatting if present
    let jsonText = content.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonText)
    return {
      response: parsed.response || 'Here are my recommendations for your project.',
      recommendations: parsed.recommendations || [],
    }
  } catch {
    console.error('Failed to parse Claude response:', content.text)
    // If JSON parsing fails, return a fallback response
    return {
      response: 'I can help you with your project. Could you provide more details about what you want to build?',
      recommendations: [],
    }
  }
}
