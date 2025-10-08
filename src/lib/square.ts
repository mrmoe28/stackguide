import { Client, Environment } from 'square'

if (!process.env.SQUARE_ACCESS_TOKEN) {
  throw new Error('SQUARE_ACCESS_TOKEN is required')
}

if (!process.env.SQUARE_ENVIRONMENT) {
  throw new Error('SQUARE_ENVIRONMENT is required (sandbox or production)')
}

// Initialize Square client
export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
})

// Export API instances for easy access
export const {
  subscriptionsApi,
  catalogApi,
  customersApi,
  paymentsApi,
  ordersApi,
  invoicesApi,
} = squareClient

// Configuration
export const squareConfig = {
  applicationId: process.env.SQUARE_APPLICATION_ID || '',
  locationId: process.env.SQUARE_LOCATION_ID || '',
  environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
  webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
}

// Type guards
export function isSquareConfigured(): boolean {
  return !!(
    process.env.SQUARE_ACCESS_TOKEN &&
    process.env.SQUARE_APPLICATION_ID &&
    process.env.SQUARE_LOCATION_ID
  )
}

// BigInt serialization fix for Square API responses
// Square uses BigInt for money amounts, which can't be JSON serialized by default
if (typeof BigInt !== 'undefined') {
  // @ts-expect-error - Extending BigInt prototype for JSON serialization
  BigInt.prototype.toJSON = function() {
    return this.toString()
  }
}
