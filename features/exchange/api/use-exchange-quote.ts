"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { ExchangeQuote } from "../types";

// Contract: POST /exchange-quotes { fromCurrency, toCurrency, amount } →
// ExchangeQuote (201). Rejects with the contract's error shapes:
//   400 VALIDATION_FAILED (SAME_CURRENCY / INVALID_AMOUNT context)
//   422 INSUFFICIENT_BALANCE (pre-check)
// The quote carries expiresAt — the review screen locks the rate until then.
// The backend owns all validation now; the client pre-checks are gone.

export function exchangeQuoteKey(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
) {
  return ["exchangeQuote", fromCurrency, toCurrency, amount] as const;
}

export async function fetchExchangeQuote(args: {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
}): Promise<ExchangeQuote> {
  const response = await api.post<ExchangeQuote>(
    endpoints.exchangeQuotes,
    args,
  );
  return response.data;
}

export function useExchangeQuote(args: {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
}) {
  const { fromCurrency, toCurrency, amount } = args;
  return useQuery({
    queryKey: exchangeQuoteKey(fromCurrency, toCurrency, amount),
    queryFn: () => fetchExchangeQuote({ fromCurrency, toCurrency, amount }),
    enabled: Boolean(fromCurrency && toCurrency && amount),
    // 400/422 are user-actionable, not transient — never retry them.
    retry: false,
  });
}
