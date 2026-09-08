import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmExchange, useConfirmExchange } from "../use-confirm-exchange";
import type { ExchangeQuote } from "../../types";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast";

vi.mock("@/lib/logger", () => ({
  getErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
  getErrorCode: () => undefined,
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

const VALID_QUOTE: ExchangeQuote = {
  quoteId: "quote-1",
  fromCurrency: "USD",
  toCurrency: "EUR",
  amount: "100.00",
  fee: "0.50",
  rate: "0.9230",
  destinationAmount: "92.07",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useConfirmExchange", () => {
  it("completes the exchange, toasts, and invalidates balances + histories", async () => {
    const invalidateSpy = vi.spyOn(
      QueryClient.prototype,
      "invalidateQueries",
    );
    const { result } = renderHook(() => useConfirmExchange(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(VALID_QUOTE);

    await waitFor(
      () => expect(result.current.isSuccess).toBe(true),
      { timeout: 3500 },
    );

    expect(result.current.data?.transactionId).toMatch(/^TXN-/);
    expect(showApiSuccessToast).toHaveBeenCalledWith("Exchange completed");
    for (const key of [["dashboard"], ["wallets"], ["transactions"]]) {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: key });
    }
    expect(showApiErrorToast).not.toHaveBeenCalled();
  });

  it("rejects an expired quote with the contract's 410 copy", async () => {
    const expired: ExchangeQuote = {
      ...VALID_QUOTE,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };
    const { result } = renderHook(() => useConfirmExchange(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(expired);

    await waitFor(
      () => expect(result.current.isError).toBe(true),
      { timeout: 3500 },
    );

    expect(showApiErrorToast).toHaveBeenCalledWith(
      "This quote has expired.",
    );
    expect(showApiSuccessToast).not.toHaveBeenCalled();
  });

  it("confirmExchange resolves the contract-shaped result", async () => {
    const result = await confirmExchange(VALID_QUOTE);
    expect(result.status).toBe("COMPLETED");
    expect(result.fromCurrency).toBe("USD");
    expect(result.destinationAmount).toBe("92.07");
  });
});


