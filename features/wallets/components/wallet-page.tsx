"use client";

import { HistoryIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { logger } from "@/lib/logger";
import {
  TransactionRow,
  useTransactions,
  type Transaction,
} from "@/features/transactions";
import { useWallet } from "../api/use-wallet";
import { WalletSummaryCard } from "./wallet-summary-card";

interface WalletPageProps {
  currencyCode: string;
}

/** Currency history — wallet summary + that currency's transactions. */
export function WalletPage({ currencyCode }: WalletPageProps) {
  const wallet = useWallet(currencyCode);
  const transactions = useTransactions({ currency: currencyCode });

  if (wallet.isPending) {
    return (
      <div>
        <PageHeader back title={currencyCode} />
        <div className="lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-6">
          <Skeleton className="mb-6 h-44 w-full rounded-xl lg:mb-0" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wallet.isError || !wallet.data) {
    logger.error({ err: wallet.error }, "Failed to load wallet");
    return (
      <ErrorState error={wallet.error} title="Could not load this wallet" />
    );
  }

  const items = transactions.data?.items ?? [];

  return (
    <div>
      <PageHeader back title={wallet.data.currencyCode} />

      <div className="lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-6">
        <WalletSummaryCard wallet={wallet.data} />

        <section aria-labelledby="wallet-history-heading">
          <h2
            id="wallet-history-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Transaction history
          </h2>
          {items.length === 0 ? (
            <EmptyState
              icon={HistoryIcon}
              title="No transactions yet"
              description="Start exchanging to see your history."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((tx: Transaction) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
