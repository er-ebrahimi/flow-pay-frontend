"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth";

// The session carries only the access token (docs/API_CONTRACT.md has no
// profile endpoint), so the greeting works from the email — or degrades to a
// generic welcome when there isn't one.

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader() {
  const { data: session } = useSession();
  const email = session?.user?.email;
  const logout = useLogout();

  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {greetingFor(new Date().getHours())}
        </p>
        <p className="mt-1 text-base font-semibold">
          {email ? email.split("@")[0] : "Welcome back"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, {
              // The local session dies either way — the server call is hygiene.
              onSettled: () => signOut({ callbackUrl: "/login" }),
            })
          }
        >
          {logout.isPending ? null : <LogOutIcon aria-hidden="true" />}
        </Button>
        <div
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold"
        >
          {email ? email[0].toUpperCase() : "F"}
        </div>
      </div>
    </header>
  );
}
