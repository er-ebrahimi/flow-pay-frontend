"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { Transaction } from "../types";

// Contract: GET /transactions/:id → Transaction; 404 NOT_FOUND for unknown ids
// (and for other users' transactions — same response either way, per the
// contract's no-existence-leak rule). The backend owns the 404.

export async function fetchTransaction(id: string): Promise<Transaction> {
  const response = await api.get<Transaction>(
    endpoints.transaction(id),
  );
  return response.data;
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => fetchTransaction(id),
  });
}
