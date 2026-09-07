import "server-only";

/**
 * Shared NextAuth secret. Used both by the NextAuth route handler (to sign
 * tokens) and by route protection (to verify tokens). Keeping it in one place
 * guarantees both sides always decode with the same secret.
 */
export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) {
    return secret;
  }

  // `next build` runs with NODE_ENV=production but must be able to collect
  // page data without a secret present (NEXT_PHASE="phase-production-build"
  // during builds). Runtime servers keep the fail-closed behavior.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    throw new Error(
      "NEXTAUTH_SECRET is required in production. Set it before starting the app.",
    );
  }

  return "fallback-secret-for-development";
}
