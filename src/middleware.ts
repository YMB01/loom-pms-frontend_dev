import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Must match `AUTH_TOKEN_COOKIE` in `src/lib/api.ts`. */
const TOKEN_COOKIE = "loom_pms_token";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const hasToken = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  const url = request.nextUrl.clone();
  url.pathname = hasToken ? "/dashboard" : "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/"],
};
