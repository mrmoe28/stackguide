import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import * as schema from './schema'
import ws from 'ws'

// Configure WebSocket for local development
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Use a connection pooler endpoint for better stability
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error', err)
})

export const db = drizzle({ client: pool, schema })

export * from './schema'
