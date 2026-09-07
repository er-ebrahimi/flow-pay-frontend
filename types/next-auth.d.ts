// Type augmentation for NextAuth sessions — mirrors docs/API_CONTRACT.md:
// the backend issues a single short-lived access token (no refresh token),
// so `access` is the only extra field on the session.
//
// The top-level import is required: without it this file is a global script
// and `declare module "next-auth"` becomes a full ambient re-declaration,
// hiding every real next-auth export.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      /** POST /auth/login's accessToken — the Bearer credential for the API. */
      access?: string;
    };
  }

  interface User {
    access?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access?: string;
  }
}
