"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { WalletDetail } from "../types";

// Contract: GET /wallets/:currencyCode → WalletDetail; 404 NOT_FOUND when the
// caller has no wallet for that currency. The backend owns the 404 — no
// client-side fabrication.

export async function fetchWallet(currencyCode: string): Promise<WalletDetail> {
  const response = await api.get<WalletDetail>(endpoints.wallet(currencyCode));
  return response.data;
}

export function useWallet(currencyCode: string) {
  return useQuery({
    queryKey: ["wallet", currencyCode],
    queryFn: () => fetchWallet(currencyCode),
  });
}
