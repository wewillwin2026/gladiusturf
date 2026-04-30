import { NextResponse } from "next/server";
import {
  verifyAppEmail,
  verifyAppPassword,
  createAppSessionCookieValue,
  buildAppSetCookieHeader,
  buildLegacyClearHeader,
} from "@/lib/app-auth";

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
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }
  if (!verifyAppEmail(email) || !verifyAppPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookie = createAppSessionCookieValue();
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", buildAppSetCookieHeader(cookie));
  res.headers.append("Set-Cookie", buildLegacyClearHeader());
  return res;
}
