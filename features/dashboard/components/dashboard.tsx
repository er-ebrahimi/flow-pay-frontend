"use client";

import Link from "next/link";
import { HistoryIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/lib/logger";
import { useWallets, WalletCard } from "@/features/wallets";
import { BalanceCard } from "./balance-card";
import { DashboardHeader } from "./dashboard-header";

// Real data where the backend has it (GET /wallets), honest gaps where it
// doesn't: the total stays a placeholder until the rate service exists, and
// the recent list is empty until GET /transactions ships (both verified 404
// on 2026-09-08).

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="size-9 rounded-full" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-40 flex-none rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data: wallets, isLoading, isError, error } = useWallets();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !wallets) {
    logger.error({ err: error }, "Failed to load wallets");
    return <ErrorState error={error} title="Could not load your wallets" />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-6">
        <div className="space-y-6">
          <BalanceCard />

          <section aria-labelledby="wallets-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="wallets-heading"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                My wallets
              </h2>
              <span className="text-xs text-muted-foreground">
                {wallets.length} currencies
              </span>
            </div>
            {wallets.length === 0 ? (
              <EmptyState
                icon={HistoryIcon}
                title="No wallets yet"
                description="Sign in to see your currency wallets."
              />
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
                {wallets.map((wallet) => (
                  <WalletCard key={wallet.currencyCode} wallet={wallet} />
                ))}
              </div>
            )}
          </section>
        </div>

        <section aria-labelledby="recent-heading" className="mt-6 lg:mt-0">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="recent-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Recent
            </h2>
            <Link
              href="/transactions"
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
          <EmptyState
            icon={HistoryIcon}
            title="No transactions yet"
            description="Your exchanges will appear here once transaction history is live."
          />
        </section>
      </div>
    </div>
  );
}
