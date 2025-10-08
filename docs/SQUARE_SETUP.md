# Square Checkout Subscription Setup Guide

This document provides step-by-step instructions for setting up Square Checkout subscriptions in StackGuideR.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Square Account Setup](#square-account-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Creating Subscription Plans](#creating-subscription-plans)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)

## Prerequisites

- Square Developer Account
- StackGuideR application deployed or running locally
- PostgreSQL database (NeonDB)
- Access to environment variables configuration

## Square Account Setup

### 1. Create Square Developer Account

1. Visit [Square Developer Portal](https://developer.squareup.com/)
2. Sign up or log in to your Square account
3. Navigate to "Applications" in the developer dashboard

### 2. Create Application

1. Click "Create App" or use existing application
2. Note down your Application ID
3. Switch between Sandbox and Production environments as needed

### 3. Get API Credentials

From your Square application dashboard:

- **Application ID**: Found in application settings
- **Access Token**: Generate from "Credentials" tab
  - Sandbox: `sandbox-sq0atb-...`
  - Production: `EAAAl...`
- **Webhook Signature Key**: Found in "Webhooks" section
- **Location ID**: Get from "Locations" API or dashboard

### 4. Create Subscription Plans in Square

1. Go to Square Dashboard → Catalog → Subscriptions
2. Create subscription plan variations:
   - Set plan name, description
   - Configure billing frequency (monthly, yearly)
   - Set price
   - Optional: Configure trial period
3. Note the Subscription Plan ID for each plan

## Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Square Payment Integration
SQUARE_ACCESS_TOKEN=your-square-access-token-from-dashboard
SQUARE_APPLICATION_ID=your-square-application-id
SQUARE_LOCATION_ID=your-square-location-id
SQUARE_WEBHOOK_SIGNATURE_KEY=your-square-webhook-signature-key
SQUARE_ENVIRONMENT=sandbox  # or 'production'

# Public environment variables (accessible in browser)
NEXT_PUBLIC_SQUARE_APPLICATION_ID=your-square-application-id
NEXT_PUBLIC_SQUARE_LOCATION_ID=your-square-location-id
```

**Important Notes:**
- Use **Sandbox** credentials for development and testing
- Use **Production** credentials only in production environment
- Never commit actual credentials to version control
- Keep `SQUARE_WEBHOOK_SIGNATURE_KEY` secret

## Database Setup

The subscription tables are already defined in the schema. Run the migration:

```bash
pnpm db:push
```

This creates the following tables:
- `subscription_plans` - Available subscription plans
- `user_subscriptions` - User subscription records
- `subscription_events` - Audit trail of subscription events

## Creating Subscription Plans

### Option 1: Manually Insert Plans

```sql
INSERT INTO subscription_plans (
  square_plan_id,
  name,
  description,
  price,
  interval,
  features,
  is_active,
  trial_days
) VALUES (
  'YOUR_SQUARE_PLAN_ID',  -- From Square Dashboard
  'Basic Plan',
  'Perfect for individual developers',
  999,  -- Price in cents ($9.99)
  'month',
  '["Feature 1", "Feature 2", "Feature 3"]'::jsonb,
  true,
  14  -- 14 days free trial
);
```

### Option 2: Create Admin API Endpoint

Create an admin-protected API route to manage plans programmatically.

## Webhook Configuration

### 1. Configure Webhook URL in Square

1. Go to Square Developer Dashboard → Your Application → Webhooks
2. Add webhook endpoint: `https://yourdomain.com/api/square/webhook`
3. Select events to subscribe to:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `invoice.payment_made`
4. Copy the Webhook Signature Key to your environment variables

### 2. Test Webhook (Local Development)

For local development, use a tool like ngrok:

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL in Square webhook configuration
https://your-ngrok-url.ngrok.io/api/square/webhook
```

### 3. Verify Webhook

The webhook handler (`/api/square/webhook/route.ts`) automatically:
- Verifies Square signature
- Handles subscription lifecycle events
- Updates database records
- Logs events for audit trail

## Testing

### Test in Sandbox Environment

1. Ensure `SQUARE_ENVIRONMENT=sandbox` in `.env`
2. Use Square's test card numbers:
   - **Success**: `4111 1111 1111 1111`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **Postal Code**: Any valid postal code

### Test Subscription Flow

1. Navigate to subscription plans page
2. Select a plan
3. Enter test payment details
4. Submit payment
5. Verify subscription created in:
   - Database (`user_subscriptions` table)
   - Square Dashboard
   - Application UI

### Test Webhook Events

Use Square's webhook testing tool:
1. Go to Square Dashboard → Webhooks → Test Events
2. Send test events to your webhook URL
3. Verify events are processed correctly

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update environment variables with **Production** credentials
- [ ] Set `SQUARE_ENVIRONMENT=production`
- [ ] Configure production webhook URL in Square
- [ ] Test with real payment method (small amount)
- [ ] Verify webhook signature validation works
- [ ] Set up monitoring and alerting
- [ ] Review subscription plans and pricing
- [ ] Test subscription cancellation flow

### Security Considerations

1. **Environment Variables**: Store securely (use Vercel Environment Variables, AWS Secrets Manager, etc.)
2. **Webhook Signature**: Always verify webhook signature before processing
3. **HTTPS Only**: Never use HTTP in production for webhook endpoints
4. **Error Handling**: Log errors but don't expose sensitive information
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Database Access**: Use connection pooling and prepared statements

### Monitoring

Monitor the following:
- Subscription creation success rate
- Webhook processing failures
- Payment failures
- Database errors
- API response times

### Common Issues

#### Webhook Not Receiving Events
- Check webhook URL is publicly accessible
- Verify webhook signature key is correct
- Check Square Dashboard for webhook delivery status
- Review application logs for errors

#### Payment Fails in Production
- Verify production credentials are correct
- Check Square account is activated and verified
- Ensure customer card is valid
- Review Square transaction logs

#### Subscription Not Created
- Check database connection
- Verify Square plan ID exists
- Review API error logs
- Check user authentication

## API Endpoints

### GET /api/square/subscriptions/plans
Get all available subscription plans

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "id": "uuid",
      "name": "Basic Plan",
      "description": "Perfect for individuals",
      "price": 999,
      "interval": "month",
      "features": ["Feature 1", "Feature 2"],
      "trialDays": 14
    }
  ]
}
```

### POST /api/square/subscriptions/create
Create a new subscription

**Request:**
```json
{
  "planId": "plan-uuid",
  "cardToken": "cnon:card-token-from-square"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "subscription-uuid",
    "planId": "plan-uuid",
    "status": "active",
    "currentPeriodStart": "2025-01-01T00:00:00Z",
    "currentPeriodEnd": "2025-02-01T00:00:00Z"
  }
}
```

### GET /api/square/subscriptions/current
Get user's current active subscription

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "subscription-uuid",
    "status": "active",
    "currentPeriodEnd": "2025-02-01T00:00:00Z",
    "plan": {
      "name": "Basic Plan",
      "price": 999,
      "interval": "month",
      "features": ["Feature 1", "Feature 2"]
    }
  }
}
```

### POST /api/square/webhook
Handle Square webhook events (called by Square, not by client)

## UI Component Usage

### Basic Usage

```tsx
import SubscriptionPlans from '@/components/subscription-plans'

export default function PricingPage() {
  return (
    <div>
      <h1>Choose Your Plan</h1>
      <SubscriptionPlans />
    </div>
  )
}
```

The component automatically:
- Fetches available plans
- Shows current subscription if user has one
- Handles payment form with Square
- Creates subscription on successful payment
- Refreshes UI after subscription created

## Support

For issues or questions:
- Square Documentation: https://developer.squareup.com/docs
- Square Support: https://squareup.com/help
- StackGuideR Issues: [Your GitHub Issues URL]

## Additional Resources

- [Square Subscriptions API](https://developer.squareup.com/docs/subscriptions-api/overview)
- [Square Web Payments SDK](https://developer.squareup.com/docs/web-payments/overview)
- [Square Webhooks](https://developer.squareup.com/docs/webhooks/overview)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
