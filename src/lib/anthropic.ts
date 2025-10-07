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
      "category": "Framework|Database|Authentication|Hosting|UI Library|Tool",
      "url": "https://official-site.com",
      "description": "Brief one-line description (max 100 chars)",
      "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[technology].svg"
    }
  ],
  "boilerplate": {
    "projectName": "suggested-project-name",
    "description": "Brief project description",
    "files": [
      {
        "path": "package.json",
        "content": "{\n  \"name\": \"project-name\",\n  \"version\": \"1.0.0\"\n}",
        "language": "json"
      },
      {
        "path": "README.md",
        "content": "# Project Name\\n\\nProject description",
        "language": "markdown"
      },
      {
        "path": "src/app/page.tsx",
        "content": "export default function Home() {\\n  return <div>Hello World</div>\\n}",
        "language": "typescript"
      }
    ],
    "setup": [
      "npm install",
      "npm run dev"
    ]
  }
}

BOILERPLATE GENERATION RULES:
- Generate 5-8 essential files to get started (package.json, tsconfig.json, main entry files, README)
- Include proper dependencies in package.json based on recommended stack
- Create minimal working examples, not full implementations
- Include setup instructions (installation and run commands)
- Use proper file extensions (.ts, .tsx, .js, .jsx, .json, .md, .env.example)
- Follow modern best practices for each technology
- Keep code clean and well-commented

ICON GUIDELINES:
- Always include iconUrl for each recommendation
- Use https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[name].svg
- Use lowercase, no spaces (e.g., "nextdotjs" for Next.js, "postgresql" for PostgreSQL)
- Common icons: react, nextdotjs, typescript, nodejs, postgresql, mongodb, tailwindcss, vercel, stripe, supabase, firebase

Focus on modern, production-ready tools. Limit to 5-8 recommendations.`

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
      boilerplate: parsed.boilerplate || null,
    }
  } catch {
    console.error('Failed to parse Claude response:', content.text)
    // If JSON parsing fails, return a fallback response
    return {
      response: 'I can help you with your project. Could you provide more details about what you want to build?',
      recommendations: [],
      boilerplate: null,
    }
  }
}
