import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type Tier = "independent" | "professional" | "enterprise";

type DemoBody = {
  // contact
  crewName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  currentSoftware?: string;
  crewSize?: string;
  // tier + calendar
  tier?: Tier;
  wantsBdc?: boolean;
  preferredDate?: string;   // YYYY-MM-DD
  preferredTime?: string;   // HH:MM (ET)
  preferredAt?: string;     // ISO if client computed it
  altTimeNote?: string;
  // attribution
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  source_page?: string;
};

const FOUNDER_EMAILS = ["ricardo.gamon99@icloud.com", "joshuapyorke@gmail.com"];
const FROM = (process.env.RESEND_FROM_EMAIL || "").trim() || "GladiusTurf <founders@gladiusturf.com>";

const TIER_DISPLAY: Record<Tier, string> = {
  independent: "Independent · $597/crew/mo",
  professional: "Professional · $1,497/crew/mo",
  enterprise: "Enterprise · $3,997/crew/mo",
};

const FIELD_LABELS: Record<string, string> = {
  crewName: "crew name",
  ownerName: "your name",
  email: "email",
  phone: "phone",
  currentSoftware: "current software",
  crewSize: "crew size",
  tier: "tier",
  preferredDate: "preferred date",
  preferredTime: "preferred time",
};

export async function POST(req: Request) {
  let body: DemoBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 2026-05-12 schema cut: only the 3 fields the homepage form collects
  // are required. The rest are nullable and the founder gathers them on
  // the call itself.
  const required = ["crewName", "email", "phone"] as const;
  const missing = required.filter((k) => !body[k] || !String(body[k]).trim());
  if (missing.length) {
    const labels = missing.map((k) => FIELD_LABELS[k] ?? k).join(", ");
    return NextResponse.json(
      { error: `Please fill in the following required fields: ${labels}.` },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim())) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  // tier is now optional; only validate when present.
  const tier: Tier | null = (() => {
    const v = body.tier;
    if (!v || !["independent", "professional", "enterprise"].includes(v)) {
      return null;
    }
    return v;
  })();

  // Compute preferred_at on the server (ignore client value to keep one source of truth)
  // Using ET tz string; Postgres will store as timestamptz in UTC.
  let preferredAtIso: string | null = null;
  try {
    if (body.preferredDate && body.preferredTime) {
      // Compose as ET; let Postgres normalize. Use timezone "America/New_York".
      // Build ISO with explicit -04:00 fallback (DST approximation; March–November) — server
      // doesn't need to be exact since this is a *prospect's preference*, not a calendar event.
      const dt = new Date(`${body.preferredDate}T${body.preferredTime}:00-04:00`);
      if (!Number.isNaN(dt.getTime())) preferredAtIso = dt.toISOString();
    } else if (body.preferredAt) {
      const dt = new Date(body.preferredAt);
      if (!Number.isNaN(dt.getTime())) preferredAtIso = dt.toISOString();
    }
  } catch {
    /* preferred_at is nullable — alt_time_note will catch it */
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const ipHash = ip
    ? createHash("sha256").update(ip).digest("hex").slice(0, 32)
    : null;

  // Insert booking
  let bookingId: string | null = null;
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("demo_requests")
      .insert({
        crew_name: body.crewName,
        owner_name: body.ownerName || null,
        email: String(body.email).trim().toLowerCase(),
        phone: body.phone,
        current_software: body.currentSoftware || null,
        crew_size: body.crewSize || null,
        tier_interest: tier,
        wants_bdc: Boolean(body.wantsBdc),
        preferred_at: preferredAtIso,
        alt_time_note: body.altTimeNote || null,
        status: "new",
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_term: body.utm_term || null,
        utm_content: body.utm_content || null,
        referrer: body.referrer || null,
        source_page: body.source_page || null,
        ip_hash: ipHash,
      })
      .select("id")
      .single();
    if (error) {
      console.warn("Supabase insert failed", error);
    } else {
      bookingId = data?.id ?? null;
      if (bookingId) {
        const noteBits: string[] = ["Demo booked."];
        if (body.preferredDate && body.preferredTime) {
          noteBits.push(`Preferred ${body.preferredDate} ${body.preferredTime} ET.`);
        }
        if (body.altTimeNote) {
          noteBits.push(`Note: ${body.altTimeNote}`);
        }
        await sb.from("pipeline_events").insert({
          booking_id: bookingId,
          event_type: "created",
          to_value: tier || "untiered",
          actor: "prospect",
          note: noteBits.join(" "),
        });
      }
    }
  } catch (err) {
    console.warn("Supabase insert errored", err);
  }

  // Founder alert via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const lines: (string | null)[] = [
        `Crew: ${body.crewName}`,
        body.ownerName ? `Owner: ${body.ownerName}` : null,
        `Email: ${body.email}`,
        `Phone: ${body.phone}`,
      ];
      if (tier) {
        lines.push("", `Tier: ${TIER_DISPLAY[tier]}`);
      }
      if (body.wantsBdc) {
        lines.push(`Add-on: GladiusBDC (+$499/mo)`);
      }
      if (body.preferredDate && body.preferredTime) {
        lines.push("", `Preferred: ${body.preferredDate} at ${body.preferredTime} ET`);
      }
      if (body.altTimeNote) {
        lines.push(`Best window / notes: ${body.altTimeNote}`);
      }
      if (body.currentSoftware) {
        lines.push("", `Current software: ${body.currentSoftware}`);
      }
      if (body.crewSize) {
        lines.push(`Crew size: ${body.crewSize}`);
      }
      lines.push(
        "",
        `Source: ${body.source_page || "—"}`,
        body.utm_source
          ? `UTM: ${body.utm_source} / ${body.utm_medium || "—"} / ${body.utm_campaign || "—"}`
          : null,
        body.referrer ? `Referrer: ${body.referrer}` : null,
        "",
        `Open in War Room → https://gladiusturf.com/founders/war-room`,
      );

      const subjectTail = tier
        ? ` · ${TIER_DISPLAY[tier].split(" · ")[0]}${body.wantsBdc ? " + BDC" : ""}`
        : "";
      const subject = `🚨 Demo · ${body.crewName}${subjectTail}`;

      await resend.emails.send({
        from: FROM,
        to: FOUNDER_EMAILS,
        replyTo: String(body.email),
        subject,
        text: lines.filter((l) => l !== null).join("\n"),
      });
    } catch (err) {
      console.warn("Resend send failed (non-fatal)", err);
    }
  }

  return NextResponse.json({ ok: true, id: bookingId });
}
