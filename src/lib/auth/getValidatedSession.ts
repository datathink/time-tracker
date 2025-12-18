import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, type Session } from "@/lib/auth/auth";

/**
 * Validates the session on the server side and redirects to login if invalid.
 * Use this in Server Components (page.tsx) to ensure authenticated access.
 *
 * @returns The validated session with user data
 * @throws Redirects to /login if session is invalid
 */
export async function getValidatedSession(): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

/**
 * Validates session and checks if user has admin role.
 * Redirects to /login if not authenticated.
 * Returns the session and isAdmin boolean.
 */
export async function getValidatedSessionWithRole(): Promise<{
  session: Session;
  isAdmin: boolean;
}> {
  const session = await getValidatedSession();
  const isAdmin = session.user.role === "admin";

  return { session, isAdmin };
}
