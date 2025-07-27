import NextAuth, { NextAuthConfig } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { db } from './db';
import { accounts, sessions, users, verificationTokens } from './db/schema';

// Debug environment variables (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('GitHub Client ID:', process.env.GITHUB_CLIENT_ID);
  console.log('GitHub Client ID length:', process.env.GITHUB_CLIENT_ID?.length);
  console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
}

export const authConfig: NextAuthConfig = {
  // Use database adapter only if we have a real database
  ...(process.env.NODE_ENV === 'development' || process.env.DATABASE_URL !== 'file:local.db' 
    ? {
        adapter: DrizzleAdapter(db, {
          usersTable: users,
          accountsTable: accounts,
          sessionsTable: sessions,
          verificationTokensTable: verificationTokens,
        }),
        session: {
          strategy: 'database',
        },
      }
    : {
        // For production with in-memory database, use JWT sessions
        session: {
          strategy: 'jwt',
        },
      }
  ),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        // For JWT strategy, use token.sub as user ID
        session.user.id = token.sub || user?.id;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig); 