import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH, SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Gate for the admin area (Next 16 renamed the `middleware` convention to
 * `proxy`). Runs before every `/admin/**` request: unauthenticated visitors are
 * sent to the login page, authenticated ones are bounced away from it. Pages and
 * Server Actions guard themselves again via `requireSession()`.
 */
export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = request.nextUrl;
  const isLoginRoute = pathname === ADMIN_LOGIN_PATH;

  if (!session && !isLoginRoute) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginRoute) {
    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  }

  const response = NextResponse.next();
  // Belt and braces alongside the `robots` metadata on the admin layout.
  response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
