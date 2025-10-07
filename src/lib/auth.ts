import NextAuth from 'next-auth'
import type { User, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

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
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string | null
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
