import { formatMoney } from "@/lib/format";

interface BalanceCardProps {
  totalBalanceBase: string;
  baseCurrency: string;
}

/** The hero money number — Geist Mono, large, flat per DESIGN.md. */
export function BalanceCard({
  totalBalanceBase,
  baseCurrency,
}: BalanceCardProps) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">Total balance</p>
      <p className="mt-1 font-mono text-3xl font-semibold tracking-tight">
        {formatMoney(totalBalanceBase, baseCurrency)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Base currency · {baseCurrency}
      </p>
    </section>
  );
}
