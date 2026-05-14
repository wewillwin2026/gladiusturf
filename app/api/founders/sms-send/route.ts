import { NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/founders/auth";
import {
  founderPhone,
  generateSmsOtp,
  sendSmsOtp,
} from "@/lib/founders/sms-otp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const token = String(body.token || "").trim();
  const tok = verifyMagicToken(token);
  if (!tok) {
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 401 });
  }

  const phone = founderPhone(tok.email);
  if (!phone) {
    return NextResponse.json({ error: "no_phone_configured" }, { status: 412 });
  }

  const code = generateSmsOtp(tok.email);
  const result = await sendSmsOtp(phone, code);
  if (!result.ok) {
    console.warn("[founders/sms-send] Twilio failed", result.error);
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
