import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

import NextAuth from 'next-auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const userList = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        const user = userList[0]

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: Record<string, unknown>
      user: Record<string, unknown>
    }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({
      session,
      token,
    }: {
      session: Record<string, unknown>
      token: Record<string, unknown>
    }) {
      if (token && session.user) {
        const userSession = session.user as Record<string, unknown>
        userSession.id = token.id as string
        userSession.email = token.email as string
        userSession.name = token.name as string
      }
      return session
    },
  },
})

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const userList = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        const user = userList[0]

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || null,
        }
      },
    }),
  ],
}
