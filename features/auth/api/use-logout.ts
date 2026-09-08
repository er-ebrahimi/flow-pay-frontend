"use client";

import { api } from "@/lib/axios";
import { useApiMutation } from "@/hooks/use-api-mutation";

// Contract: POST /auth/logout → 204, no body (Bearer-auth). The JWT itself
// stays valid until expiry (no revocation list) — signOut() clears the
// client session regardless, so this call is hygiene, not security.

export async function logoutApi(): Promise<void> {
  await api.post("/auth/logout");
}

export function useLogout() {
  return useApiMutation({
    mutationFn: logoutApi,
    successMessage: "Signed out",
    errorMessage: "Signed out",
    logError: "Logout API call failed",
    // Empty key matches every query — after a session change, nothing cached
    // (balances, histories, quotes) may survive into the next login.
    invalidate: [[]],
  });
}
