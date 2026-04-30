import { NextResponse } from "next/server";
import {
  buildFounderSetCookieHeader,
  createFounderSessionCookieValue,
  recordFounderLogin,
  upsertFounderTotpSecret,
  verifyMagicToken,
} from "@/lib/founders/auth";
import { generateTotpSecret, totpUri, verifyTotpCode } from "@/lib/founders/totp";

export const runtime = "nodejs";

/**
 * Two-step enrollment.
 *  GET  ?token=…           → returns { secret, otpauthUri } so the page can
 *                            render a QR code for the authenticator app.
 *  POST { token, secret, code } → verifies the user's first TOTP code with the
 *                            generated secret, persists the secret, and
 *                            issues a session cookie.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const tok = verifyMagicToken(token);
  if (!tok) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }
  const secret = generateTotpSecret();
  return NextResponse.json({
    secret,
    otpauthUri: totpUri(tok.email, secret),
    email: tok.email,
  });
}

export async function POST(req: Request) {
  let body: { token?: string; secret?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = String(body.token || "").trim();
  const secret = String(body.secret || "").trim();
  const code = String(body.code || "").trim();
  if (!token || !secret || !code) {
    return NextResponse.json(
      { error: "Token, secret, and code required" },
      { status: 400 },
    );
  }

  const tok = verifyMagicToken(token);
  if (!tok) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  if (!verifyTotpCode(secret, code)) {
    return NextResponse.json(
      { error: "Code didn't match. Try again." },
      { status: 401 },
    );
  }

  try {
    await upsertFounderTotpSecret(tok.email, secret);
  } catch (err) {
    console.error("upsertFounderTotpSecret failed", err);
    return NextResponse.json(
      {
        error:
          "Couldn't save your enrollment. Make sure the founder_secrets table exists.",
      },
      { status: 500 },
    );
  }
  await recordFounderLogin(tok.email);

  const cookie = createFounderSessionCookieValue(tok.email);
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildFounderSetCookieHeader(cookie));
  return res;
}
