"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { apiError } from "@/lib/api-error";
import { formatRate } from "@/lib/format";
import { logger } from "@/lib/logger";
import { useExchangeRate } from "../api/use-exchange-rate";
import { useCurrencies } from "../api/use-currencies";
import { CurrencyListItem } from "./currency-list-item";
import { CurrencyListSkeleton } from "./currency-list-skeleton";

interface SelectTargetPageProps {
  fromCode: string;
}

/** Step 2 — pick the target currency; rows show the indicative rate. */
export function SelectTargetPage({ fromCode }: SelectTargetPageProps) {
  const router = useRouter();
  // Full list resolves the "from" row (cached from the exchange home visit);
  // the target list asks the backend to exclude it via ?exclude=fromCode.
  const currencies = useCurrencies();
  const targets = useCurrencies(fromCode);

  if (currencies.isPending || targets.isPending) {
    return (
      <div>
        <PageHeader back title="Exchange" onBack={() => router.push("/exchange")} />
        <CurrencyListSkeleton />
      </div>
    );
  }

  if (currencies.isError || !currencies.data) {
    logger.error({ err: currencies.error }, "Failed to load currencies");
    return <ErrorState error={currencies.error} title="Could not load currencies" />;
  }

  const from = currencies.data.find((currency) => currency.code === fromCode);
  if (!from) {
    return (
      <ErrorState
        error={apiError(404, "NOT_FOUND", `Unknown currency ${fromCode}`)}
        title="Currency not found"
        description="That source currency doesn't exist."
      />
    );
  }

  const candidates = targets.data ?? [];

  return (
    <div>
      <PageHeader back title="Exchange" onBack={() => router.push("/exchange")} />

      <div className="mb-6 flex items-center gap-3 rounded-xl border bg-card p-3">
        <span className="flex size-9 flex-none items-center justify-center rounded-full bg-muted text-xs font-bold">
          {from.code}
        </span>
        <span>
          <span className="block text-xs text-muted-foreground">From</span>
          <span className="block text-sm font-semibold">{from.name}</span>
        </span>
      </div>

      <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
        {candidates.map((currency) => (
          <TargetOption
            key={currency.code}
            fromCode={fromCode}
            code={currency.code}
            name={currency.name}
            onSelect={() =>
              router.push(`/exchange/from/${fromCode}/to/${currency.code}`)
            }
          />
        ))}
      </div>
    </div>
  );
}

/** One target row with its own indicative-rate query (cached per pair). */
function TargetOption({
  fromCode,
  code,
  name,
  onSelect,
}: {
  fromCode: string;
  code: string;
  name: string;
  onSelect: () => void;
}) {
  const rate = useExchangeRate(fromCode, code);

  return (
    <CurrencyListItem
      code={code}
      name={name}
      onClick={onSelect}
      trailing={
        rate.isPending ? null : rate.isError ? (
          <span className="text-xs text-muted-foreground">Rate unavailable</span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {formatRate(rate.data.rate, fromCode, code)}
          </span>
        )
      }
    />
  );
}
