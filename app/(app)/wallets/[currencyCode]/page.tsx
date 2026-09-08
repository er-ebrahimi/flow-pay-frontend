import type { Metadata } from "next";
import { WalletPage } from "@/features/wallets";

export const metadata: Metadata = {
  title: "Wallet — Flow Pay",
};

export default async function WalletRoute({
  params,
}: PageProps<"/wallets/[currencyCode]">) {
  const { currencyCode } = await params;
  return <WalletPage currencyCode={currencyCode.toUpperCase()} />;
}
