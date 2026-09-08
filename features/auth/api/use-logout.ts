"use client";

import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { useApiMutation } from "@/hooks/use-api-mutation";

// Contract: POST /auth/logout → 204, no body (Bearer-auth). The JWT itself
// stays valid until expiry (no revocation list) — signOut() clears the
// client session regardless, so this call is hygiene, not security.

/**
 * Invalidates every cached query (balances, histories, quotes) on sign-out so
 * no stale data survives into the next login. An empty key array is TanStack
 * Query's "match all" key.
 */
export const INVALIDATE_ALL_KEY: readonly unknown[] = [];

export async function logoutApi(): Promise<void> {
  await api.post(endpoints.auth.logout);
}

export function useLogout() {
  return useApiMutation({
    mutationFn: logoutApi,
    successMessage: "Signed out",
    errorMessage: "Sign out failed",
    logError: "Logout API call failed",
    invalidate: [INVALIDATE_ALL_KEY],
  });
}
