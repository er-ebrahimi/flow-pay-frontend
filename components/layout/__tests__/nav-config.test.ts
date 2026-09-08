import { describe, expect, it } from "vitest";
import { isActiveNavItem } from "../nav-config";

describe("isActiveNavItem", () => {
  it("matches the home route exactly only", () => {
    expect(isActiveNavItem("/", "/")).toBe(true);
    expect(isActiveNavItem("/transactions", "/")).toBe(false);
  });

  it("matches a section root", () => {
    expect(isActiveNavItem("/exchange", "/exchange")).toBe(true);
  });

  it("matches a section's nested routes", () => {
    expect(
      isActiveNavItem("/transactions/TXN-000001", "/transactions"),
    ).toBe(true);
    expect(
      isActiveNavItem("/exchange/from/USD/to/EUR", "/exchange"),
    ).toBe(true);
  });

  it("does not match prefix lookalikes", () => {
    expect(isActiveNavItem("/transactions-other", "/transactions")).toBe(false);
  });
});
