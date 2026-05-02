import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight middleware:
 *   1. Permanent redirect /preview/* → /app/* (24h+ grace for the URLs we
 *      shipped this morning).
 *   2. Optional cookie pre-check on /app/** and /founders/war-room/** so
 *      requests without any session cookie short-circuit straight to the
 *      respective login. The actual cryptographic verification happens in the
 *      gated layouts (cookies()) — this is purely a fast-path filter.
 *
 * Note: middleware runs on the Edge runtime, so we cannot import node:crypto
 * here. The full HMAC verification stays in the server-component layouts.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. /preview/* → /app/*. The old /preview shipped /preview/engines/[slug]
  //    drill-ins that don't exist in /app anymore; redirect those to the
  //    /app dashboard so morning-shipped URLs from Joshua resolve to a
  //    real screen, not a 404. Other /preview/* paths map 1:1 to /app/*.
  if (pathname === "/preview" || pathname.startsWith("/preview/")) {
    const target = req.nextUrl.clone();
    if (pathname.startsWith("/preview/engines")) {
      target.pathname = "/app";
    } else {
      target.pathname = pathname.replace(/^\/preview/, "/app") || "/app";
    }
    return NextResponse.redirect(target, { status: 308 });
  }

  // 2. Fast-path cookie presence check.
  if (pathname.startsWith("/app") && pathname !== "/app/login") {
    const hasCookie =
      req.cookies.get("gladius_demo_session")?.value ||
      req.cookies.get("gt_preview_session")?.value;
    if (!hasCookie) {
      const target = req.nextUrl.clone();
      target.pathname = "/app/login";
      target.search = "";
      return NextResponse.redirect(target);
    }
  }

  if (pathname.startsWith("/founders/war-room")) {
    const hasCookie =
      req.cookies.get("gladius_founder_session")?.value ||
      req.cookies.get("gt_founders_session")?.value;
    if (!hasCookie) {
      const target = req.nextUrl.clone();
      target.pathname = "/founders/login";
      target.search = "";
      return NextResponse.redirect(target);
    }
  }

  // 3. Bright Lights demo gate. The unlock screen (root path) and the unlock
  //    POST route stay open; everything deeper requires the signed cookie.
  if (
    pathname.startsWith("/demo/bright-lights-encina") &&
    pathname !== "/demo/bright-lights-encina" &&
    pathname !== "/demo/bright-lights-encina/"
  ) {
    const hasCookie = req.cookies.get("bright_lights_demo")?.value;
    if (!hasCookie) {
      const target = req.nextUrl.clone();
      target.pathname = "/demo/bright-lights-encina";
      target.search = "";
      return NextResponse.redirect(target);
    }
  }

  // No-op for everything else.
  void search;
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/preview",
    "/preview/:path*",
    "/app",
    "/app/:path*",
    "/founders/war-room",
    "/founders/war-room/:path*",
    "/demo/bright-lights-encina",
    "/demo/bright-lights-encina/:path*",
  ],
};
