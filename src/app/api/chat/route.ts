import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStackRecommendations } from '@/lib/anthropic'

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = chatSchema.parse(body)

    // Get AI recommendations
    const result = await getStackRecommendations(validatedData.message)

    return NextResponse.json({
      response: result.response,
      recommendations: result.recommendations,
      boilerplate: result.boilerplate,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
