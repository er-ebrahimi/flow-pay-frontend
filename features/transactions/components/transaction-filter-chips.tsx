"use client";

import { cn } from "@/lib/utils";
import type { TransactionType } from "../types";

export type TransactionFilterValue = "ALL" | TransactionType;

const FILTERS: ReadonlyArray<{
  value: TransactionFilterValue;
  label: string;
}> = [
  { value: "ALL", label: "All" },
  { value: "EXCHANGE", label: "Exchange" },
];

interface TransactionFilterChipsProps {
  value: TransactionFilterValue;
  onChange: (value: TransactionFilterValue) => void;
  className?: string;
}

export function TransactionFilterChips({
  value,
  onChange,
  className,
}: TransactionFilterChipsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
      {FILTERS.map((filter) => {
        const active = filter.value === value;
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={cn(
              "flex-none rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-transparent bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
