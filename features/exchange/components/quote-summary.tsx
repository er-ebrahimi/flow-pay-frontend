import { formatMoney, formatRate } from "@/lib/format";
import type { ExchangeQuote } from "../types";

interface QuoteSummaryProps {
  quote: ExchangeQuote;
  className?: string;
}

/** The locked-quote detail rows, per the wireframe's review screen. */
export function QuoteSummary({ quote, className }: QuoteSummaryProps) {
  const rows = [
    { label: "Rate", value: formatRate(quote.rate, quote.fromCurrency, quote.toCurrency) },
    { label: "Fee", value: formatMoney(quote.fee, quote.fromCurrency) },
    { label: "You send", value: formatMoney(quote.amount, quote.fromCurrency) },
    { label: "You receive", value: formatMoney(quote.destinationAmount, quote.toCurrency), emphasized: true },
  ];

  return (
    <section
      aria-label="Quote summary"
      className={`divide-y divide-border overflow-hidden rounded-xl border bg-card ${className ?? ""}`}
    >
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-muted-foreground">{row.label}</span>
          <span
            className={
              row.emphasized
                ? "font-mono text-sm font-semibold"
                : "font-mono text-sm font-medium"
            }
          >
            {row.value}
          </span>
        </div>
      ))}
    </section>
  );
}
