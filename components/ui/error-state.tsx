import { isAxiosError } from "axios";
import { AlertCircleIcon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { getErrorCode } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  /** Page-level error, e.g. the `error` from useQuery/useSuspenseQuery. */
  error: unknown;
  title: string;
  /** Fallback description when the status/code has no mapped message. */
  description?: string;
  className?: string;
}

// English strings until i18n lands — these become translation keys then.
const STATUS_DESCRIPTIONS: Record<number, string> = {
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to view this.",
  404: "This item could not be found.",
  500: "Something went wrong on our side. Please try again.",
};

// FlowPay-specific error codes (docs/API_CONTRACT.md) that have a different
// recovery action than their HTTP status implies.
const CODE_DESCRIPTIONS: Record<string, string> = {
  INSUFFICIENT_BALANCE: "Not enough funds in this wallet for this exchange.",
  QUOTE_EXPIRED: "This quote has expired. Request a new rate.",
  QUOTE_ALREADY_CONSUMED: "This quote was already used. Request a new rate.",
};

export function ErrorState({
  error,
  title,
  description = "Something went wrong.",
  className,
}: ErrorStateProps) {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const code = getErrorCode(error);
  const resolvedDescription =
    (code ? CODE_DESCRIPTIONS[code] : undefined) ??
    (status ? STATUS_DESCRIPTIONS[status] : undefined) ??
    description;

  return (
    <div
      className={cn(
        "flex justify-center items-center min-h-[200px]",
        className,
      )}
    >
      <Alert variant="destructive" className="max-w-md">
        <AlertCircleIcon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{resolvedDescription}</AlertDescription>
      </Alert>
    </div>
  );
}
