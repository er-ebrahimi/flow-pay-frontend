"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Currency } from "../types";

// Contract: GET /currencies → Currency[] sorted by code, always 200 (empty
// array at worst). `exclude` is a live-spec addition: returns rows without
// that currency (unknown codes silently filter nothing).

export async function fetchCurrencies(exclude?: string): Promise<Currency[]> {
  const response = await api.get<Currency[]>("/currencies", {
    params: exclude ? { exclude } : undefined,
  });
  return response.data;
}

export function useCurrencies(exclude?: string) {
  return useQuery({
    queryKey: ["currencies", exclude ?? null],
    queryFn: () => fetchCurrencies(exclude),
    // Reference data — it never changes between remounts.
    staleTime: Infinity,
  });
}
