"use client";

import { useQuery } from "@tanstack/react-query";
import { apiError } from "@/lib/api-error";
import type { ExchangeRate } from "../types";

// ── Mock transport ───────────────────────────────────────────────────────────
// MOCK — the live backend 404s GET /exchange-rates (endpoint not shipped yet,
// verified 2026-09-08). Swap the body for
// `api.get<ExchangeRate>("/exchange-rates", { params: { base, quote } })`
// when it lands.
// Contract: GET /exchange-rates?base=USD&quote=EUR → ExchangeRate.
// 400 VALIDATION_FAILED for a same-currency pair, 404 NOT_FOUND when no active
// rate exists. Read-only — powers the live rate display while typing and the
// indicative rates on the target-currency list.

const MOCK_DELAY_MS = 400;

const MOCK_RATES: Record<string, string> = {
  "USD-EUR": "0.9230",
  "USD-GBP": "0.7860",
  "USD-JPY": "149.5000",
  "USD-CHF": "0.8810",
  "USD-CAD": "1.3520",
  "USD-AUD": "1.5010",
  "USD-SGD": "1.3100",
  "EUR-USD": "1.0830",
  "EUR-GBP": "0.8520",
  "EUR-JPY": "161.9000",
  "GBP-USD": "1.2720",
  "JPY-USD": "0.0067",
};

function sleep(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rejection(status: number, code: string, message: string) {
  return apiError(status, code, message);
}

export async function fetchExchangeRate(
  base: string,
  quote: string,
): Promise<ExchangeRate> {
  await sleep();

  if (base === quote) {
    throw rejection(
      400,
      "VALIDATION_FAILED",
      "Base and quote currencies must differ.",
    );
  }
  const rate = MOCK_RATES[`${base}-${quote}`];
  if (!rate) {
    throw rejection(
      404,
      "NOT_FOUND",
      `No active rate for the ${base}-${quote} pair.`,
    );
  }
  return { base, quote, rate, asOf: new Date().toISOString() };
}

export function useExchangeRate(base: string, quote: string, enabled = true) {
  return useQuery({
    queryKey: ["exchangeRate", base, quote],
    queryFn: () => fetchExchangeRate(base, quote),
    enabled: enabled && Boolean(base) && Boolean(quote),
    // Pointless retries on validation-shaped failures; the shared policy
    // already skips 404/422 — a 400 here is a caller bug, not transient.
    retry: false,
  });
}
