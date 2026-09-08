import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TransactionStatusBadge } from "../transaction-status-badge";

describe("TransactionStatusBadge", () => {
  it("renders the status in lowercase", () => {
    render(<TransactionStatusBadge status="COMPLETED" />);
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("uses the destructive voice for failures", () => {
    const { container } = render(<TransactionStatusBadge status="FAILED" />);
    expect(screen.getByText("failed")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-destructive");
  });

  it("uses the muted voice for pending", () => {
    const { container } = render(<TransactionStatusBadge status="PENDING" />);
    expect(container.firstChild).toHaveClass("text-muted-foreground");
  });

  it("uses the primary tint for completed", () => {
    const { container } = render(<TransactionStatusBadge status="COMPLETED" />);
    expect(container.firstChild).toHaveClass("bg-primary/10");
  });
});
