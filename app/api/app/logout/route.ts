import { NextResponse } from "next/server";
import {
  buildAppSetCookieHeader,
  buildLegacyClearHeader,
} from "@/lib/app-auth";
import { buildTenantSetCookieHeader } from "@/lib/app/tenant-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL("/app/login", req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  // Clear every app-side session cookie, regardless of which one signed
  // the user in. Belt-and-suspenders so logout is reliable across the
  // demo / legacy / tenant flows.
  res.headers.append("Set-Cookie", buildAppSetCookieHeader("", { clear: true }));
  res.headers.append("Set-Cookie", buildLegacyClearHeader());
  res.headers.append("Set-Cookie", buildTenantSetCookieHeader("", { clear: true }));
  return res;
}
