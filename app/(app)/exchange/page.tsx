import type { Metadata } from "next";
import { ExchangeHome } from "@/features/exchange";

export const metadata: Metadata = {
  title: "Exchange — Flow Pay",
};

export default function ExchangeRoute() {
  return <ExchangeHome />;
}
