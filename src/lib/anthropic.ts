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
  "response": "A friendly, conversational message explaining your recommendations (2-3 sentences)",
  "recommendations": [
    {
      "name": "Technology Name",
      "category": "Framework|Database|Authentication|Hosting|UI Library|Tool",
      "url": "https://official-site.com",
      "description": "Brief one-line description (max 100 chars)",
      "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[technology].svg"
    }
  ],
  "claudePrompt": "A detailed, actionable prompt that the user can paste into Claude Code to build their project"
}

CLAUDE PROMPT RULES:
- Write a clear, specific prompt that Claude Code can execute
- Include the exact tech stack to use (based on your recommendations)
- Break down what needs to be built into 5-8 specific tasks
- Be detailed enough that Claude Code knows exactly what to create
- Include project setup, file structure, and key features
- Example: "Build a todo app using Next.js 15, TypeScript, and Prisma with PostgreSQL. Create: 1) A Next.js app with App Router 2) Prisma schema for todos with title, completed status, and timestamp 3) API routes for CRUD operations 4) A clean UI with Tailwind CSS showing todo list, add form, and delete buttons 5) Database connection setup with Neon PostgreSQL"

ICON GUIDELINES:
- Always include iconUrl for each recommendation
- Use https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[name].svg
- Use lowercase, no spaces (e.g., "nextdotjs" for Next.js, "postgresql" for PostgreSQL)
- Common icons: react, nextdotjs, typescript, nodejs, postgresql, mongodb, tailwindcss, vercel, stripe, supabase, firebase

Focus on modern, production-ready tools. Provide 5-8 specific recommendations.`

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
      claudePrompt: parsed.claudePrompt || null,
    }
  } catch (error) {
    console.error('Failed to parse Claude response:', content.text)
    console.error('Parse error:', error)
    // If JSON parsing fails, return a fallback response
    return {
      response: 'I can help you with your project. Could you provide more details about what you want to build?',
      recommendations: [],
      claudePrompt: null,
    }
  }
}
