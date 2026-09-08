import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WalletPage } from "../wallet-page";
import { useWallet } from "../../api/use-wallet";
import { apiError } from "@/lib/api-error";
import type { WalletDetail } from "../../types";
import { TRANSACTION_FIXTURES } from "@/features/transactions/api/fixtures";
import { useTransactions } from "@/features/transactions";

const { backMock } = vi.hoisted(() => ({ backMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: backMock,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Boundary mock: GET /wallets/:code is now a real axios call — the page test
// stubs the hook instead (TEST.md §5). GET /transactions is also real now, so
// stub that too; the transactions side keeps the feature's mock transport
// otherwise.
vi.mock("../../api/use-wallet", () => ({
  useWallet: vi.fn(),
}));

vi.mock("@/features/transactions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/transactions")>();
  return { ...actual, useTransactions: vi.fn() };
});

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

import React from "react";

const USD_WALLET: WalletDetail = {
  currencyCode: "USD",
  balance: "4250.00",
  transactionCount: 24,
  createdAt: "2026-01-12T09:00:00Z",
};

const CHF_WALLET: WalletDetail = {
  currencyCode: "CHF",
  balance: "0.00",
  transactionCount: 0,
  createdAt: "2026-08-01T12:00:00Z",
};

function mockWallet(wallet: WalletDetail | null) {
  const result = wallet
    ? { data: wallet, isPending: false, isError: false, error: null }
    : {
        data: undefined,
        isPending: false,
        isError: true,
        error: apiError(404, "NOT_FOUND", "No wallet for ZZZ"),
      };
  vi.mocked(useWallet).mockReturnValue(
    result as unknown as ReturnType<typeof useWallet>,
  );
}

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
  // Mirror the real API: filter by currency (source or destination side).
  vi.mocked(useTransactions).mockImplementation((filters) => {
    const items = TRANSACTION_FIXTURES.filter(
      (tx) =>
        !filters?.currency ||
        tx.fromCurrency === filters.currency ||
        tx.toCurrency === filters.currency,
    );
    return {
      data: { items, page: 1, limit: 20, total: items.length },
      isPending: false,
      isError: false,
      error: null,
    } as never;
  });
});

describe("WalletPage (integration)", () => {
  it("renders the summary and the currency's transactions", async () => {
    mockWallet(USD_WALLET);
    render(<WalletPage currencyCode="USD" />, { wrapper: createWrapper() });

    expect(await screen.findByText("$4,250.00", {}, { timeout: 2500 })).toBeInTheDocument();
    expect(await screen.findByText(/TXN-000001/)).toBeInTheDocument();
    // Four fixtures touch USD on either side of the pair.
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("shows the empty state for a wallet with no transactions", async () => {
    mockWallet(CHF_WALLET);
    render(<WalletPage currencyCode="CHF" />, { wrapper: createWrapper() });

    expect(
      await screen.findByText("No transactions yet", {}, { timeout: 2500 }),
    ).toBeInTheDocument();
  });

  it("renders the 404 error state for an unknown wallet", async () => {
    mockWallet(null);
    render(<WalletPage currencyCode="ZZZ" />, { wrapper: createWrapper() });

    expect(
      await screen.findByText("Could not load this wallet", {}, { timeout: 2500 }),
    ).toBeInTheDocument();
  });
});
