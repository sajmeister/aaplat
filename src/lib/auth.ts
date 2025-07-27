import NextAuth, { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

// Debug environment variables (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('GitHub Client ID:', process.env.GITHUB_CLIENT_ID);
  console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
}

// Check required environment variables
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
}

export const authConfig: NextAuthConfig = {
  // Use JWT sessions for production (simpler and more reliable)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []
    ),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Restrict access to only "sajmeister" user
      const allowedUser = 'sajmeister';
      
      console.log('🔐 Sign-in attempt:');
      console.log('  - User email:', user.email);
      console.log('  - User name:', user.name);
      console.log('  - Profile login:', profile?.login);
      
      // Check GitHub username (most reliable)
      if (account?.provider === 'github' && profile?.login) {
        const isAllowed = profile.login === allowedUser;
        console.log(`  - GitHub login: ${profile.login} (allowed: ${isAllowed})`);
        return isAllowed ? true : '/auth/access-denied';
      }
      
      // Check Google email (if using Google auth)
      if (account?.provider === 'google' && user.email) {
        const isAllowed = user.email.includes('sajmeister') || (user.name?.toLowerCase().includes('sajmeister') ?? false);
        console.log(`  - Google user: ${user.email} (allowed: ${isAllowed})`);
        return isAllowed ? true : '/auth/access-denied';
      }
      
      // Fallback: check user name - always return boolean
      const nameCheck = user.name?.toLowerCase().includes('sajmeister') ?? false;
      console.log(`  - Name-based check: ${user.name} (allowed: ${nameCheck})`);
      
      // If not allowed, redirect to access denied page
      if (!nameCheck) {
        return '/auth/access-denied';
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig); 