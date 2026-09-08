"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import type { TransactionFilters, TransactionList } from "../types";

// Contract: GET /transactions?page&type&status&currency&dateFrom&dateTo&search
// → { items, page, limit, total }. `items: []` is a result, not an error.
// The live spec documents no `limit` param (server defaults the page size),
// so we send only the filters the UI actually uses. The 200 body isn't
// documented in the Swagger — typed per docs/API_CONTRACT.md; verify the shape
// at runtime on first connection.

export async function fetchTransactions(
  filters: TransactionFilters = {},
): Promise<TransactionList> {
  const response = await api.get<TransactionList>(
    endpoints.transactions,
    {
    params: {
      page: filters.page,
      type: filters.type,
      status: filters.status,
      currency: filters.currency,
    },
  });
  return response.data;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
    placeholderData: keepPreviousData,
  });
}
