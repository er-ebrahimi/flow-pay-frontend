"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { ExchangeRate } from "../types";

// Contract: GET /exchange-rates?base=USD&quote=EUR → ExchangeRate.
// 400 VALIDATION_FAILED for a same-currency pair, 404 NOT_FOUND when no active
// rate exists. Read-only — powers the live rate display while typing and the
// indicative rates on the target-currency list.

export async function fetchExchangeRate(
  base: string,
  quote: string,
): Promise<ExchangeRate> {
  const response = await api.get<ExchangeRate>(endpoints.exchangeRates, {
    params: { base, quote },
  });
  return response.data;
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
