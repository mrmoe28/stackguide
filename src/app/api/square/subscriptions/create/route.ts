import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { subscriptionsApi, customersApi, squareConfig } from '@/lib/square'
import { db } from '@/lib/db'
import { userSubscriptions, subscriptionPlans } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  cardToken: z.string().min(1),
  customerId: z.string().optional(), // If user already has a Square customer ID
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
    const { planId, cardToken, customerId } = createSubscriptionSchema.parse(body)

    // Get the subscription plan
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1)

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: 'Subscription plan not found or inactive' },
        { status: 404 }
      )
    }

    if (!plan.squarePlanId) {
      return NextResponse.json(
        { error: 'Square plan ID not configured' },
        { status: 500 }
      )
    }

    let squareCustomerId = customerId

    // Create or get Square customer
    if (!squareCustomerId) {
      const { result } = await customersApi.createCustomer({
        emailAddress: session.user.email || undefined,
        givenName: session.user.name?.split(' ')[0],
        familyName: session.user.name?.split(' ').slice(1).join(' '),
        referenceId: session.user.id,
      })

      squareCustomerId = result.customer?.id
    }

    if (!squareCustomerId) {
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Create the subscription in Square
    const startDate = new Date()
    const endDate = new Date(startDate)

    // Set end date based on plan interval
    if (plan.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (plan.interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    const { result } = await subscriptionsApi.createSubscription({
      locationId: squareConfig.locationId,
      planVariationId: plan.squarePlanId,
      customerId: squareCustomerId,
      cardId: cardToken,
      startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      timezone: 'America/New_York',
    })

    if (!result.subscription) {
      return NextResponse.json(
        { error: 'Failed to create subscription in Square' },
        { status: 500 }
      )
    }

    const squareSubscription = result.subscription

    // Save subscription to database
    const [newSubscription] = await db
      .insert(userSubscriptions)
      .values({
        userId: session.user.id,
        planId: planId,
        squareSubscriptionId: squareSubscription.id,
        squareCustomerId: squareCustomerId,
        status: squareSubscription.status || 'active',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        trialStart: plan.trialDays > 0 ? startDate : null,
        trialEnd: plan.trialDays > 0 ? new Date(startDate.getTime() + plan.trialDays * 24 * 60 * 60 * 1000) : null,
      })
      .returning()

    return NextResponse.json({
      success: true,
      subscription: {
        id: newSubscription.id,
        planId: newSubscription.planId,
        status: newSubscription.status,
        currentPeriodStart: newSubscription.currentPeriodStart,
        currentPeriodEnd: newSubscription.currentPeriodEnd,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Square subscription creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
