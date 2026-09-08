"use client";

import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@/features/transactions";
import { MOCK_TRANSACTIONS } from "@/features/transactions";
import type { Wallet } from "@/features/wallets";

// ── Mock transport ───────────────────────────────────────────────────────────
// MOCK — the live backend 404s GET /dashboard (endpoint not shipped yet,
// verified 2026-09-08). The dashboard renders real wallets + honest gaps
// until then; this module stays for the aggregate swap when the endpoint
// lands. Contract: GET /dashboard → { totalBalanceBase, baseCurrency,
// wallets, recentTransactions (≤5) }.

const MOCK_DELAY_MS = 500;

export interface DashboardData {
  totalBalanceBase: string;
  baseCurrency: string;
  wallets: Wallet[];
  recentTransactions: Transaction[];
}

function sleep(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchDashboard(): Promise<DashboardData> {
  await sleep();
  return {
    totalBalanceBase: "18542.72",
    baseCurrency: "USD",
    wallets: [
      { currencyCode: "USD", balance: "4250.00", transactionCount: 24 },
      { currencyCode: "EUR", balance: "1840.50", transactionCount: 12 },
      { currencyCode: "GBP", balance: "620.75", transactionCount: 5 },
      { currencyCode: "JPY", balance: "82400.00", transactionCount: 3 },
      { currencyCode: "CHF", balance: "0.00", transactionCount: 0 },
    ],
    recentTransactions: MOCK_TRANSACTIONS.slice(0, 5),
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });
}
