import Link from "next/link";
import { ArrowLeftRightIcon } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import type { Transaction } from "../types";
import { TransactionStatusBadge } from "./transaction-status-badge";

interface TransactionRowProps {
  transaction: Transaction;
}

/**
 * One component, two densities (DESIGN.md responsive rule): compact card row
 * below md, wide table-like row from md up. The whole row navigates to the
 * transaction detail.
 */
export function TransactionRow({ transaction: tx }: TransactionRowProps) {
  const isExchange = tx.type === "EXCHANGE";

  return (
    <Link
      href={`/transactions/${tx.id}`}
      className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/40 md:grid md:grid-cols-[7.5rem_6rem_1fr_10rem_6.5rem_7rem] md:items-center md:gap-4 md:px-4"
    >
      {/* Type icon — mobile only; the md+ row shows the type as text. */}
      <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-foreground md:hidden">
        <ArrowLeftRightIcon aria-hidden="true" className="size-4" />
      </div>

      {/* Mobile: title + status + date, amounts right. */}
      <div className="min-w-0 flex-1 md:hidden">
        <div className="mb-0.5 flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold">
            {tx.fromCurrency} → {tx.toCurrency}
          </p>
          <TransactionStatusBadge status={tx.status} />
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
      </div>
      <div className="flex-none text-right md:hidden">
        <p className="font-mono text-sm font-semibold">
          {formatMoney(tx.sourceAmount, tx.fromCurrency)}
        </p>
        {isExchange ? (
          <p className="text-xs text-muted-foreground">
            {formatMoney(tx.destinationAmount, tx.toCurrency)}
          </p>
        ) : null}
      </div>

      {/* Desktop: wide row. */}
      <span className="hidden font-mono text-sm md:block">{tx.id}</span>
      <span className="hidden text-sm capitalize text-muted-foreground md:block">
        {tx.type.toLowerCase()}
      </span>
      <span className="hidden text-sm font-semibold md:block">
        {tx.fromCurrency} → {tx.toCurrency}
      </span>
      <span className="hidden text-right md:block">
        <span className="block font-mono text-sm font-semibold">
          {formatMoney(tx.sourceAmount, tx.fromCurrency)}
        </span>
        {isExchange ? (
          <span className="block text-xs text-muted-foreground">
            {formatMoney(tx.destinationAmount, tx.toCurrency)}
          </span>
        ) : null}
      </span>
      <span className="hidden md:block">
        <TransactionStatusBadge status={tx.status} />
      </span>
      <span className="hidden text-right text-sm text-muted-foreground md:block">
        {formatDate(tx.createdAt)}
      </span>
    </Link>
  );
}
