import { NextResponse } from "next/server";
import {
  verifyPreviewEmail,
  verifyPreviewPassword,
  createPreviewSessionCookieValue,
  buildPreviewSetCookieHeader,
} from "@/lib/preview-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  if (!verifyPreviewEmail(email) || !verifyPreviewPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookie = createPreviewSessionCookieValue();
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildPreviewSetCookieHeader(cookie));
  return res;
}
