import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin?: boolean; 
      banned?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin?: boolean; 
    banned?: boolean; 
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token }) => {
      const db_user = await prisma.user.findFirst({
        where: {
          email: token?.email,
        },
      });
      if (db_user) {
        token.id = db_user.id;
        token.isAdmin = db_user.isAdmin;
        token.banned = db_user.banned; 
    
        let retries = 3;
        while (retries > 0) {
          try {
            await prisma.user.update({
              where: { id: db_user.id },
              data: { isOnline: true },
            });
            break; // success, exit loop
          } catch (err: any) {
            if (
              retries > 1 &&
              (err.code === 'P2034' ||
                (err.message && err.message.includes('Lock wait timeout')))
            ) {
              await new Promise((res) => setTimeout(res, 500));
              retries--;
            } else {
              throw err;
            }
          }
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin; 
        session.user.banned = token.banned;// <--- Add this
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
      params: {
        prompt: "select_account"
      }
      }
    }),
  ],
};

export const getAuthSession = () => {
  return getServerSession(authOptions);
};