import { supabaseAdmin } from "@/lib/supabase";

export type Channel = "sms" | "email" | "voice";

export type ConsentDecision =
  | { ok: true }
  | { ok: false; reason: "no_consent" | "opted_out" | "quiet_hours" | "blocked_day" | "lookup_failed" };

/**
 * Server-side gate for any outbound message to a customer. Every send path
 * (Twilio, Resend, voice via Twilio, future SMS campaigns) MUST call this
 * before dispatch. If the answer is `ok: false`, do not send — surface the
 * reason in the audit log so the tenant can see why.
 *
 * v1 implementation:
 *   - opted_out / no row in customer_messaging_consent → reject
 *   - quiet hours per tenant_messaging_settings (timezone applied) → reject
 *   - blocked weekday → reject
 *
 * v2 (later): per-state DNC list checks, federal DNC list integration,
 * per-customer quiet-hours overrides.
 */
export async function canSend(
  tenantId: string,
  customerId: string,
  channel: Channel,
  now = new Date(),
): Promise<ConsentDecision> {
  const sb = supabaseAdmin();

  const [consentRes, settingsRes] = await Promise.all([
    sb
      .from("customer_messaging_consent")
      .select("status, revoked_at")
      .eq("tenant_id", tenantId)
      .eq("customer_id", customerId)
      .eq("channel", channel)
      .maybeSingle(),
    sb
      .from("tenant_messaging_settings")
      .select(
        "quiet_hours_start, quiet_hours_end, blocked_weekdays, timezone",
      )
      .eq("tenant_id", tenantId)
      .maybeSingle(),
  ]);

  if (consentRes.error || settingsRes.error) {
    console.warn(
      "[canSend] lookup error",
      consentRes.error,
      settingsRes.error,
    );
    return { ok: false, reason: "lookup_failed" };
  }

  return decideConsent({
    consent: consentRes.data,
    settings: settingsRes.data,
    now,
  });
}

export type ConsentRow = {
  status: string;
  revoked_at: string | null;
} | null;

export type SettingsRow = {
  quiet_hours_start: number;
  quiet_hours_end: number;
  blocked_weekdays: string;
  timezone: string;
} | null;

/**
 * Pure decision function — no DB, no I/O. Given a consent row, a
 * settings row, and a clock, decide whether the send should pass.
 * Exposed for unit testing the gate independently of Supabase.
 */
export function decideConsent({
  consent,
  settings: settingsIn,
  now,
}: {
  consent: ConsentRow;
  settings: SettingsRow;
  now: Date;
}): ConsentDecision {
  if (!consent) return { ok: false, reason: "no_consent" };
  if (consent.status === "opted_out" || consent.revoked_at) {
    return { ok: false, reason: "opted_out" };
  }
  if (consent.status !== "opted_in") {
    return { ok: false, reason: "no_consent" };
  }

  // Tenant settings — fall back to safe defaults if missing.
  const settings: NonNullable<SettingsRow> = settingsIn ?? {
    quiet_hours_start: 20,
    quiet_hours_end: 8,
    blocked_weekdays: "",
    timezone: "America/New_York",
  };

  // Resolve hour + weekday in the tenant's timezone via Intl
  // formatToParts. The earlier toLocaleString-then-parse pattern is a
  // well-known DST footgun.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: settings.timezone,
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hourPart = parts.find((p) => p.type === "hour")?.value ?? "0";
  const weekdayPart = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = Number.parseInt(hourPart, 10) % 24;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekdayPart,
  );

  const blockedDays = (settings.blocked_weekdays || "")
    .split(",")
    .map((s: string) => Number.parseInt(s.trim(), 10))
    .filter((n: number) => Number.isFinite(n));
  if (blockedDays.includes(weekday)) {
    return { ok: false, reason: "blocked_day" };
  }

  const start = settings.quiet_hours_start;
  const end = settings.quiet_hours_end;
  // start > end means the window wraps midnight (e.g. 20→8 = 8pm to 8am).
  const inQuiet =
    start > end ? hour >= start || hour < end : hour >= start && hour < end;
  if (inQuiet) {
    return { ok: false, reason: "quiet_hours" };
  }

  return { ok: true };
}

/**
 * Record a consent attestation (e.g. from CSV import where the tenant
 * checked "I have lawful basis to contact these customers"). Marks status
 * pending until the contact actually replies STOP/HELP or visits a confirmation
 * link — not opted_in. Tenants can promote pending → opted_in once they have
 * stronger evidence.
 */
export async function recordAttestation(
  tenantId: string,
  customerId: string,
  channel: Channel,
  consentText: string,
  consentVersion = "v1",
): Promise<void> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  await sb.from("customer_messaging_consent").upsert(
    {
      tenant_id: tenantId,
      customer_id: customerId,
      channel,
      status: "pending",
      source: "attestation",
      consent_text: consentText,
      consent_at: now,
      consent_version: consentVersion,
      created_at: now,
      updated_at: now,
    },
    { onConflict: "tenant_id,customer_id,channel" },
  );
}
