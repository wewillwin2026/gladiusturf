import { NextResponse } from "next/server";
import { Resend } from "resend";
import { founderEmails } from "@/lib/founders/auth";

export const runtime = "nodejs";

type Body = {
  phone?: string;
  name?: string;
  shop?: string;
  topic?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = String(body.phone || "").trim();
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  const name = String(body.name || "").trim() || "Unknown caller";
  const shop = String(body.shop || "").trim() || "Shop name not given";
  const topic = String(body.topic || "").trim() || "—";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[bdc/callback] RESEND_API_KEY missing — accepting callback request anyway");
    return NextResponse.json({ ok: true });
  }

  const founders = founderEmails();
  if (founders.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const subject = `📞 BDC callback request · ${name} · ${shop}`;
  const text = [
    `GladiusBDC inbound callback request — call within 60 seconds.`,
    ``,
    `Caller: ${name}`,
    `Shop:   ${shop}`,
    `Phone:  ${phone}`,
    `Topic:  ${topic}`,
    ``,
    `Source: gladiusturf.com/demo · Live BDC button`,
    `Timestamp: ${new Date().toISOString()}`,
    ``,
    `— Centurions`,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "GladiusBDC <bdc@gladiusturf.com>",
      to: founders,
      subject,
      text,
    });
  } catch (err) {
    console.warn("[bdc/callback] Resend send failed", err);
  }

  return NextResponse.json({ ok: true });
}
