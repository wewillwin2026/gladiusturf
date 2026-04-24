import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type DemoBody = {
  crewName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  currentSoftware?: string;
  crewSize?: string;
};

const FOUNDER_EMAIL = "founders@gladiusturf.com";

export async function POST(req: Request) {
  let body: DemoBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required: (keyof DemoBody)[] = [
    "crewName",
    "ownerName",
    "email",
    "phone",
    "currentSoftware",
    "crewSize",
  ];
  const missing = required.filter((k) => !body[k] || !String(body[k]).trim());
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // Persist to Supabase (table created on first insert via migration; skip-on-error so form still works)
  try {
    const sb = supabaseAdmin();
    await sb.from("demo_requests").insert({
      crew_name: body.crewName,
      owner_name: body.ownerName,
      email: body.email,
      phone: body.phone,
      current_software: body.currentSoftware,
      crew_size: body.crewSize,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase insert failed (non-fatal)", err);
  }

  // Email founder via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "GladiusTurf <demo@gladiusturf.com>",
        to: FOUNDER_EMAIL,
        subject: `Demo request — ${body.crewName} (${body.crewSize})`,
        text: [
          `Crew: ${body.crewName}`,
          `Owner: ${body.ownerName}`,
          `Email: ${body.email}`,
          `Phone: ${body.phone}`,
          `Current software: ${body.currentSoftware}`,
          `Crew size: ${body.crewSize}`,
        ].join("\n"),
      });
    } catch (err) {
      console.warn("Resend send failed (non-fatal)", err);
    }
  }

  return NextResponse.json({ ok: true });
}
