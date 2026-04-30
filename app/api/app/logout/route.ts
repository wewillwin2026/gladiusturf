import { NextResponse } from "next/server";
import {
  buildAppSetCookieHeader,
  buildLegacyClearHeader,
} from "@/lib/app-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL("/app/login", req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.headers.append("Set-Cookie", buildAppSetCookieHeader("", { clear: true }));
  res.headers.append("Set-Cookie", buildLegacyClearHeader());
  return res;
}
