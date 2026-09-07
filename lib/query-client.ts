import type { QueryClientConfig } from "@tanstack/react-query";

interface ApiError {
  response?: {
    status?: number;
  };
}

/**
 * Documented query/mutation defaults. Imported by app/providers.tsx so these
 * options actually run — 60s staleTime, no refetch on window focus, no retry
 * on statuses the user must act on (401/403/404, QUOTE_EXPIRED 410,
 * INSUFFICIENT_BALANCE 422), max 2 retries otherwise.
 *
 * Retry table per docs/API_CONTRACT.md — 410/422 are terminal for the user
 * (refresh the quote / fix the amount), not transient network faults.
 */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error: unknown) => {
        const apiError = error as ApiError;
        const status = apiError?.response?.status;
        if (
          status === 401 ||
          status === 403 ||
          status === 404 ||
          status === 410 ||
          status === 422
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
};
