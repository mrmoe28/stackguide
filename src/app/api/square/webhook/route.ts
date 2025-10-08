import { NextRequest, NextResponse } from 'next/server'
import { squareConfig } from '@/lib/square'
import { db } from '@/lib/db'
import { userSubscriptions, subscriptionEvents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createHmac } from 'crypto'

interface SquareWebhookEvent {
  type: string
  event_id: string
  data?: {
    object?: {
      subscription?: Record<string, unknown>
      invoice?: Record<string, unknown>
    }
  }
}

// Square webhook signature verification
function verifySquareSignature(
  body: string,
  signature: string,
  webhookSignatureKey: string
): boolean {
  const hmac = createHmac('sha256', webhookSignatureKey)
  hmac.update(body)
  const hash = hmac.digest('base64')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-square-hmacsha256-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Verify Square webhook signature
    if (!verifySquareSignature(body, signature, squareConfig.webhookSignatureKey)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    console.log('Square webhook event:', event.type)

    // Handle subscription events
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(event)
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event)
        break

      case 'invoice.payment_made':
        await handleInvoicePaymentMade(event)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Square webhook error:', error)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(event: SquareWebhookEvent) {
  const subscriptionData = event.data?.object?.subscription

  if (!subscriptionData) return

  // Log the event
  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.squareSubscriptionId, subscriptionData.id))
    .limit(1)

  if (subscription) {
    await db.insert(subscriptionEvents).values({
      subscriptionId: subscription.id,
      eventType: 'created',
      squareEventId: event.event_id,
      data: subscriptionData,
    })
  }
}

async function handleSubscriptionUpdated(event: SquareWebhookEvent) {
  const subscriptionData = event.data?.object?.subscription

  if (!subscriptionData) return

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.squareSubscriptionId, subscriptionData.id))
    .limit(1)

  if (!subscription) return

  // Update subscription status
  await db
    .update(userSubscriptions)
    .set({
      status: subscriptionData.status,
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.squareSubscriptionId, subscriptionData.id))

  // Log the event
  await db.insert(subscriptionEvents).values({
    subscriptionId: subscription.id,
    eventType: 'updated',
    squareEventId: event.event_id,
    data: subscriptionData,
  })
}

async function handleSubscriptionCanceled(event: SquareWebhookEvent) {
  const subscriptionData = event.data?.object?.subscription

  if (!subscriptionData) return

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.squareSubscriptionId, subscriptionData.id))
    .limit(1)

  if (!subscription) return

  // Update subscription status
  await db
    .update(userSubscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.squareSubscriptionId, subscriptionData.id))

  // Log the event
  await db.insert(subscriptionEvents).values({
    subscriptionId: subscription.id,
    eventType: 'canceled',
    squareEventId: event.event_id,
    data: subscriptionData,
  })
}

async function handleInvoicePaymentMade(event: SquareWebhookEvent) {
  const invoiceData = event.data?.object?.invoice
  const subscriptionId = invoiceData?.subscription_id

  if (!subscriptionId) return

  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.squareSubscriptionId, subscriptionId))
    .limit(1)

  if (!subscription) return

  // Update subscription period dates based on the invoice
  // This logic would depend on your billing cycle
  const currentEnd = subscription.currentPeriodEnd
  const newStart = new Date(currentEnd)
  const newEnd = new Date(newStart)

  // Add one period based on the plan interval
  newEnd.setMonth(newEnd.getMonth() + 1) // Adjust based on plan interval

  await db
    .update(userSubscriptions)
    .set({
      currentPeriodStart: newStart,
      currentPeriodEnd: newEnd,
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.id, subscription.id))

  // Log the event
  await db.insert(subscriptionEvents).values({
    subscriptionId: subscription.id,
    eventType: 'renewed',
    squareEventId: event.event_id,
    data: invoiceData,
  })
}
