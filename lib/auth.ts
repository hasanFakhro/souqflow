import NextAuth from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "@/lib/prisma";

import bcrypt from "bcryptjs";

// Auth.js URL overrides also rewrite proxy requests. Ignore accidentally
// deployed development URLs so Vercel's forwarded host can be inferred.
if (process.env.VERCEL) {
  for (const key of ["AUTH_URL", "NEXTAUTH_URL"] as const) {
    const value = process.env[key];
    if (!value) continue;
    try {
      const host = new URL(value).hostname;
      if (host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "[::1]") {
        delete process.env[key];
      }
    } catch {
      // Leave invalid configuration to Auth.js's normal error handling.
    }
  }
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          throw new Error(
            "Invalid credentials",
          );
        }

        const user =
          await prisma.user.findUnique({
            where: {
              email:
                credentials.email as string,
            },

            include: {
              subscription: true,
            },
          });

        if (!user || !user.password) {
          throw new Error(
            "Invalid credentials",
          );
        }

        const isMatch =
          await bcrypt.compare(
            credentials.password as string,
            user.password,
          );

        if (!isMatch) {
          throw new Error(
            "Invalid credentials",
          );
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,

          subscriptionActive:
            user.subscription?.isActive ??
            false,

          subscriptionEndDate:
            user.subscription?.endDate ??
            null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      if (user) {
        token.id = user.id;

        token.email = user.email;

        token.name = user.name;

        token.role = (
          user as {
            role?: string;
          }
        ).role;

        token.subscriptionActive = (
          user as {
            subscriptionActive?: boolean;
          }
        ).subscriptionActive;

        token.subscriptionEndDate = (
          user as {
            subscriptionEndDate?:
              | Date
              | null;
          }
        ).subscriptionEndDate;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        session.user.id =
          token.id as string;

        session.user.email =
          token.email as string;

        session.user.name =
          token.name as string;

        (
          session.user as {
            role?: string;
          }
        ).role =
          token.role as string;

        (
          session.user as {
            subscriptionActive?: boolean;
          }
        ).subscriptionActive =
          token.subscriptionActive as boolean;

        (
          session.user as {
            subscriptionEndDate?:
              | Date
              | null;
          }
        ).subscriptionEndDate =
          token.subscriptionEndDate as
            | Date
            | null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
});
