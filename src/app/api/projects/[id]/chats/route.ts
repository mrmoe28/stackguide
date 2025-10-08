import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { chats, projects } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params

    // Verify the project belongs to the user
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, params.id),
          eq(projects.userId, session.user.id)
        )
      )
      .limit(1)

    if (!project || project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Fetch all chats for this project
    const projectChats = await db
      .select()
      .from(chats)
      .where(eq(chats.projectId, params.id))
      .orderBy(desc(chats.createdAt))

    return NextResponse.json({
      success: true,
      project: project[0],
      chats: projectChats
    })
  } catch (error) {
    console.error('Error fetching project chats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
