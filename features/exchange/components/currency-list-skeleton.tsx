import { Skeleton } from "@/components/ui/skeleton";

/** Content-shaped placeholder for currency lists (PAGE_DEVELOPMENT.md). */
export function CurrencyListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-[66px] w-full rounded-xl" />
      ))}
    </div>
  );
}
