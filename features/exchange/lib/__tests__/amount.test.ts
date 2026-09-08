import { describe, expect, it } from "vitest";
import {
  exceedsPrecision,
  formatAmount,
  normalizeAmountInput,
  parseAmount,
} from "../amount";

describe("normalizeAmountInput", () => {
  it("strips non-numeric characters", () => {
    expect(normalizeAmountInput("$1,234.50abc")).toBe("1234.50");
  });

  it("keeps only the first dot", () => {
    expect(normalizeAmountInput("1.2.3")).toBe("1.23");
  });

  it("allows a trailing dot while typing", () => {
    expect(normalizeAmountInput("12.")).toBe("12.");
  });
});

describe("exceedsPrecision", () => {
  it("accepts whole numbers for zero-decimal currencies (JPY)", () => {
    expect(exceedsPrecision("44850", 0)).toBe(false);
  });

  it("rejects fractions for zero-decimal currencies (JPY)", () => {
    expect(exceedsPrecision("1.5", 0)).toBe(true);
  });

  it("rejects a third decimal for two-decimal currencies", () => {
    expect(exceedsPrecision("10.001", 2)).toBe(true);
  });

  it("accepts two decimals for two-decimal currencies", () => {
    expect(exceedsPrecision("10.01", 2)).toBe(false);
  });
});

describe("parseAmount", () => {
  it("returns null for empty input", () => {
    expect(parseAmount("")).toBeNull();
  });

  it("returns null for zero and negative values", () => {
    expect(parseAmount("0")).toBeNull();
    expect(parseAmount("-5")).toBeNull();
  });

  it("parses a valid positive amount", () => {
    expect(parseAmount("500.00")).toBe(500);
  });
});

describe("formatAmount", () => {
  it("renders the contract's fixed-precision string", () => {
    expect(formatAmount(500, 2)).toBe("500.00");
    expect(formatAmount(44850, 0)).toBe("44850");
  });
});
