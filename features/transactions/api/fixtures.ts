import type { Transaction } from "../types";

// Test fixtures for the transactions feature. The list/detail/row tests and
// the wallet-history page all render against these; they mirror the shape of
// the contract's GET /transactions response (docs/API_CONTRACT.md) with
// UUID-style ids used as display labels.

export const TRANSACTION_FIXTURES: Transaction[] = [
  {
    id: "TXN-000001",
    type: "EXCHANGE",
    fromCurrency: "USD",
    toCurrency: "EUR",
    sourceAmount: "500.00",
    fee: "2.50",
    rate: "0.9230",
    destinationAmount: "461.50",
    status: "COMPLETED",
    createdAt: "2026-09-07T10:24:00Z",
  },
  {
    id: "TXN-000002",
    type: "EXCHANGE",
    fromCurrency: "EUR",
    toCurrency: "GBP",
    sourceAmount: "200.00",
    fee: "1.00",
    rate: "0.8560",
    destinationAmount: "171.20",
    status: "COMPLETED",
    createdAt: "2026-09-06T15:40:00Z",
  },
  {
    id: "TXN-000003",
    type: "EXCHANGE",
    fromCurrency: "USD",
    toCurrency: "JPY",
    sourceAmount: "300.00",
    fee: "1.50",
    rate: "149.5000",
    destinationAmount: "44850",
    status: "PENDING",
    createdAt: "2026-09-04T18:05:00Z",
  },
  {
    id: "TXN-000004",
    type: "EXCHANGE",
    fromCurrency: "GBP",
    toCurrency: "USD",
    sourceAmount: "150.00",
    fee: "0.75",
    rate: "1.2750",
    destinationAmount: "191.25",
    status: "FAILED",
    createdAt: "2026-09-03T12:30:00Z",
  },
  {
    id: "TXN-000005",
    type: "EXCHANGE",
    fromCurrency: "USD",
    toCurrency: "EUR",
    sourceAmount: "75.00",
    fee: "0.38",
    rate: "0.9210",
    destinationAmount: "68.95",
    status: "COMPLETED",
    createdAt: "2026-09-01T08:12:00Z",
  },
];
