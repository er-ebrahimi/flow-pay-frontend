import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionsPage } from "../transactions-page";
import { useTransactions } from "../../api/use-transactions";
import { TRANSACTION_FIXTURES } from "../../api/fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// GET /transactions is a real axios call now — stub the hook (TEST.md §5).
vi.mock("../../api/use-transactions", () => ({
  useTransactions: vi.fn(),
  MOCK_TRANSACTIONS: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

import React from "react";

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
  vi.mocked(useTransactions).mockReturnValue({
    data: { items: TRANSACTION_FIXTURES, page: 1, limit: 20, total: 5 },
    isPending: false,
    isError: false,
    error: null,
  } as never);
});

describe("TransactionsPage (integration)", () => {
  it("renders the total count and the transaction rows", async () => {
    render(<TransactionsPage />, { wrapper: createWrapper() });

    expect(await screen.findByText("5 total · All currencies")).toBeInTheDocument();
    expect(await screen.findByText(/TXN-000001/)).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it("toggles the type filter chips", async () => {
    render(<TransactionsPage />, { wrapper: createWrapper() });

    await screen.findByText(/TXN-000001/);
    const exchangeChip = screen.getByRole("button", { name: "Exchange" });

    await userEvent.click(exchangeChip);
    expect(exchangeChip).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "All" }));
    expect(exchangeChip).toHaveAttribute("aria-pressed", "false");
  });
});
