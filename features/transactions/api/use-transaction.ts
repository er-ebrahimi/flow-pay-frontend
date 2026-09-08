"use client";

import { useQuery } from "@tanstack/react-query";
import { apiError } from "@/lib/api-error";
import type { Transaction } from "../types";
import { MOCK_TRANSACTIONS } from "./use-transactions";

// ── Mock transport ───────────────────────────────────────────────────────────
// MOCK — the live backend 404s GET /transactions/:id (endpoint not shipped
// yet, verified 2026-09-08). Swap the body for
// `api.get<Transaction>(`/transactions/${id}`)` when it lands.
// Contract: GET /transactions/:id → Transaction; 404 NOT_FOUND for unknown ids
// (and for other users' transactions — same response either way, per the
// contract's no-existence-leak rule).

const MOCK_DELAY_MS = 500;

function sleep(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function notFound(): Error {
  return apiError(
    404,
    "NOT_FOUND",
    "This item could not be found.",
  );
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  await sleep();
  const tx = MOCK_TRANSACTIONS.find((candidate) => candidate.id === id);
  if (!tx) throw notFound();
  return tx;
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => fetchTransaction(id),
  });
}
