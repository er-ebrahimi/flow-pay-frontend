"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { formatDate, formatMoney, formatRate, formatTime } from "@/lib/format";
import { logger } from "@/lib/logger";
import { useTransaction } from "../api/use-transaction";
import { TransactionStatusBadge } from "./transaction-status-badge";

interface TransactionDetailPageProps {
  id: string;
}

export function TransactionDetailPage({ id }: TransactionDetailPageProps) {
  const router = useRouter();
  const { data: tx, isPending, isError, error } = useTransaction(id);

  if (isPending) {
    return (
      <div>
        <PageHeader
          back
          title="Transaction"
          onBack={() => router.push("/")}
        />
        <div className="flex flex-col items-center">
          <Skeleton className="size-16 rounded-2xl" />
          <Skeleton className="mt-4 h-9 w-40" />
          <Skeleton className="mt-6 h-72 w-full max-w-md rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !tx) {
    logger.error({ err: error }, "Failed to load transaction");
    return (
      <div>
        <PageHeader
          back
          title="Transaction"
          onBack={() => router.push("/")}
        />
        <ErrorState error={error} title="Could not load this transaction" />
      </div>
    );
  }

  const isExchange = tx.type === "EXCHANGE";

  const rows = [
    { label: "Transaction ID", value: tx.id, mono: true },
    { label: "Type", value: capitalize(tx.type), mono: false },
    {
      label: "From",
      value: `${tx.fromCurrency} · ${formatMoney(tx.sourceAmount, tx.fromCurrency)}`,
      mono: false,
    },
    ...(isExchange
      ? [
          {
            label: "To",
            value: `${tx.toCurrency} · ${formatMoney(tx.destinationAmount, tx.toCurrency)}`,
            mono: false,
          },
          {
            label: "Rate",
            value: formatRate(tx.rate, tx.fromCurrency, tx.toCurrency),
            mono: true,
          },
          { label: "Fee", value: formatMoney(tx.fee, tx.fromCurrency), mono: true },
        ]
      : []),
    { label: "Date", value: formatDate(tx.createdAt), mono: false },
    { label: "Time", value: formatTime(tx.createdAt), mono: false },
  ];

  return (
    <div>
      <PageHeader
        back
        title="Transaction"
        onBack={() => router.push("/")}
      />

      <div className="mb-8 flex flex-col items-center text-center">
        <TransactionStatusBadge status={tx.status} />
        <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">
          {formatMoney(tx.sourceAmount, tx.fromCurrency)}
        </p>
        {isExchange ? (
          <p className="mt-1 text-sm text-muted-foreground">
            → {formatMoney(tx.destinationAmount, tx.toCurrency)}
          </p>
        ) : null}
      </div>

      <section
        aria-label="Transaction details"
        className="mx-auto max-w-md divide-y divide-border overflow-hidden rounded-xl border bg-card"
      >
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-3.5"
          >
            <span className="flex-none text-sm text-muted-foreground">
              {row.label}
            </span>
            <span
              className={
                row.mono
                  ? "truncate text-right font-mono text-sm font-medium"
                  : "truncate text-right text-sm font-medium"
              }
            >
              {row.value}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
