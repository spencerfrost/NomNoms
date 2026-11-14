import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/users-db';
import { RATE_LIMITS, clientIp, rateLimit } from '@/lib/rate-limit';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

/** Error code returned from signIn() when credentials couldn't be checked (e.g. DB down). */
export const AUTH_UNAVAILABLE_ERROR = 'AuthUnavailable';

/** Error code returned from signIn() when too many attempts were made for an email or IP. */
export const AUTH_RATE_LIMITED_ERROR = 'RateLimited';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Count every attempt, not just failures: a correct guess is the one we need to stop.
        const [byEmail, byIp] = await Promise.all([
          rateLimit(
            `login-email:${credentials.email.trim().toLowerCase()}`,
            RATE_LIMITS.loginEmail
          ),
          rateLimit(`login-ip:${clientIp(req?.headers)}`, RATE_LIMITS.loginIp),
        ]);
        if (!byEmail.allowed || !byIp.allowed) {
          throw new Error(AUTH_RATE_LIMITED_ERROR);
        }

        let user;
        try {
          user = await verifyPassword(credentials.email, credentials.password);
        } catch (error) {
          console.error('Auth error:', error);
          // NextAuth passes a thrown error's message to the client as `signIn().error`,
          // so the sign-in page can tell an outage apart from wrong credentials
          // (which return null below and arrive as "CredentialsSignin").
          throw new Error(AUTH_UNAVAILABLE_ERROR);
        }

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'user';
        token.id = user.id; // Store user ID in token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || token.sub || '';
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt', // Keep using JWT sessions - simpler!
  },
};
