import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Wallet } from "../types";

interface WalletCardProps {
  wallet: Wallet;
}

/**
 * Wallet card for the dashboard rail. Mobile: fixed-width horizontal scroll
 * item; md+: the container switches to a grid and the card fills its column.
 * Monochrome per DESIGN.md — the currency code badge does the identifying.
 */
export function WalletCard({ wallet }: WalletCardProps) {
  const { currencyCode, balance, name } = normalize(wallet);

  return (
    <Link
      href={`/wallets/${currencyCode}`}
      className="w-40 flex-none rounded-xl border bg-card p-4 transition-colors hover:border-ring/50 md:w-auto"
    >
      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
        <span className="text-xs font-bold">{currencyCode}</span>
      </div>
      <p className="mt-3 truncate text-xs text-muted-foreground">{name}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold tracking-tight">
        {formatMoney(balance, currencyCode)}
      </p>
    </Link>
  );
}

// Currency names come from /currencies in the real flow; the mock carries a
// small static map so the dashboard renders without a second fetch.
const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  SGD: "Singapore Dollar",
};

function normalize(wallet: Wallet) {
  return {
    currencyCode: wallet.currencyCode,
    balance: wallet.balance,
    name: CURRENCY_NAMES[wallet.currencyCode] ?? wallet.currencyCode,
  };
}
