import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_LOGIN_PATH,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
  type AdminSession,
} from "@/lib/auth";

/**
 * Server-side session helpers (Server Components, Route Handlers, Server
 * Actions). Split from `lib/auth.ts` because `next/headers` is unavailable in
 * middleware.
 */

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

/**
 * Guard for every admin page and mutation. Middleware already blocks
 * unauthenticated navigation; this is the second line of defence that also
 * covers Server Actions, which middleware does not see.
 */
export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();

  if (!session) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return session;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
