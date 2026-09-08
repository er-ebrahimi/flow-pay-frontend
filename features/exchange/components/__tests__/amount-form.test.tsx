import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AmountForm } from "../amount-form";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

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
  pushMock.mockClear();
});

describe("AmountForm", () => {
  it("shows the live rate and receive estimate once loaded", async () => {
    render(
      <AmountForm
        fromCurrency="USD"
        toCurrency="EUR"
        decimalPlaces={2}
        toDecimalPlaces={2}
        balance="100.00"
      />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText("Exchange rate")).toBeInTheDocument();
    expect(screen.getByText("1 USD = 0.9230 EUR")).toBeInTheDocument();

    // The receive estimate only renders once an amount is entered.
    await userEvent.type(screen.getByLabelText("Amount to exchange"), "50");
    expect(await screen.findByText("You receive")).toBeInTheDocument();
  });

  it("blocks decimals for zero-decimal currencies (JPY)", async () => {
    render(
      <AmountForm
        fromCurrency="JPY"
        toCurrency="USD"
        decimalPlaces={0}
        toDecimalPlaces={2}
        balance="82400.00"
      />,
      { wrapper: createWrapper() },
    );

    await screen.findByText("Exchange rate");
    const input = screen.getByLabelText("Amount to exchange");
    await userEvent.type(input, "12.5");

    expect(screen.getByText("Up to 0 decimal places.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get quote" })).toBeDisabled();
  });

  it("disables the quote when the amount exceeds the balance", async () => {
    render(
      <AmountForm
        fromCurrency="USD"
        toCurrency="EUR"
        decimalPlaces={2}
        toDecimalPlaces={2}
        balance="100.00"
      />,
      { wrapper: createWrapper() },
    );

    await screen.findByText("Exchange rate");
    await userEvent.type(screen.getByLabelText("Amount to exchange"), "500");

    expect(screen.getByText("Insufficient USD balance.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get quote" })).toBeDisabled();
  });

  it("Max fills the wallet balance", async () => {
    render(
      <AmountForm
        fromCurrency="USD"
        toCurrency="EUR"
        decimalPlaces={2}
        toDecimalPlaces={2}
        balance="100.00"
      />,
      { wrapper: createWrapper() },
    );

    await screen.findByText("Exchange rate");
    await userEvent.click(screen.getByRole("button", { name: "Max" }));

    expect(screen.getByDisplayValue("100.00")).toBeInTheDocument();
  });

  it("navigates to the review route with the amount on submit", async () => {
    render(
      <AmountForm
        fromCurrency="USD"
        toCurrency="EUR"
        decimalPlaces={2}
        toDecimalPlaces={2}
        balance="100.00"
      />,
      { wrapper: createWrapper() },
    );

    await screen.findByText("Exchange rate");
    await userEvent.type(screen.getByLabelText("Amount to exchange"), "50");
    await userEvent.click(screen.getByRole("button", { name: "Get quote" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/exchange/from/USD/to/EUR/review?amount=50",
      );
    });
  });
});
