import { cn } from "cn";
import { Loader2Icon } from "lucide-react";

type LoadingSize = "sm" | "md" | "lg";

const sizeClasses: Record<LoadingSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

interface LoadingProps {
  label?: string;
  size?: LoadingSize;
  /** Centers the spinner in a tall block for full-page loading. */
  fullHeight?: boolean;
  className?: string;
}

export function Loading({
  label,
  size = "md",
  fullHeight = false,
  className,
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        fullHeight && "min-h-[50vh]",
        className,
      )}
    >
      <Loader2Icon
        aria-hidden="true"
        className={cn("animate-spin text-muted-foreground", sizeClasses[size])}
      />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );
}
