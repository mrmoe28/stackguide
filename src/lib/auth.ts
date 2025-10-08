import NextAuth from 'next-auth'
import type { Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input with Zod
          const validatedCredentials = loginSchema.parse(credentials)

          // Find user by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, validatedCredentials.email))
            .limit(1)

          // User not found or no password hash
          if (!user || !user.passwordHash) {
            return null
          }

          // Verify password with bcrypt
          const isValidPassword = await compare(
            validatedCredentials.password,
            user.passwordHash
          )

          if (!isValidPassword) {
            return null
          }

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: Session; user?: { id: string } }) {
      // Add user ID to session for easy access
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
})
