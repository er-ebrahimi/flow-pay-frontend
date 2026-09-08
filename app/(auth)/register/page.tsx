import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Create account — Flow Pay",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold tracking-tight">
          Create account
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Start exchanging currencies today.
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
