import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewPage } from "../review-page";
import { useWallets } from "@/features/wallets";
import type { Wallet } from "@/features/wallets";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// The review page reads the real wallet balance for the quote pre-check —
// stub the hook, keep everything else from the wallets feature.
vi.mock("@/features/wallets", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/wallets")>();
  return { ...actual, useWallets: vi.fn() };
});

const WALLETS: Wallet[] = [
  { currencyCode: "USD", balance: "4250.00", transactionCount: 24 },
  { currencyCode: "EUR", balance: "1840.50", transactionCount: 12 },
  { currencyCode: "CHF", balance: "0.00", transactionCount: 0 },
];

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
  vi.mocked(useWallets).mockReturnValue({
    data: WALLETS,
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useWallets>);
});

describe("ReviewPage (integration)", () => {
  it("bounces to the amount step when no amount was provided", () => {
    render(<ReviewPage fromCode="USD" toCode="EUR" amount="" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Could not get a quote")).toBeInTheDocument();
    expect(screen.getByText("No amount to exchange.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change amount" })).toBeInTheDocument();
  });

  it("renders the locked quote with the confirm action", async () => {
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
