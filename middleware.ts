import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lets Server Components (SiteHeader, SiteFooter, AddCourseFab) know the
// current path without becoming Client Components — used to hide the
// site's real chrome on /style-preview/* routes, which render their own.
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/style-preview/:path*",
};
