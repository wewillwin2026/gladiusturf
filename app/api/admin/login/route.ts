import { NextResponse } from "next/server";
import {
  verifyEmail,
  verifyPassword,
  createSessionCookieValue,
  buildSetCookieHeader,
} from "@/lib/admin-auth";

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
  if (!verifyEmail(email) || !verifyPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookie = createSessionCookieValue();
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildSetCookieHeader(cookie));
  return res;
}
