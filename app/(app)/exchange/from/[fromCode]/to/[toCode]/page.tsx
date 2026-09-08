import type { Metadata } from "next";
import { AmountPage } from "@/features/exchange";

export const metadata: Metadata = {
  title: "Exchange — Flow Pay",
};

export default async function AmountRoute({
  params,
}: PageProps<"/exchange/from/[fromCode]/to/[toCode]">) {
  const { fromCode, toCode } = await params;
  return (
    <AmountPage
      fromCode={fromCode.toUpperCase()}
      toCode={toCode.toUpperCase()}
    />
  );
}
