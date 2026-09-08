import type { Metadata } from "next";
import { Dashboard } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Flow Pay",
};

export default function DashboardRoute() {
  return <Dashboard />;
}
