import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmExchange, useConfirmExchange } from "../use-confirm-exchange";
import type { ExchangeQuote, ExchangeResult } from "../../types";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock("@/lib/axios", () => ({
  api: { post: postMock },
}));

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

const QUOTE: ExchangeQuote = {
  quoteId: "quote-1",
  fromCurrency: "USD",
  toCurrency: "EUR",
  amount: "100.00",
  fee: "0.75",
  rate: "0.9230",
  destinationAmount: "92.23",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useConfirmExchange", () => {
  it("completes the exchange, toasts, and invalidates balances + histories", async () => {
    const result: ExchangeResult = {
      transactionId: "TXN-000001",
      status: "COMPLETED",
      fromCurrency: "USD",
      toCurrency: "EUR",
      sourceAmount: "100.00",
      fee: "0.75",
      rate: "0.9230",
      destinationAmount: "92.23",
      createdAt: "2026-09-08T12:00:00Z",
    };
    postMock.mockResolvedValueOnce({ data: result });
    const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");

    const { result: hookResult } = renderHook(() => useConfirmExchange(), {
      wrapper: createWrapper(),
    });

    hookResult.current.mutate(QUOTE);

    await waitFor(
      () => expect(hookResult.current.isSuccess).toBe(true),
      { timeout: 2500 },
    );

    expect(hookResult.current.data?.transactionId).toBe("TXN-000001");
    expect(showApiSuccessToast).toHaveBeenCalledWith("Exchange completed");
    for (const key of [["dashboard"], ["wallets"], ["transactions"]]) {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: key });
    }
    expect(showApiErrorToast).not.toHaveBeenCalled();
  });

  it("sends a per-attempt Idempotency-Key header", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        transactionId: "TXN-000002",
        status: "COMPLETED",
        fromCurrency: "USD",
        toCurrency: "EUR",
        sourceAmount: "50.00",
        fee: "0.38",
        rate: "0.9230",
        destinationAmount: "46.11",
        createdAt: "2026-09-08T12:00:00Z",
      } satisfies ExchangeResult,
    });

    const { result: hookResult } = renderHook(() => useConfirmExchange(), {
      wrapper: createWrapper(),
    });

    hookResult.current.mutate(QUOTE);

    await waitFor(() => expect(hookResult.current.isSuccess).toBe(true));

    const [, , config] = postMock.mock.calls[0];
    const key = config?.headers?.["Idempotency-Key"];
    expect(typeof key).toBe("string");
    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("rejects an expired quote with the contract's 410 copy", async () => {
    postMock.mockRejectedValueOnce(
      Object.assign(new Error("This quote has expired."), {
        response: {
          status: 410,
          data: {
            error: { code: "QUOTE_EXPIRED", message: "This quote has expired." },
          },
        },
      }),
    );
    const { result: hookResult } = renderHook(() => useConfirmExchange(), {
      wrapper: createWrapper(),
    });

    hookResult.current.mutate(QUOTE);

    await waitFor(() => expect(hookResult.current.isError).toBe(true), {
      timeout: 2500,
    });

    expect(showApiErrorToast).toHaveBeenCalledWith("This quote has expired.");
    expect(showApiSuccessToast).not.toHaveBeenCalled();
  });

  it("confirmExchange resolves the contract-shaped result", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        transactionId: "TXN-000003",
        status: "COMPLETED",
        fromCurrency: "USD",
        toCurrency: "EUR",
        sourceAmount: "100.00",
        fee: "0.75",
        rate: "0.9230",
        destinationAmount: "92.23",
        createdAt: "2026-09-08T12:00:00Z",
      } satisfies ExchangeResult,
    });

    const result = await confirmExchange(QUOTE);
    expect(result.status).toBe("COMPLETED");
    expect(result.fromCurrency).toBe("USD");
    expect(result.destinationAmount).toBe("92.23");
  });
});

