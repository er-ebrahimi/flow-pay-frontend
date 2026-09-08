// Amount-string handling for the exchange form. The contract carries amounts
// as fixed-precision strings and rejects wrong precision per currency
// (decimalPlaces: JPY = 0, USD = 2), so the form clamps input before it ever
// reaches POST /exchange-quotes.

/** Keeps digits and at most one dot; strips everything else as the user types. */
export function normalizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return `${cleaned.slice(0, firstDot + 1)}${cleaned
    .slice(firstDot + 1)
    .replace(/\./g, "")}`;
}

export function exceedsPrecision(
  input: string,
  decimalPlaces: number,
): boolean {
  const dot = input.indexOf(".");
  if (dot === -1) return false;
  return input.length - dot - 1 > decimalPlaces;
}

/** Returns a positive finite number, or null when the input isn't a usable amount. */
export function parseAmount(input: string): number | null {
  if (!input) return null;
  const value = Number(input);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Contract format: fixed precision string, e.g. JPY → "44850", USD → "500.00". */
export function formatAmount(value: number, decimalPlaces: number): string {
  return value.toFixed(decimalPlaces);
}
