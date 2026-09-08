import "server-only";
import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth-options";

/**
 * Server-side guard for the authenticated shell (FILE_MANAGEMENT §1.1 —
 * authorization lives here, not in middleware/proxy). No session → /login.
 * The callbackUrl preservation for expired sessions is handled client-side by
 * the axios 401 interceptor; this guard covers direct URL visits.
 */
export async function requireSession(): Promise<Session> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}
