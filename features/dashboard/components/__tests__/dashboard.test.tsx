import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "../dashboard";
import { useDashboard } from "../../api/use-dashboard";
import { useWallets } from "@/features/wallets";
import type { Wallet } from "@/features/wallets";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { email: "alex@example.com" } } }),
  signOut: vi.fn(),
}));

vi.mock("../../api/use-dashboard", () => ({
  useDashboard: vi.fn(),
}));

// The dashboard reads real wallet balances — stub the hook, keep the real
// WalletCard so the card rendering is still exercised.
vi.mock("@/features/wallets", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/wallets")>();
  return { ...actual, useWallets: vi.fn() };
});

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

import React from "react";

const WALLETS: Wallet[] = [
  { currencyCode: "USD", balance: "4250.00", transactionCount: 24 },
  { currencyCode: "EUR", balance: "1840.50", transactionCount: 12 },
  { currencyCode: "GBP", balance: "620.75", transactionCount: 5 },
  { currencyCode: "JPY", balance: "82400.00", transactionCount: 3 },
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
  vi.mocked(useDashboard).mockReturnValue({
    data: {
      totalBalanceBase: "18542.72",
      baseCurrency: "USD",
      wallets: WALLETS,
      recentTransactions: [],
    },
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useDashboard>);
  vi.mocked(useWallets).mockReturnValue({
    data: WALLETS,
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useWallets>);
});

describe("Dashboard (integration)", () => {
  it("renders the real total balance, wallets, and an empty recent state", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    // Real total from the aggregate.
    expect(
      await screen.findByText("$18,542.72", {}, { timeout: 2500 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Base currency · USD")).toBeInTheDocument();

    // Real wallet rail.
    expect(await screen.findByText("$4,250.00")).toBeInTheDocument();
    expect(screen.getByText("US Dollar")).toBeInTheDocument();
    expect(screen.getByText("My wallets")).toBeInTheDocument();
    expect(screen.getByText("5 currencies")).toBeInTheDocument();

    // Recent is empty until the user makes exchanges.
    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
      "href",
      "/transactions",
    );

    // Session header with the logout action.
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });
});
