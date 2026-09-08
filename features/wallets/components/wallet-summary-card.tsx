import { formatMoney, formatDate } from "@/lib/format";
import type { WalletDetail } from "../types";

interface WalletSummaryCardProps {
  wallet: WalletDetail;
}

/**
 * Hero card for the currency history screen: balance + lifetime stats,
 * centered like the wireframe but in the system's monochrome voice.
 */
export function WalletSummaryCard({ wallet }: WalletSummaryCardProps) {
  return (
    <section className="mb-6 rounded-xl border bg-card p-5 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <span className="text-sm font-bold">{wallet.currencyCode}</span>
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">
        {formatMoney(wallet.balance, wallet.currencyCode)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {wallet.transactionCount} transactions · Since{" "}
        {formatDate(wallet.createdAt)}
      </p>
    </section>
  );
}
