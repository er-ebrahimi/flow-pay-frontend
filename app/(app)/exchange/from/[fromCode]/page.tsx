import type { Metadata } from "next";
import { SelectTargetPage } from "@/features/exchange";

export const metadata: Metadata = {
  title: "Exchange — Flow Pay",
};

export default async function SelectTargetRoute({
  params,
}: PageProps<"/exchange/from/[fromCode]">) {
  const { fromCode } = await params;
  return <SelectTargetPage fromCode={fromCode.toUpperCase()} />;
}
