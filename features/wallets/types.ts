// Contract-shaped wallet types — docs/API_CONTRACT.md.
// Money arrives as fixed-precision strings, never numbers.

export interface Wallet {
  currencyCode: string;
  balance: string;
  transactionCount: number;
}

export interface WalletDetail extends Wallet {
  createdAt: string;
}
