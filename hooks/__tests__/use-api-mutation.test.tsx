import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useApiMutation } from "../use-api-mutation";
import { logger } from "@/lib/logger";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast";

vi.mock("@/lib/logger", () => ({
  // Deterministic stand-in: the real extraction is pinned in logger.test.ts.
  getErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
  logger: { error: vi.fn() },
}));

vi.mock("@/lib/toast", () => ({
  showApiErrorToast: vi.fn(),
  showApiSuccessToast: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useApiMutation", () => {
  it("shows the success toast, invalidates keys, and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");

    const { result } = renderHook(
      () =>
        useApiMutation({
          mutationFn: async () => "ok",
          successMessage: "Exchange completed",
          errorMessage: "Exchange failed",
          invalidate: [["walletList"], ["dashboard"]],
          onSuccess,
        }),
      { wrapper: createWrapper() },
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(showApiSuccessToast).toHaveBeenCalledWith("Exchange completed");
    expect(showApiErrorToast).not.toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["walletList"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["dashboard"] });
    expect(onSuccess).toHaveBeenCalledWith("ok", undefined, undefined);
  });

  it("logs the error and shows one toast with the extracted message", async () => {
    const onError = vi.fn();
    const failure = new Error("Not enough USD balance");

    const { result } = renderHook(
      () =>
        useApiMutation({
          mutationFn: async () => {
            throw failure;
          },
          successMessage: "Exchange completed",
          errorMessage: "Exchange failed",
          onError,
        }),
      { wrapper: createWrapper() },
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(logger.error).toHaveBeenCalledWith(
      { err: failure },
      "API mutation failed",
    );
    expect(showApiErrorToast).toHaveBeenCalledWith("Not enough USD balance");
    expect(showApiSuccessToast).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(failure, undefined, undefined);
  });

  it("falls back to errorMessage when the error carries no message", async () => {
    const { result } = renderHook(
      () =>
        useApiMutation({
          mutationFn: async () => {
            throw "non-error rejection";
          },
          successMessage: "ok",
          errorMessage: "Exchange failed",
        }),
      { wrapper: createWrapper() },
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(showApiErrorToast).toHaveBeenCalledWith("Exchange failed");
  });

  it("marks the mutation as toastHandled so the global safety net stays silent", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
    }

    const { result } = renderHook(
      () =>
        useApiMutation({
          mutationFn: async () => "ok",
          successMessage: "ok",
          errorMessage: "failed",
        }),
      { wrapper: Wrapper },
    );

    result.current.mutate();

    await waitFor(() => {
      expect(queryClient.getMutationCache().getAll()).toHaveLength(1);
    });

    const meta = queryClient.getMutationCache().getAll()[0].meta;
    expect(meta).toEqual({ toastHandled: true });
  });
});
