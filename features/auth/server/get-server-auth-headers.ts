import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { setServerAuthProvider } from "@/lib/axios";

// Connects NextAuth to the server bundle's axios request interceptor so
// server components can make authenticated requests without passing headers
// manually. Server components don't have access to the request object, so
// they can't read cookies or headers directly; instead they rely on this
// provider to get the current user's access token from the session.
export async function getServerAuthHeaders(): Promise<{ Authorization: string } | null> {
  const session = await getServerSession(authOptions);
  const access = session?.user?.access;
  if (!access) return null;
  return { Authorization: `Bearer ${access}` };
}

// The server bundle's axios request interceptor attaches auth automatically
// through this provider, so server components never pass headers manually.
setServerAuthProvider(getServerAuthHeaders);
