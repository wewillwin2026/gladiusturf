import { NextResponse } from "next/server";
import {
  buildFounderSetCookieHeader,
  createFounderSessionCookieValue,
  getFounderSecret,
  recordFounderLogin,
  verifyMagicToken,
} from "@/lib/founders/auth";
import { verifyTotpCode } from "@/lib/founders/totp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { token?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = String(body.token || "").trim();
  const code = String(body.code || "").trim();
  if (!token || !code) {
    return NextResponse.json(
      { error: "Token and code required" },
      { status: 400 },
    );
  }

  const tok = verifyMagicToken(token);
  if (!tok) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  const secret = await getFounderSecret(tok.email);
  if (!secret?.totp_secret) {
    return NextResponse.json(
      { error: "Not enrolled. Visit /founders/enroll first." },
      { status: 412 },
    );
  }

  if (!verifyTotpCode(secret.totp_secret, code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  await recordFounderLogin(tok.email);

  const cookie = createFounderSessionCookieValue(tok.email);
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildFounderSetCookieHeader(cookie));
  return res;
}
