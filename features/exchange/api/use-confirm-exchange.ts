"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { apiError } from "@/lib/api-error";
import type { ExchangeQuote, ExchangeResult } from "../types";

// ── Mock transport ───────────────────────────────────────────────────────────
// MOCK — the live backend 404s POST /exchanges (endpoint not shipped yet,
// verified 2026-09-08). Swap the body for the commented axios call when it
// lands; the query invalidations and error handling already match the
// contract.
// Contract: POST /exchanges { quoteId } with header Idempotency-Key: <uuid>.
// Rejects 410 QUOTE_EXPIRED / 409 QUOTE_ALREADY_CONSUMED / 422
// INSUFFICIENT_BALANCE. Real implementation:
//
//   api.post<ExchangeResult>("/exchanges", { quoteId: quote.quoteId }, {
//     headers: { "Idempotency-Key": crypto.randomUUID() },
//   })
//
// One key per attempt: a retry after a network failure returns the original
// result (200) instead of double-executing.

const MOCK_DELAY_MS = 2000;

function sleep(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rejection(status: number, code: string, message: string) {
  return apiError(status, code, message);
}

export async function confirmExchange(
  quote: ExchangeQuote,
): Promise<ExchangeResult> {
  await sleep(MOCK_DELAY_MS);

  if (new Date(quote.expiresAt).getTime() <= Date.now()) {
    throw rejection(410, "QUOTE_EXPIRED", "This quote has expired.");
  }
  if (!quote.quoteId) {
    throw rejection(
      409,
      "QUOTE_ALREADY_CONSUMED",
      "This quote was already used.",
    );
  }

  return {
    transactionId: `TXN-${String(Date.now()).slice(-6)}`,
    status: "COMPLETED",
    fromCurrency: quote.fromCurrency,
    toCurrency: quote.toCurrency,
    sourceAmount: quote.amount,
    fee: quote.fee,
    rate: quote.rate,
    destinationAmount: quote.destinationAmount,
    createdAt: new Date().toISOString(),
  };
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
