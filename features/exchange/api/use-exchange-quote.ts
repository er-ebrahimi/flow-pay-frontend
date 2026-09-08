"use client";

import { useQuery } from "@tanstack/react-query";
import { apiError } from "@/lib/api-error";
import type { ExchangeQuote } from "../types";
import { fetchExchangeRate } from "./use-exchange-rate";

// MOCK — the live backend 404s POST /exchange-quotes (endpoint not shipped
// yet, verified 2026-09-08). Swap the body for the commented one-liner when
// it ships; the query key and error shapes already match the contract.
//
// Contract: POST /exchange-quotes { fromCurrency, toCurrency, amount } →
// ExchangeQuote (201). Rejects with the contract's error shapes:
//   400 VALIDATION_FAILED (SAME_CURRENCY / INVALID_AMOUNT context)
//   422 INSUFFICIENT_BALANCE (pre-check)
// The quote carries expiresAt — the review screen locks the rate until then.
// Real implementation:
//   api.post<ExchangeQuote>("/exchange-quotes", { fromCurrency, toCurrency, amount })

const MOCK_DELAY_MS = 600;

const FEE_RATE = 0.005; // 0.5%, mirrors the wireframe's review screen

function sleep(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rejection(status: number, code: string, message: string) {
  return apiError(status, code, message);
}

export function exchangeQuoteKey(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  balance?: string,
) {
  // The balance participates: it changes the 422 pre-check outcome.
  return [
    "exchangeQuote",
    fromCurrency,
    toCurrency,
    amount,
    balance ?? null,
  ] as const;
}

export async function fetchExchangeQuote(args: {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  /** Real wallet balance for the pre-check (from GET /wallets). Undefined
   * skips the client pre-check — the backend re-checks on confirm. */
  balance?: string;
}): Promise<ExchangeQuote> {
  const { fromCurrency, toCurrency, amount, balance } = args;
  await sleep();

  if (fromCurrency === toCurrency) {
    throw rejection(
      400,
      "VALIDATION_FAILED",
      "Choose two different currencies.",
    );
  }

  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw rejection(400, "VALIDATION_FAILED", "Enter a valid amount.");
  }

  if (balance !== undefined && value > Number(balance)) {
    throw rejection(
      422,
      "INSUFFICIENT_BALANCE",
      `Not enough ${fromCurrency} balance.`,
    );
  }

  const { rate } = await fetchExchangeRate(fromCurrency, toCurrency);
  const rateValue = Number(rate);
  const fromDecimals = amount.includes(".") ? amount.split(".")[1].length : 0;
  const feeValue = Number((value * FEE_RATE).toFixed(fromDecimals || 2));
  const destination = (value - feeValue) * rateValue;
  const toDecimals = toCurrency === "JPY" ? 0 : 2;

  return {
    quoteId: crypto.randomUUID(),
    fromCurrency,
    toCurrency,
    amount: value.toFixed(fromDecimals || 2),
    fee: feeValue.toFixed(fromDecimals || 2),
    rate,
    destinationAmount: destination.toFixed(toDecimals),
    // USER_STORY TTL: 60 s. The countdown always reads this field — never a
    // client-side constant.
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  };
}

export function useExchangeQuote(args: {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  balance?: string;
}) {
  const { fromCurrency, toCurrency, amount, balance } = args;
  return useQuery({
    queryKey: exchangeQuoteKey(fromCurrency, toCurrency, amount, balance),
    queryFn: () => fetchExchangeQuote({ fromCurrency, toCurrency, amount, balance }),
    enabled: Boolean(fromCurrency && toCurrency && amount),
    // 400/422 are user-actionable, not transient — never retry them.
    retry: false,
  });
}
