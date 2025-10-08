import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subscriptionPlans } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))

    return NextResponse.json({
      success: true,
      plans,
    })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch subscription plans',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
