"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Wallet } from "../types";

// Contract: GET /wallets → Wallet[] sorted by currency code (Bearer-auth).

export async function fetchWallets(): Promise<Wallet[]> {
  const response = await api.get<Wallet[]>("/wallets");
  return response.data;
}

export function useWallets() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: fetchWallets,
  });
}
