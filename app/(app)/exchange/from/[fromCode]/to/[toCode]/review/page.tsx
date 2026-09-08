import type { Metadata } from "next";
import { ReviewPage } from "@/features/exchange";

export const metadata: Metadata = {
  title: "Review — Flow Pay",
};

export default async function ReviewRoute({
  params,
  searchParams,
}: PageProps<"/exchange/from/[fromCode]/to/[toCode]/review">) {
  const { fromCode, toCode } = await params;
  const query = await searchParams;
  const amount = Array.isArray(query.amount) ? query.amount[0] : query.amount;

  return (
    <ReviewPage
      fromCode={fromCode.toUpperCase()}
      toCode={toCode.toUpperCase()}
      amount={amount ?? ""}
    />
  );
}
