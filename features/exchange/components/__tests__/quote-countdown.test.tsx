import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formatCountdown, secondsLeft } from "../quote-countdown";

describe("secondsLeft", () => {
  it("counts whole seconds remaining", () => {
    const expiresAt = new Date(Date.now() + 30_500).toISOString();
    expect(secondsLeft(expiresAt)).toBe(31);
  });

  it("floors at zero once expired", () => {
    const expiresAt = new Date(Date.now() - 60_000).toISOString();
    expect(secondsLeft(expiresAt)).toBe(0);
  });

  it("returns zero for garbage input", () => {
    expect(secondsLeft("not-a-date")).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("pads seconds", () => {
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(9)).toBe("0:09");
  });
});

describe("QuoteCountdown rendering", () => {
  it("shows the expired message for a past expiry", async () => {
    const { QuoteCountdown } = await import("../quote-countdown");
    render(
      <QuoteCountdown
        expiresAt={new Date(Date.now() - 1000).toISOString()}
      />,
    );
    expect(await screen.findByText(/Quote expired/)).toBeInTheDocument();
  });
});
