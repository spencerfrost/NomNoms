import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/users-db'

declare module 'next-auth' {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check against user database
          const user = await verifyPassword(credentials.email, credentials.password)
          
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'user'
      }
      return token
    },
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        session.user.role = (user as { role?: string }).role || 'user'
      }
      return session
    },
  },
  session: {
    strategy: 'database',
  },
}
