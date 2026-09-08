// Centralized backend API endpoint paths (docs/API_CONTRACT.md).
//
// Every feature's api module imports its paths from here — paths are never
// hardcoded inline. Parameterized routes use builder functions so encoding and
// the URL shape live in exactly one place.

export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
  },

  currencies: "/currencies",
  wallets: "/wallets",
  wallet: (currencyCode: string) =>
    `/wallets/${encodeURIComponent(currencyCode)}`,

  dashboard: "/dashboard",
  transactions: "/transactions",
  transaction: (id: string) => `/transactions/${encodeURIComponent(id)}`,

  exchangeRates: "/exchange-rates",
  exchangeQuotes: "/exchange-quotes",
  exchanges: "/exchanges",
} as const;
