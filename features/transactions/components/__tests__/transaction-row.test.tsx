import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { TRANSACTION_FIXTURES } from "../../api/fixtures";
import { TransactionRow } from "../transaction-row";

// The row is a next/link; render it as a plain anchor so the unit test
// exercises the row's own behavior, not the router.
vi.mock("next/link", () => ({
  default: (props: {
    href: string;
    children?: React.ReactNode;
  }) =>
    React.createElement(
      "a",
      { href: props.href },
      props.children,
    ),
}));

describe("TransactionRow", () => {
  const tx = TRANSACTION_FIXTURES[0];

  it("links to the transaction detail route", () => {
    render(<TransactionRow transaction={tx} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/transactions/TXN-000001");
  });

  it("shows the currency pair and both amounts", () => {
    render(<TransactionRow transaction={tx} />);
    // The row renders compact (mobile) and wide (md+) variants side by side
    // in jsdom — the pair and amounts legitimately appear in both.
    expect(screen.getAllByText("USD → EUR").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$500.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("€461.50").length).toBeGreaterThan(0);
  });

  it("shows the status badge", () => {
    render(<TransactionRow transaction={tx} />);
    expect(screen.getAllByText("completed").length).toBeGreaterThan(0);
  });
});
