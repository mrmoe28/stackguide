import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getStackRecommendations(userMessage: string) {
  const systemPrompt = `You are a tech stack advisor. When a user describes their project, analyze their requirements and recommend appropriate frameworks, tools, and technologies.

CRITICAL: You MUST return ONLY valid JSON, nothing else. No markdown, no code blocks, no explanatory text before or after - just raw JSON.

EVEN IF THE USER ASKS FOR "MORE DETAILS" OR "MORE INFORMATION":
- Put all your explanations in the "response" field
- Make the "response" field longer and more detailed
- Make the "claudePrompt" field more comprehensive with step-by-step instructions
- But STILL return only JSON, nothing else

Return this exact JSON structure:
{
  "response": "A friendly, conversational message explaining your recommendations. If user asks for more details, make this 4-6 sentences with deeper explanations of why each technology was chosen and how they work together.",
  "recommendations": [
    {
      "name": "Technology Name",
      "category": "Framework|Database|Authentication|Hosting|UI Library|Tool",
      "url": "https://official-site.com",
      "description": "Brief one-line description (max 100 chars)",
      "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[technology].svg"
    }
  ],
  "claudePrompt": "A detailed, actionable prompt that the user can paste into Claude Code. If user asks for more details, expand this to 10-15 specific numbered steps with file paths, code examples, and configuration details."
}

CLAUDE PROMPT RULES:
- Write a clear, specific prompt that Claude Code can execute
- Include the exact tech stack to use (based on your recommendations)
- Break down what needs to be built into specific tasks (5-8 for basic, 10-15 for detailed)
- Be detailed enough that Claude Code knows exactly what to create
- Include project setup, file structure, and key features
- When user asks for "more details", add specific implementation steps like:
  * Exact file paths to create (e.g., "Create src/app/api/auth/[...nextauth]/route.ts")
  * Configuration snippets (e.g., "Add these environment variables: DATABASE_URL, NEXTAUTH_SECRET")
  * Setup commands (e.g., "Run: npx prisma init && npx prisma db push")
  * Code structure hints (e.g., "Use React Server Components for data fetching, Client Components for interactivity")
- Example basic: "Build a todo app using Next.js 15, TypeScript, and Prisma with PostgreSQL. Create: 1) A Next.js app with App Router 2) Prisma schema for todos 3) API routes for CRUD 4) UI with Tailwind CSS"
- Example detailed: "Build a todo app using Next.js 15, TypeScript, and Prisma with PostgreSQL. Setup: 1) Create Next.js app: 'npx create-next-app@latest --typescript --tailwind --app' 2) Install Prisma: 'npm i @prisma/client && npm i -D prisma' 3) Init Prisma: 'npx prisma init' 4) Create schema in prisma/schema.prisma with Todo model (id, title, completed, createdAt) 5) Create src/lib/prisma.ts for client 6) Create API routes in src/app/api/todos/route.ts with GET/POST 7) Create src/app/api/todos/[id]/route.ts with PUT/DELETE 8) Create src/app/page.tsx with form and todo list 9) Add Tailwind UI components 10) Setup env vars and run 'npx prisma db push'"

ICON GUIDELINES:
- Always include iconUrl for each recommendation
- Use https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[name].svg
- Use lowercase, no spaces (e.g., "nextdotjs" for Next.js, "postgresql" for PostgreSQL)
- Common icons: react, nextdotjs, typescript, nodejs, postgresql, mongodb, tailwindcss, vercel, stripe, supabase, firebase

Focus on modern, production-ready tools. Provide 5-8 specific recommendations.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000, // Increased to handle detailed responses
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

    // Try to extract JSON from the response if there's extra text
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    // If response contains both text and JSON, try to extract just the JSON
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
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

    // If JSON parsing fails, try to provide a helpful response
    // Check if the AI provided text that we can use
    const responseText = content.text.trim()
    if (responseText.length > 0 && responseText.length < 1000) {
      // If the response is reasonably short, return it as-is with empty recommendations
      return {
        response: responseText,
        recommendations: [],
        claudePrompt: null,
      }
    }

    // Otherwise use fallback
    return {
      response: 'I encountered an issue formatting the response. Could you rephrase your question or describe your project in a different way?',
      recommendations: [],
      claudePrompt: null,
    }
  }
}
