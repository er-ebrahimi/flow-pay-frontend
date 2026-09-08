import type { Metadata } from "next";
import { TransactionsPage } from "@/features/transactions";

export const metadata: Metadata = {
  title: "History — Flow Pay",
};

export default function TransactionsRoute() {
  return <TransactionsPage />;
}
