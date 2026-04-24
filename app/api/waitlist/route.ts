import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type WaitlistBody = { email?: string; source?: string };

export async function POST(req: Request) {
  let body: WaitlistBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const source = body.source?.trim() || "unknown";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const sb = supabaseAdmin();
    await sb.from("waitlist").insert({
      email,
      source,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase waitlist insert failed (non-fatal)", err);
  }

  return NextResponse.json({ ok: true });
}
