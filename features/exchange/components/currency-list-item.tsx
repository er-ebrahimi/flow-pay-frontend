"use client";

import type { ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencyListItemProps {
  code: string;
  name: string;
  /** Right-aligned slot: owned balance, indicative rate, … */
  trailing?: ReactNode;
  onClick: () => void;
  className?: string;
}

/** One currency option row; the parent decides the action. */
export function CurrencyListItem({
  code,
  name,
  trailing,
  onClick,
  className,
}: CurrencyListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border bg-card p-3.5 text-left transition-colors hover:bg-muted/40 hover:cursor-pointer",
        className,
      )}
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-full bg-muted text-xs font-bold">
        {code}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{code}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {name}
        </span>
      </span>
      {trailing ? (
        <span className="flex-none text-right">{trailing}</span>
      ) : null}
      <ChevronRightIcon
        aria-hidden="true"
        className="size-4 flex-none text-muted-foreground/50"
      />
    </button>
  );
}
