import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStackRecommendations } from '@/lib/anthropic'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { projects, chats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  projectId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = chatSchema.parse(body)

    // Get AI recommendations
    const result = await getStackRecommendations(validatedData.message)

    let projectId = validatedData.projectId

    // If no projectId provided, create a new project
    if (!projectId) {
      // Extract project name from first few words of message
      const projectName = validatedData.message
        .split(' ')
        .slice(0, 6)
        .join(' ')
        .substring(0, 100)

      const [newProject] = await db
        .insert(projects)
        .values({
          userId: session.user.id,
          name: projectName,
          description: validatedData.message,
          lastMessageAt: new Date(),
        })
        .returning()

      projectId = newProject.id
    } else {
      // Update existing project's lastMessageAt
      await db
        .update(projects)
        .set({ lastMessageAt: new Date() })
        .where(eq(projects.id, projectId))
    }

    // Save chat to database
    await db.insert(chats).values({
      userId: session.user.id,
      projectId: projectId,
      message: validatedData.message,
      response: result.response,
      recommendations: result.recommendations,
    })

    return NextResponse.json({
      response: result.response,
      recommendations: result.recommendations,
      claudePrompt: result.claudePrompt,
      projectId: projectId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Chat API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
