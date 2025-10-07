import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, recommendations, projects } from '@/lib/db'
import { eq } from 'drizzle-orm'

const saveRecommendationSchema = z.object({
  userId: z.string().uuid(),
  recommendation: z.object({
    name: z.string(),
    category: z.string(),
    url: z.string().url(),
    description: z.string(),
    iconUrl: z.string().url().optional(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = saveRecommendationSchema.parse(body)

    // Get or create a default project for the user
    let [userProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, validatedData.userId))
      .limit(1)

    if (!userProject) {
      ;[userProject] = await db
        .insert(projects)
        .values({
          userId: validatedData.userId,
          name: 'My Tech Stack',
          description: 'AI-recommended technologies',
        })
        .returning()
    }

    // Save recommendation
    const [savedRecommendation] = await db
      .insert(recommendations)
      .values({
        projectId: userProject.id,
        name: validatedData.recommendation.name,
        category: validatedData.recommendation.category,
        url: validatedData.recommendation.url,
        description: validatedData.recommendation.description,
        iconUrl: validatedData.recommendation.iconUrl,
      })
      .returning()

    return NextResponse.json({
      success: true,
      recommendation: savedRecommendation,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Save recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to save recommendation' },
      { status: 500 }
    )
  }
}
