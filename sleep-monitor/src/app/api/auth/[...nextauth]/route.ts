import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectMongo } from '@/app/lib/mongoose';
import User from '@/app/models/Users';
import bcrypt from 'bcrypt';

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await connectMongo();
          console.log('Connected to Mongo');
          
          const user = await User.findOne({ email: credentials?.email });
          console.log('User found:', user);
      
          if (!user) {
            console.log('No user');
            return null;
          }
      
          const isValid = await bcrypt.compare(credentials!.password, user.passwordHash);
          console.log('Password valid:', isValid);
      
          if (!isValid) {
            return null;
          }
      
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          throw error; 
        }
      }
      
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }