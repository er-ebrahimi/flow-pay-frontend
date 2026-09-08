"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Pure helper (unit-tested): whole seconds until expiry, floored at 0. */
export function secondsLeft(expiresAt: string, now = Date.now()): number {
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return 0;
  return Math.max(0, Math.ceil((expiry - now) / 1000));
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface QuoteCountdownProps {
  expiresAt: string;
  onExpired?: () => void;
  className?: string;
}

/**
 * Live countdown for the locked quote. The clock ticks via interval only —
 * never a synchronous setState in the effect body. `suppressHydrationWarning`
 * covers the sub-second SSR/client drift on the "now" snapshot.
 */
export function QuoteCountdown({
  expiresAt,
  onExpired,
  className,
}: QuoteCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const left = secondsLeft(expiresAt, now);
  const expired = left === 0;

  useEffect(() => {
    if (expired) onExpired?.();
    // Intentionally keyed on `expired` only — onExpired identity changes per
    // render and the parent's setState is idempotent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  if (expired) {
    return (
      <p
        suppressHydrationWarning
        className={cn("text-sm text-destructive", className)}
      >
        Quote expired — request a new rate.
      </p>
    );
  }

  return (
    <p
      suppressHydrationWarning
      className={cn("text-sm text-muted-foreground", className)}
    >
      Rate locks for <span className="font-mono">{formatCountdown(left)}</span>{" "}
      — confirm before it expires.
    </p>
  );
}
