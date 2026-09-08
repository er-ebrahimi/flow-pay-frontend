"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { Transaction } from "@/features/transactions";
import type { Wallet } from "@/features/wallets";

// Contract: GET /dashboard → { totalBalanceBase, baseCurrency, wallets,
// recentTransactions (≤5) }. One aggregate call. The 200 body isn't documented
// in the live Swagger — typed per docs/API_CONTRACT.md; verify the shape at
// runtime on first connection and adjust if it differs.

export interface DashboardData {
  totalBalanceBase: string;
  baseCurrency: string;
  wallets: Wallet[];
  recentTransactions: Transaction[];
}

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await api.get<DashboardData>(endpoints.dashboard);
  return response.data;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });
}
