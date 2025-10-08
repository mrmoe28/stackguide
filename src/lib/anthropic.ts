import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getStackRecommendations(userMessage: string) {
  const systemPrompt = `You are an expert tech stack advisor specializing in modern web development. Your job is to understand what the user wants to build and recommend the perfect technology stack.

UNDERSTAND THE PROJECT:
- Analyze the user's description, no matter how they phrase it
- Identify the project type (e.g., social media, e-commerce, blog, SaaS, mobile app, etc.)
- Understand key features (user auth, file uploads, real-time features, payments, etc.)
- Consider scalability, performance, and developer experience

RESPONSE FORMAT - CRITICAL:
You MUST respond with ONLY a valid JSON object. No other text, no markdown, no code blocks.

{
  "response": "A friendly 2-4 sentence explanation of your recommendations and why they fit this project",
  "recommendations": [
    {
      "name": "Technology Name",
      "category": "Framework|Database|Authentication|Hosting|UI Library|State Management|File Storage|Real-time|Payment|Other",
      "url": "https://official-website.com",
      "description": "One-line description (max 100 chars)",
      "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[tech-name].svg"
    }
  ],
  "claudePrompt": "A complete, actionable prompt for Claude Code with 6-10 numbered steps covering setup, implementation, and deployment"
}

TECH STACK SELECTION GUIDE:
- Social Media/User Content Apps → Next.js 15 + Supabase/Firebase + Cloudinary/UploadThing + Vercel
- E-commerce → Next.js 15 + Stripe + PostgreSQL (Neon/Supabase) + Vercel
- Real-time Apps (Chat, Collaboration) → Next.js 15 + Supabase + WebSockets/Pusher + Vercel
- SaaS → Next.js 15 + PostgreSQL + NextAuth + Stripe + Vercel
- Blogs/Content → Next.js 15 + MDX + Tailwind + Vercel
- Mobile → React Native + Expo + Supabase/Firebase

CATEGORIES TO ALWAYS INCLUDE:
1. Framework (Next.js 15, React, etc.)
2. Database (PostgreSQL via Neon/Supabase, MongoDB, Firebase, etc.)
3. Styling (Tailwind CSS, shadcn/ui, etc.)
4. Hosting (Vercel, Railway, Fly.io, etc.)
5. Additional based on features:
   - Authentication → NextAuth, Clerk, Supabase Auth
   - File Upload → Cloudinary, UploadThing, AWS S3
   - Payments → Stripe
   - Real-time → Supabase, Pusher, Socket.io

CLAUDE PROMPT FORMAT:
"Build a [project type] using [main tech stack]. Create: 1) [Setup step with commands] 2) [Database/schema setup] 3) [Core feature implementation] 4) [UI components] 5) [Authentication if needed] 6) [File upload if needed] 7) [API routes] 8) [Deployment configuration]"

ICON URL RULES:
- Use: https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/[name].svg
- Common names: nextdotjs, react, typescript, postgresql, mongodb, tailwindcss, vercel, supabase, firebase, stripe, cloudinary, prisma, drizzle

EXAMPLES:

User: "reddit clone with photo uploads"
Response JSON:
{
  "response": "For a Reddit-like social platform with photo uploads, I recommend Next.js 15 for the full-stack framework, Supabase for database and auth, Cloudinary for image hosting, and Vercel for deployment. This stack gives you real-time features, scalable file storage, and great performance.",
  "recommendations": [
    {"name": "Next.js 15", "category": "Framework", "url": "https://nextjs.org", "description": "Full-stack React framework with App Router and Server Components", "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/nextdotjs.svg"},
    {"name": "Supabase", "category": "Database", "url": "https://supabase.com", "description": "PostgreSQL database with real-time subscriptions and authentication", "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/supabase.svg"},
    {"name": "Cloudinary", "category": "File Storage", "url": "https://cloudinary.com", "description": "Image and video upload, storage, and transformation", "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/cloudinary.svg"},
    {"name": "Tailwind CSS", "category": "UI Library", "url": "https://tailwindcss.com", "description": "Utility-first CSS framework for rapid UI development", "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tailwindcss.svg"},
    {"name": "shadcn/ui", "category": "UI Library", "url": "https://ui.shadcn.com", "description": "Beautifully designed React components built with Radix UI", "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/shadcnui.svg"},
    {"name": "Vercel", "category": "Hosting", "url": "https://vercel.com", "description": "Optimal hosting platform for Next.js applications", "iconUrl": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/vercel.svg"}
  ],
  "claudePrompt": "Build a Reddit-style social media app with photo uploads using Next.js 15, Supabase, and Cloudinary. Create: 1) Next.js app with 'npx create-next-app@latest --typescript --tailwind --app' 2) Setup Supabase project and install client 'npm i @supabase/supabase-js' 3) Create database schema for users, posts, comments, and votes 4) Setup Cloudinary account and install 'npm i cloudinary next-cloudinary' 5) Implement auth with Supabase Auth (signup, login, session management) 6) Build post creation with image upload to Cloudinary 7) Create feed with infinite scroll and voting system 8) Add comment threads with real-time updates 9) Deploy to Vercel with environment variables"
}

REMEMBER: Output ONLY the JSON object, nothing else. Be helpful and accurate.`

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
    let jsonText = content.text.trim()

    // Step 1: Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    // Step 2: Try to extract JSON object from the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    // Step 3: Parse the JSON
    const parsed = JSON.parse(jsonText)

    // Step 4: Validate the response has required fields
    if (!parsed.response || !Array.isArray(parsed.recommendations)) {
      console.error('Invalid response structure:', parsed)
      throw new Error('Missing required fields in response')
    }

    return {
      response: parsed.response,
      recommendations: parsed.recommendations,
      claudePrompt: parsed.claudePrompt || null,
    }
  } catch (error) {
    // Log the full error for debugging
    console.error('==== ANTHROPIC API ERROR ====')
    console.error('User message:', userMessage)
    console.error('Raw response:', content.text.substring(0, 500))
    console.error('Parse error:', error)
    console.error('============================')

    // If the AI provided a reasonable text response, use it
    const responseText = content.text.trim()
    if (responseText.length > 0 && responseText.length < 1000 && !responseText.includes('{')) {
      return {
        response: responseText,
        recommendations: [],
        claudePrompt: null,
      }
    }

    // Otherwise return a helpful fallback
    return {
      response: 'I understand you want to build something interesting! Could you describe your project idea in a bit more detail? For example: "I want to build a social media app where users can share photos" or "I need an e-commerce site with payment processing."',
      recommendations: [],
      claudePrompt: null,
    }
  }
}
