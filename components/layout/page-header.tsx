"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Main screens: title left-aligned, optional description. */
  title: string;
  description?: string;
  /** Sub-screens: centered small-caps label with a back arrow. */
  back?: boolean;
  /**
   * Where the back arrow goes. Defaults to router.back() (browser history),
   * which is wrong for multi-step flows — pass the previous step's path
   * instead (e.g. the exchange flow's source → target → amount → review).
   */
  onBack?: () => void;
  className?: string;
}

export function PageHeader({
  title,
  description,
  back = false,
  onBack,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  if (back) {
    return (
      <header
        className={cn(
          "mb-6 grid grid-cols-[2rem_1fr_2rem] items-center",
          className,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          aria-label="Go back"
          onClick={onBack ?? (() => router.back())}
          className={"hover:cursor-pointer"}
        >
          <ArrowLeftIcon aria-hidden="true" />
        </Button>
        <h1 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h1>
        <span aria-hidden="true" />
      </header>
    );
  }

  return (
    <header className={cn("mb-6", className)}>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
