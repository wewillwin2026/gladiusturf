import { NextResponse } from "next/server";
import { buildPreviewSetCookieHeader } from "@/lib/preview-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL("/preview/login", req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.headers.set("Set-Cookie", buildPreviewSetCookieHeader("", { clear: true }));
  return res;
}
