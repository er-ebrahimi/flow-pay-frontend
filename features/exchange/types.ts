// Contract-shaped exchange types — docs/API_CONTRACT.md.
// Money/rates arrive as fixed-precision strings; quotes are a two-step flow
// (POST /exchange-quotes → POST /exchanges with an Idempotency-Key header).

export interface Currency {
  code: string;
  name: string;
  decimalPlaces: number;
  /** Global statistic from the live spec: wallets holding this currency. */
  walletCount: number;
}

export interface ExchangeRate {
  base: string;
  quote: string;
  rate: string;
  asOf: string;
}

export interface ExchangeQuote {
  quoteId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  fee: string;
  rate: string;
  destinationAmount: string;
  expiresAt: string;
}

export interface ExchangeResult {
  transactionId: string;
  status: "COMPLETED";
  fromCurrency: string;
  toCurrency: string;
  sourceAmount: string;
  fee: string;
  rate: string;
  destinationAmount: string;
  createdAt: string;
}
