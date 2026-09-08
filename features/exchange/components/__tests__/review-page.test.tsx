import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewPage } from "../review-page";
import { useExchangeQuote } from "../../api/use-exchange-quote";
import { apiError } from "@/lib/api-error";
import type { ExchangeQuote } from "../../types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Both the quote and confirm calls are real axios now — stub the hooks
// (TEST.md §5) and drive their states directly.
vi.mock("../../api/use-exchange-quote", () => ({
  useExchangeQuote: vi.fn(),
  exchangeQuoteKey: vi.fn(
    (from: string, to: string, amount: string) =>
      ["exchangeQuote", from, to, amount] as const,
  ),
}));

vi.mock("../../api/use-confirm-exchange", () => ({
  useConfirmExchange: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  })),
}));

const QUOTE: ExchangeQuote = {
  quoteId: "quote-1",
  fromCurrency: "EUR",
  toCurrency: "GBP",
  amount: "100.00",
  fee: "0.75",
  rate: "0.8560",
  destinationAmount: "85.54",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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

describe("ReviewPage (integration)", () => {
  it("bounces to the amount step when no amount was provided", () => {
    vi.mocked(useExchangeQuote).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
    } as never);

    render(<ReviewPage fromCode="USD" toCode="EUR" amount="" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Could not get a quote")).toBeInTheDocument();
    expect(screen.getByText("No amount to exchange.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change amount" })).toBeInTheDocument();
  });

  it("renders the locked quote with the confirm action", async () => {
    vi.mocked(useExchangeQuote).mockReturnValue({
      data: QUOTE,
      isPending: false,
      isError: false,
      error: null,
    } as never);

    render(<ReviewPage fromCode="EUR" toCode="GBP" amount="100" />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText("You send", {}, { timeout: 2500 })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm exchange" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Rate locks for/)).toBeInTheDocument();
  });

  it("shows the failure screen with a way back when the balance is insufficient", async () => {
    vi.mocked(useExchangeQuote).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: apiError(422, "INSUFFICIENT_BALANCE", "Not enough CHF balance."),
    } as never);

    render(<ReviewPage fromCode="CHF" toCode="USD" amount="100" />, {
      wrapper: createWrapper(),
    });

    expect(
      await screen.findByText("Could not get a quote", {}, { timeout: 2500 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Not enough CHF balance.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change amount" })).toBeInTheDocument();
  });
});
