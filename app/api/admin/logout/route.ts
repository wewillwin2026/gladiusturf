import { NextResponse } from "next/server";
import { buildSetCookieHeader } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL("/founders/login", req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.headers.set("Set-Cookie", buildSetCookieHeader("", { clear: true }));
  return res;
}
