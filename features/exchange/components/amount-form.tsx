"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, formatRate } from "@/lib/format";
import { useExchangeRate } from "../api/use-exchange-rate";
import {
  exceedsPrecision,
  formatAmount,
  normalizeAmountInput,
  parseAmount,
} from "../lib/amount";
import { ExchangePairChip } from "./exchange-pair-chip";

interface AmountFormProps {
  fromCurrency: string;
  toCurrency: string;
  decimalPlaces: number;
  toDecimalPlaces: number;
  /** undefined when the user owns no wallet in the source currency — the
   * client pre-check is skipped then (the quote endpoint still checks). */
  balance?: string;
}

export function AmountForm({
  fromCurrency,
  toCurrency,
  decimalPlaces,
  toDecimalPlaces,
  balance,
}: AmountFormProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const rate = useExchangeRate(fromCurrency, toCurrency);

  const normalized = normalizeAmountInput(input);
  const overPrecision = exceedsPrecision(normalized, decimalPlaces);
  const amount = parseAmount(normalized);
  const insufficient =
    balance !== undefined && amount !== null && amount > Number(balance);
  const canContinue = amount !== null && !overPrecision && !insufficient;

  const destination =
    rate.data && amount !== null
      ? (amount * Number(rate.data.rate)).toFixed(toDecimalPlaces)
      : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canContinue) return;
    router.push(
      `/exchange/from/${fromCurrency}/to/${toCurrency}/review?amount=${encodeURIComponent(normalized)}`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ExchangePairChip from={fromCurrency} to={toCurrency} />

      <section className="rounded-xl border bg-card p-5">
        <label
          htmlFor="exchange-amount"
          className="text-sm font-medium text-muted-foreground"
        >
          Amount to exchange
        </label>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg text-muted-foreground">{fromCurrency}</span>
          <Input
            id="exchange-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={input}
            onChange={(event) => setInput(normalizeAmountInput(event.target.value))}
            aria-invalid={overPrecision || insufficient || undefined}
            className="h-auto border-0 bg-transparent px-0 font-mono text-3xl font-semibold tracking-tight dark:bg-transparent"
          />
        </div>
        {balance !== undefined ? (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Available:{" "}
              <span className="font-mono">
                {formatMoney(balance, fromCurrency)}
              </span>
            </p>
            <button
              type="button"
              onClick={() =>
                setInput(formatAmount(Number(balance), decimalPlaces))
              }
              className="text-xs font-medium underline-offset-4 hover:underline"
            >
              Max
            </button>
          </div>
        ) : null}
        {overPrecision ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            Up to {decimalPlaces} decimal place{decimalPlaces === 1 ? "" : "s"}.
          </p>
        ) : null}
        {insufficient ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            Insufficient {fromCurrency} balance.
          </p>
        ) : null}
      </section>

      {rate.isPending ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : rate.isError ? (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Unable to load exchange rate</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => rate.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : rate.data ? (
        <section className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Exchange rate</span>
            <span className="font-mono text-sm">
              {formatRate(rate.data.rate, fromCurrency, toCurrency)}
            </span>
          </div>
          {destination ? (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You receive</span>
              <span className="font-mono text-sm font-semibold">
                {formatMoney(destination, toCurrency, toDecimalPlaces)}
              </span>
            </div>
          ) : null}
        </section>
      ) : null}

      <Button type="submit" size="lg" disabled={!canContinue} className="w-full">
        Get quote
      </Button>
    </form>
  );
}
