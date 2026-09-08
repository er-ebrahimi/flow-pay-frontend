// Formatting helpers for API-contract data: money arrives as fixed-precision
// strings ("10000.00"; JPY-style currencies with decimalPlaces 0), rates as
// string decimals, timestamps as ISO. English output until i18n lands.

const LOCALE = "en-US";

export function formatMoney(
  amount: string,
  currencyCode: string,
  decimalPlaces = 2,
): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return `${currencyCode} ${amount}`;
  }
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value);
  } catch {
    // Unknown currency code for Intl — keep the code visible.
    return `${currencyCode} ${value.toFixed(decimalPlaces)}`;
  }
}

/** "1 USD = 0.8512 EUR" — rates always show 4 dp regardless of currency scale. */
export function formatRate(
  rate: string,
  fromCurrency: string,
  toCurrency: string,
): string {
  const value = Number(rate);
  if (!Number.isFinite(value)) {
    return `1 ${fromCurrency} = ${rate} ${toCurrency}`;
  }
  return `1 ${fromCurrency} = ${value.toFixed(4)} ${toCurrency}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}
