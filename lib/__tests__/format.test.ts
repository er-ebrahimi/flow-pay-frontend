import { describe, expect, it } from "vitest";
import {
  formatDateTime,
  formatDate,
  formatMoney,
  formatRate,
  formatTime,
} from "../format";

describe("formatMoney", () => {
  it("formats a USD amount from the contract's string form", () => {
    expect(formatMoney("10000.00", "USD")).toBe("$10,000.00");
  });

  it("respects the currency's decimalPlaces (JPY = 0)", () => {
    expect(formatMoney("82400", "JPY", 0)).toBe("¥82,400");
  });

  it("keeps the currency code visible when Intl doesn't know it", () => {
    // Node's Intl renders unknown-but-well-formed codes without throwing;
    // either way the code and amount must both survive.
    const output = formatMoney("12.50", "XYZ", 2);
    expect(output).toContain("XYZ");
    expect(output).toContain("12.50");
  });

  it("passes the raw string through when it isn't a number", () => {
    expect(formatMoney("not-a-number", "USD")).toBe("USD not-a-number");
  });
});

describe("formatRate", () => {
  it("shows four decimal places between currency codes", () => {
    expect(formatRate("0.9230", "USD", "EUR")).toBe("1 USD = 0.9230 EUR");
  });

  it("passes a non-numeric rate through untouched", () => {
    expect(formatRate("meh", "USD", "EUR")).toBe("1 USD = meh EUR");
  });
});

describe("date and time", () => {
  it("formats an ISO timestamp as a short date", () => {
    expect(formatDate("2026-09-07T10:24:00Z")).toMatch(/Sep 7, 2026|Sept? 7, 2026/);
  });

  it("formats the time as hour:minute", () => {
    // Timezone-dependent — assert the shape, not the exact clock value.
    expect(formatTime("2026-09-07T10:24:00Z")).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
  });

  it("returns the raw string for invalid dates", () => {
    expect(formatDate("garbage")).toBe("garbage");
    expect(formatTime("garbage")).toBe("garbage");
  });

  it("combines both in formatDateTime", () => {
    expect(formatDateTime("2026-09-07T10:24:00Z")).toMatch(
      /, 2026 · \d{1,2}:\d{2} (AM|PM)$/,
    );
  });
});
