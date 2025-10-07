import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import * as schema from './schema'
import ws from 'ws'

// Configure WebSocket for local development
neonConfig.webSocketConstructor = ws

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle({ client: pool, schema })

export * from './schema'
