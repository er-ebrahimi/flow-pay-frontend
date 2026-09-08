"use client";

import { useState } from "react";
import { HistoryIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { logger } from "@/lib/logger";
import {
  TransactionFilterChips,
  TransactionRow,
  useTransactions,
  type TransactionFilterValue,
} from "@/features/transactions";

/** History tab — every currency, unfiltered by default. */
export function TransactionsPage() {
  const [filter, setFilter] = useState<TransactionFilterValue>("ALL");
  const list = useTransactions({
    type: filter === "EXCHANGE" ? "EXCHANGE" : undefined,
  });

  if (list.isPending && !list.data) {
    return (
      <div>
        <PageHeader
          title="All transactions"
          description="Every currency"
        />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (list.isError || !list.data) {
    logger.error({ err: list.error }, "Failed to load transactions");
    return (
      <ErrorState error={list.error} title="Could not load your transactions" />
    );
  }

  return (
    <div>
      <PageHeader
        title="All transactions"
        description={`${list.data.total} total · All currencies`}
      />

      <TransactionFilterChips
        value={filter}
        onChange={setFilter}
        className="mb-4"
      />

      {list.data.items.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No transactions yet"
          description="Start exchanging to see your history."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {list.data.items.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
