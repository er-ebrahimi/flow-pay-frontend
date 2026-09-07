import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import "./get-server-auth-headers"; // registers the server-side auth provider
import { api } from "@/lib/axios";
import { getAuthSecret } from "./auth-secret";
import { logger } from "@/lib/logger";

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // POST /auth/login → { accessToken, expiresIn } per
          // docs/API_CONTRACT.md. The contract has no refresh token and no
          // profile endpoint, so the access token is all we persist; on
          // expiry the axios interceptor redirects to /login (401).
          const response = await api.post<LoginResponse>("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data?.accessToken) {
            return {
              id: credentials.email,
              access: response.data.accessToken,
            };
          }
          return null;
        } catch (error) {
          logger.error({ err: error }, "Authentication error");
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.access = user.access;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.access = token.access;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: getAuthSecret(),
};
