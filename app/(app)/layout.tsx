import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { requireSession } from "@/features/auth/server";

/**
 * Authenticated shell. The server-side guard redirects anonymous visitors to
 * /login (FILE_MANAGEMENT §1.1 — auth lives in the auth feature, not in
 * middleware). Navigation: bottom bar on mobile/tablet, sidebar rail from lg.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireSession();

  return (
    <div className="min-h-svh">
      <SidebarNav />
      <div className="lg:pl-56">
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 lg:px-8 lg:pb-12 lg:pt-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
