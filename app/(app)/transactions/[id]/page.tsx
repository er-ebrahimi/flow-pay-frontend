import type { Metadata } from "next";
import { TransactionDetailPage } from "@/features/transactions";

export const metadata: Metadata = {
  title: "Transaction — Flow Pay",
};

export default async function TransactionDetailRoute({
  params,
}: PageProps<"/transactions/[id]">) {
  const { id } = await params;
  return <TransactionDetailPage id={id} />;
}
