"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { ExchangeQuote, ExchangeResult } from "../types";

// Contract: POST /exchanges { quoteId } with header Idempotency-Key: <uuid>.
// Rejects 410 QUOTE_EXPIRED / 409 QUOTE_ALREADY_CONSUMED / 422
// INSUFFICIENT_BALANCE. One key per attempt: a retry after a network failure
// returns the original result (200) instead of double-executing. The backend
// owns quote-expiry and balance checks — no client-side pre-checks.

export async function confirmExchange(
  quote: ExchangeQuote,
): Promise<ExchangeResult> {
  const response = await api.post<ExchangeResult>(
    endpoints.exchanges,
    { quoteId: quote.quoteId },
    { headers: { "Idempotency-Key": crypto.randomUUID() } },
  );
  return response.data;
}

/** Every query the exchange touches — balances and both history views. */
export const EXCHANGE_INVALIDATE_KEYS: ReadonlyArray<readonly unknown[]> = [
  ["dashboard"],
  ["wallets"],
  ["transactions"],
];

export function useConfirmExchange() {
  return useApiMutation({
    mutationFn: confirmExchange,
    successMessage: "Exchange completed",
    errorMessage: "Exchange failed",
    invalidate: EXCHANGE_INVALIDATE_KEYS,
    logError: "Failed to confirm exchange",
  });
}
