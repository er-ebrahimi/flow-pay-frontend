/**
 * Total-balance placeholder. A real sum needs GET /exchange-rates for
 * currency conversion — an endpoint the backend hasn't shipped (verified
 * 2026-09-08). Per-currency balances below are real (GET /wallets); this
 * card shows an honest placeholder instead of a fabricated number. Wire it
 * to the aggregate GET /dashboard payload when that endpoint lands.
 */
export function BalanceCard() {
  return (
    <section className="rounded-xl border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">Total balance</p>
      <p
        aria-hidden="true"
        className="mt-1 font-mono text-3xl font-semibold tracking-tight text-muted-foreground/40"
      >
        —
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Available once the rate service is live. Per-currency balances below
        are real.
      </p>
    </section>
  );
}
