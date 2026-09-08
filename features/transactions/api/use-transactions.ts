"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Transaction, TransactionFilters, TransactionList } from "../types";

// ── Mock transport ───────────────────────────────────────────────────────────
// MOCK — the live backend 404s GET /transactions (endpoint not shipped yet,
// verified 2026-09-08). Swap the body for `api.get<TransactionList>(
// "/transactions", { params })` when it lands.
// Contract: GET /transactions?page&limit&type&status&currency&… →
// { items, page, limit, total }. `items: []` is a result, not an error.

const MOCK_DELAY_MS = 500;

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-000001",
    type: "EXCHANGE",
    fromCurrency: "USD",
    toCurrency: "EUR",
    sourceAmount: "500.00",
    fee: "2.50",
    rate: "0.9230",
    destinationAmount: "461.50",
    status: "COMPLETED",
    createdAt: "2026-09-07T10:24:00Z",
  },
  {
    id: "TXN-000002",
    type: "EXCHANGE",
    fromCurrency: "EUR",
    toCurrency: "GBP",
    sourceAmount: "200.00",
    fee: "1.00",
    rate: "0.8560",
    destinationAmount: "171.20",
    status: "COMPLETED",
    createdAt: "2026-09-06T15:40:00Z",
  },
  {
    id: "TXN-000003",
    type: "EXCHANGE",
    fromCurrency: "USD",
    toCurrency: "JPY",
    sourceAmount: "300.00",
    fee: "1.50",
    rate: "149.5000",
    destinationAmount: "44850",
    status: "PENDING",
    createdAt: "2026-09-04T18:05:00Z",
  },
  {
    id: "TXN-000004",
    type: "EXCHANGE",
    fromCurrency: "GBP",
    toCurrency: "USD",
    sourceAmount: "150.00",
    fee: "0.75",
    rate: "1.2750",
    destinationAmount: "191.25",
    status: "FAILED",
    createdAt: "2026-09-03T12:30:00Z",
  },
  {
    id: "TXN-000005",
    type: "EXCHANGE",
    fromCurrency: "USD",
    toCurrency: "EUR",
    sourceAmount: "75.00",
    fee: "0.38",
    rate: "0.9210",
    destinationAmount: "68.95",
    status: "COMPLETED",
    createdAt: "2026-09-01T08:12:00Z",
  },
];

function sleep(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTransactions(
  filters: TransactionFilters = {},
): Promise<TransactionList> {
  await sleep();

  let items = MOCK_TRANSACTIONS;
  if (filters.type) {
    items = items.filter((tx) => tx.type === filters.type);
  }
  if (filters.status) {
    items = items.filter((tx) => tx.status === filters.status);
  }
  if (filters.currency) {
    items = items.filter(
      (tx) =>
        tx.fromCurrency === filters.currency ||
        tx.toCurrency === filters.currency,
    );
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  items = items.slice((page - 1) * limit, page * limit);

  return { items, page, limit, total: items.length };
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
    placeholderData: keepPreviousData,
  });
}
