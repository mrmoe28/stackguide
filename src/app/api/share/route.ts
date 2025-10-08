import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sharedRecommendations } from '@/lib/db/schema'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const createShareSchema = z.object({
  projectTitle: z.string().min(1, 'Project title is required'),
  projectDescription: z.string().optional(),
  recommendations: z.array(z.object({
    name: z.string(),
    category: z.string(),
    url: z.string().url(),
    description: z.string(),
    iconUrl: z.string().url().optional(),
  })).min(1, 'At least one recommendation is required'),
  claudePrompt: z.string().optional(),
  projectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createShareSchema.parse(body)

    // Generate a short, URL-friendly ID
    const shareId = nanoid(10)

    // Insert into database
    const [result] = await db
      .insert(sharedRecommendations)
      .values({
        id: shareId,
        projectTitle: validatedData.projectTitle,
        projectDescription: validatedData.projectDescription || null,
        recommendations: validatedData.recommendations,
        claudePrompt: validatedData.claudePrompt || null,
        projectId: validatedData.projectId || null,
        userId: validatedData.userId || null,
        viewCount: 0,
        metadata: {},
      })
      .returning()

    return NextResponse.json({
      success: true,
      shareId: result.id,
      shareUrl: `${request.nextUrl.origin}/share/${result.id}`,
    })
  } catch (error) {
    console.error('Error creating share:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    )
  }
}
