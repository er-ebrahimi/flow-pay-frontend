"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { formatMoney } from "@/lib/format";
import { logger } from "@/lib/logger";
import { useWallets } from "@/features/wallets";
import { useCurrencies } from "../api/use-currencies";
import { CurrencyListItem } from "./currency-list-item";
import { CurrencyListSkeleton } from "./currency-list-skeleton";

/** Exchange tab root — pick the source currency. */
export function ExchangeHome() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const currencies = useCurrencies();
  const wallets = useWallets();

  if (currencies.isPending) {
    return (
      <div>
        <PageHeader
          title="Exchange"
          description="Choose a currency to exchange from"
        />
        <CurrencyListSkeleton />
      </div>
    );
  }

  if (currencies.isError || !currencies.data) {
    logger.error({ err: currencies.error }, "Failed to load currencies");
    return <ErrorState error={currencies.error} title="Could not load currencies" />;
  }

  const query = search.trim().toLowerCase();
  const filtered = currencies.data.filter(
    (currency) =>
      currency.code.toLowerCase().includes(query) ||
      currency.name.toLowerCase().includes(query),
  );

  return (
    <div>
      <PageHeader
        title="Exchange"
        description="Choose a currency to exchange from"
      />

      <div className="relative mb-4">
        <SearchIcon
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search currencies…"
          aria-label="Search currencies"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No currencies found"
          description={`Nothing matches “${search}”.`}
        />
      ) : (
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
          {filtered.map((currency) => {
            const wallet = wallets.data?.find(
              (candidate) => candidate.currencyCode === currency.code,
            );
            return (
              <CurrencyListItem
                key={currency.code}
                code={currency.code}
                name={currency.name}
                onClick={() => router.push(`/exchange/from/${currency.code}`)}
                trailing={
                  wallet ? (
                    <span>
                      <span className="block font-mono text-sm font-semibold">
                        {formatMoney(wallet.balance, wallet.currencyCode)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        available
                      </span>
                    </span>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
