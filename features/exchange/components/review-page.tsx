"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { OctagonXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/layout/page-header";
import { getErrorCode, getErrorMessage } from "@/lib/logger";
import { useWallets } from "@/features/wallets";
import {
  exchangeQuoteKey,
  useExchangeQuote,
} from "../api/use-exchange-quote";
import { useConfirmExchange } from "../api/use-confirm-exchange";
import { ExchangePairChip } from "./exchange-pair-chip";
import {
  ErrorScreen,
  ProcessingScreen,
  SuccessScreen,
  exchangeErrorMessage,
} from "./exchange-result-screens";
import { QuoteCountdown } from "./quote-countdown";
import { QuoteSummary } from "./quote-summary";

interface ReviewPageProps {
  fromCode: string;
  toCode: string;
  /** From the `?amount=` search param — the quote request input. */
  amount: string;
}

/**
 * Step 4 — review the locked quote and confirm. Processing/success/error are
 * full-screen states of the same route, driven by the confirm mutation.
 */
export function ReviewPage({ fromCode, toCode, amount }: ReviewPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [quoteExpired, setQuoteExpired] = useState(false);

  const wallets = useWallets();
  const balance = wallets.data?.find((w) => w.currencyCode === fromCode)
    ?.balance;
  const quote = useExchangeQuote({
    fromCurrency: fromCode,
    toCurrency: toCode,
    amount,
    balance,
  });
  const confirm = useConfirmExchange();

  if (!amount) {
    return (
      <QuoteFailure
        message="No amount to exchange."
        actionLabel="Change amount"
        onAction={() => router.push(`/exchange/from/${fromCode}/to/${toCode}`)}
      />
    );
  }

  if (quote.isPending) {
    return <Loading fullHeight label="Getting your quote…" />;
  }

  if (quote.isError || !quote.data) {
    const code = getErrorCode(quote.error);
    const userActionable =
      code === "VALIDATION_FAILED" || code === "INSUFFICIENT_BALANCE";
    return (
      <QuoteFailure
        message={getErrorMessage(quote.error, "Something went wrong.")}
        actionLabel={userActionable ? "Change amount" : "Try again"}
        onAction={() =>
          userActionable
            ? router.push(`/exchange/from/${fromCode}/to/${toCode}`)
            : quote.refetch()
        }
      />
    );
  }

  const quoteData = quote.data;

  if (confirm.isPending) {
    return <ProcessingScreen />;
  }

  if (confirm.isSuccess) {
    return <SuccessScreen onDone={() => router.push("/")} />;
  }

  if (confirm.isError) {
    const code = getErrorCode(confirm.error);
    const staleQuote =
      code === "QUOTE_EXPIRED" || code === "QUOTE_ALREADY_CONSUMED";
    return (
      <ErrorScreen
        message={exchangeErrorMessage(confirm.error)}
        retryLabel={staleQuote ? "Get a new rate" : "Try again"}
        onRetry={() => {
          confirm.reset();
          if (staleQuote) {
            setQuoteExpired(false);
            queryClient.invalidateQueries({
              queryKey: exchangeQuoteKey(fromCode, toCode, amount, balance),
            });
          }
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader back title="Review" />
      <h2 className="text-xl font-semibold tracking-tight">
        Review and confirm
      </h2>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Review the details before confirming.
      </p>

      <div className="space-y-4">
        <ExchangePairChip from={fromCode} to={toCode} className="mx-auto" />
        <QuoteSummary quote={quoteData} />
        <QuoteCountdown
          expiresAt={quoteData.expiresAt}
          onExpired={() => setQuoteExpired(true)}
        />

        {quoteExpired ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setQuoteExpired(false);
              queryClient.invalidateQueries({
                queryKey: exchangeQuoteKey(fromCode, toCode, amount, balance),
              });
            }}
          >
            Get a new rate
          </Button>
        ) : null}

        <Button
          size="lg"
          className="w-full"
          disabled={quoteExpired}
          onClick={() => confirm.mutate(quoteData)}
        >
          Confirm exchange
        </Button>
      </div>
    </div>
  );
}

function QuoteFailure({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <OctagonXIcon aria-hidden="true" className="size-10" />
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-tight">
        Could not get a quote
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{message}</p>
      <Button size="lg" className="mt-8 w-full max-w-xs" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

