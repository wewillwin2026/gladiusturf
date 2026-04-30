import { NextResponse } from "next/server";
import { buildFounderSetCookieHeader } from "@/lib/founders/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL("/founders/login", req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.headers.append(
    "Set-Cookie",
    buildFounderSetCookieHeader("", { clear: true }),
  );
  // Also clear legacy gt_founders_session cookie from the previous auth.
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
  );
  return res;
}
