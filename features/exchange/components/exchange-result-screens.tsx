"use client";

import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { getErrorCode, getErrorMessage } from "@/lib/logger";

/** Full-screen takeover states of the review confirm (no bottom nav duty). */
export function ProcessingScreen() {
  return <Loading fullHeight size="lg" label="Processing your exchange…" />;
}

export function SuccessScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-foreground">
        <CircleCheckIcon aria-hidden="true" className="size-10" />
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-tight">
        Exchange complete
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Your exchange was processed successfully. Funds have been credited to
        your wallet.
      </p>
      <Button size="lg" className="mt-8 w-full max-w-xs" onClick={onDone}>
        Back to dashboard
      </Button>
    </div>
  );
}

/** Maps the contract's error codes to the recovery copy (API_CONTRACT.md). */
export function exchangeErrorMessage(
  error: unknown,
  fallback = "Exchange failed",
): string {
  switch (getErrorCode(error)) {
    case "QUOTE_EXPIRED":
      return "This quote has expired. Request a new rate.";
    case "QUOTE_ALREADY_CONSUMED":
      return "This quote was already used. Request a new rate.";
    case "INSUFFICIENT_BALANCE":
      return "Not enough funds in this wallet for this exchange.";
    default:
      return getErrorMessage(error, fallback);
  }
}

interface ErrorScreenProps {
  message: string;
  retryLabel?: string;
  onRetry: () => void;
}

export function ErrorScreen({
  message,
  retryLabel = "Try again",
  onRetry,
}: ErrorScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <OctagonXIcon aria-hidden="true" className="size-10" />
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-tight">
        Exchange failed
      </h2>
      <p className="mt-2 max-w-xs text-sm text-destructive/90">{message}</p>
      <Button size="lg" className="mt-8 w-full max-w-xs" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
