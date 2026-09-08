// Contract-shaped transaction types — docs/API_CONTRACT.md.
// The backend only issues exchanges today; DEPOSIT/WITHDRAWAL stay out of the
// type until the contract grows them (wireframe-only concepts were dropped).

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export type TransactionType = "EXCHANGE";

export interface Transaction {
  id: string;
  type: TransactionType;
  fromCurrency: string;
  toCurrency: string;
  sourceAmount: string;
  fee: string;
  rate: string;
  destinationAmount: string;
  status: TransactionStatus;
  createdAt: string;
  /** Quote that froze the exchange (uuid). Present on the detail response. */
  quoteId?: string;
}

export interface TransactionList {
  items: Transaction[];
  page: number;
  limit: number;
  total: number;
}

/** Query params for GET /transactions (subset the UI actually sends). */
export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  currency?: string;
}
