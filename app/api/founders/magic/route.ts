import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createMagicToken, isFounderEmail } from "@/lib/founders/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Always return ok=true to avoid email enumeration. If the email is in
  // the founder allowlist, we also send the magic link.
  if (!isFounderEmail(email)) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[founders/magic] RESEND_API_KEY missing");
    // Fail open with ok=true so we don't leak the allowlist via timing.
    return NextResponse.json({ ok: true });
  }

  const token = createMagicToken(email);
  const origin = req.headers.get("origin") || "https://gladiusturf.com";
  const link = `${origin}/founders/verify?token=${encodeURIComponent(token)}`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "GladiusTurf War Room <war-room@gladiusturf.com>",
      to: email,
      subject: "Your War Room sign-in link",
      text: [
        `Sign in to the GladiusTurf War Room.`,
        ``,
        `Click here (valid for 15 minutes):`,
        link,
        ``,
        `If you didn't request this, ignore this email — your TOTP code is still required to complete sign-in.`,
        ``,
        `— Centurions`,
      ].join("\n"),
    });
  } catch (err) {
    console.warn("[founders/magic] Resend send failed", err);
  }

  return NextResponse.json({ ok: true });
}
