import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExchangePairChipProps {
  from: string;
  to?: string;
  className?: string;
}

/** From → to currency chip; `to` optional for the "from" summary state. */
export function ExchangePairChip({
  from,
  to,
  className,
}: ExchangePairChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2",
        className,
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
        {from}
      </span>
      {to ? (
        <>
          <ArrowRightIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
            {to}
          </span>
        </>
      ) : null}
    </div>
  );
}
