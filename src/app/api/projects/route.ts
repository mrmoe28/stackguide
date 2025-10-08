import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { projects, chats } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Get authenticated user
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's projects with their last chat message
    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        lastMessageAt: projects.lastMessageAt,
        createdAt: projects.createdAt,
        lastMessage: sql<string>`(
          SELECT ${chats.message}
          FROM ${chats}
          WHERE ${chats.projectId} = ${projects.id}
          ORDER BY ${chats.createdAt} DESC
          LIMIT 1
        )`,
      })
      .from(projects)
      .where(eq(projects.userId, session.user.id))
      .orderBy(desc(projects.lastMessageAt), desc(projects.createdAt))
      .limit(20)

    return NextResponse.json({
      projects: userProjects,
    })
  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
