import type { TransactionStatus } from "../types";

// DESIGN.md: no green/yellow in the system. COMPLETED gets the primary tint,
// PENDING the muted voice, FAILED the destructive wash.

const STYLES: Record<TransactionStatus, string> = {
  COMPLETED: "border-primary/25 bg-primary/10 text-foreground",
  PENDING: "border-transparent bg-muted text-muted-foreground",
  FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
};

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export function TransactionStatusBadge({
  status,
  className,
}: TransactionStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status]} ${className ?? ""}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
