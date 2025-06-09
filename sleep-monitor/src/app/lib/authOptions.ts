import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectMongo } from '@/app/lib/mongoose';
import User from '@/app/models/Users';
import bcrypt from 'bcrypt';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
    async authorize(credentials, req) {
        await connectMongo();
        const user = await User.findOne({ email: credentials?.email });
        if (!user) return null;
        
        const isValid = await bcrypt.compare(credentials!.password, user.passwordHash);
        if (!isValid) return null;

        return {
            id: user.id.toString(),
            _id: user.id.toString(),
            email: user.email,
            name: user.name,
        };
    }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user._id = token.id;
      return session;
    },
  },
  pages: { signIn: '/signin' },
  secret: process.env.NEXTAUTH_SECRET,
};
