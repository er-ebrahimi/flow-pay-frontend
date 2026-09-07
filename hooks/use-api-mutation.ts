"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { getErrorMessage, logger } from "@/lib/logger";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast";

interface UseApiMutationOptions<TData, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage: string;
  errorMessage: string;
  invalidate?: ReadonlyArray<readonly unknown[]>;
  logError?: string;
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext | undefined,
  ) => void;
  onError?: (
    error: unknown,
    variables: TVariables,
    context: TContext | undefined,
  ) => void;
}

export function useApiMutation<
  TData = unknown,
  TVariables = void,
  TContext = unknown,
>({
  mutationFn,
  successMessage,
  errorMessage,
  invalidate = [],
  logError = "API mutation failed",
  onSuccess,
  onError,
}: UseApiMutationOptions<TData, TVariables, TContext>): UseMutationResult<
  TData,
  unknown,
  TVariables,
  TContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    meta: { toastHandled: true },
    onSuccess: (data, variables, context) => {
      showApiSuccessToast(successMessage);
      for (const key of invalidate) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      logger.error({ err: error }, logError);
      showApiErrorToast(getErrorMessage(error, errorMessage));
      onError?.(error, variables, context);
    },
  });
}
