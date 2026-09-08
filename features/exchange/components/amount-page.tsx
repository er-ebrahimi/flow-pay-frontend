"use client";

import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/layout/page-header";
import { apiError } from "@/lib/api-error";
import { useWallets } from "@/features/wallets";
import { useCurrencies } from "../api/use-currencies";
import { AmountForm } from "./amount-form";

interface AmountPageProps {
  fromCode: string;
  toCode: string;
}

/** Step 3 — amount entry with live rate, precision clamp, balance pre-check. */
export function AmountPage({ fromCode, toCode }: AmountPageProps) {
  const currencies = useCurrencies();
  const wallets = useWallets();

  if (currencies.isPending) {
    return <Loading fullHeight label="Loading currencies…" />;
  }

  if (currencies.isError || !currencies.data) {
    return <ErrorState error={currencies.error} title="Could not load currencies" />;
  }

  const from = currencies.data.find((currency) => currency.code === fromCode);
  const to = currencies.data.find((currency) => currency.code === toCode);

  if (!from || !to) {
    return (
      <ErrorState
        error={apiError(404, "NOT_FOUND", "Unknown currency pair")}
        title="Currency not found"
        description="That currency pair doesn't exist."
      />
    );
  }

  const wallet = wallets.data?.find(
    (candidate) => candidate.currencyCode === fromCode,
  );

  return (
    <div>
      <PageHeader back title="Enter amount" />
      <AmountForm
        fromCurrency={fromCode}
        toCurrency={toCode}
        decimalPlaces={from.decimalPlaces}
        toDecimalPlaces={to.decimalPlaces}
        balance={wallet?.balance}
      />
    </div>
  );
}
