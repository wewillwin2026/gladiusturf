"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { FL_HURRICANE_ZIPS } from "@/lib/storm/zips";
import { sendSmsToCustomer, dispatcherMode } from "@/lib/messaging/dispatch";

export type StormArmResult =
  | {
      ok: true;
      mode: "live" | "dry_run";
      attempted: number;
      sent: number;
      dryRun: number;
      blocked: number;
      failed: number;
      reasons: Record<string, number>;
    }
  | { ok: false; error: string };

type StormCustomer = {
  id: string;
  display_name: string | null;
  language: string | null;
  customer_tier: string | null;
  service_address: { zip?: string } | null;
};

function bodyFor(language: string, tenantName: string, firstName: string): string {
  const safeFirst = firstName || "there";
  if (language === "es") {
    return `Hola ${safeFirst} — pasando a saludar después de la tormenta. Si su sistema de iluminación tiene algún daño, responda o reserve una ventana de reparación prioritaria. — ${tenantName}`;
  }
  return `Hi ${safeFirst} — checking in after the storm. If your lighting system has any damage, reply or click below to book a priority repair window. — ${tenantName}`;
}

function firstNameOf(name: string | null): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  return parts[0] ?? "";
}

/**
 * Arm Storm Mode — queue a check-in to every customer in the affected ZIPs.
 *
 * Behavior:
 *   - In dry_run mode (no Twilio env), every send is logged to audit_log
 *     as "message.dry_run" so the operator sees exactly what would have
 *     gone out. The button on the page surfaces this distinction.
 *   - In live mode, real SMS goes out.
 *   - In both modes, the canSend() consent gate still blocks messages
 *     to customers without opted_in consent or during quiet hours.
 *
 * Top-tier (Guardian) members are dispatched first so the priority-queue
 * promise on the marketing copy is real.
 */
export async function armStormMode(): Promise<StormArmResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { ok: false, error: "not_authorized" };
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("customers")
    .select("id, display_name, language, customer_tier, service_address")
    .eq("tenant_id", session.tenant.id);
  if (error) {
    return { ok: false, error: error.message };
  }

  const rows = (data ?? []) as StormCustomer[];
  const inStorm = rows.filter((c) => {
    const zip = c.service_address?.zip;
    return zip && FL_HURRICANE_ZIPS.has(zip);
  });

  const guardians = inStorm.filter((c) =>
    (c.customer_tier ?? "").toLowerCase().includes("guardian"),
  );
  const others = inStorm.filter(
    (c) => !(c.customer_tier ?? "").toLowerCase().includes("guardian"),
  );
  const ordered = [...guardians, ...others];

  const tenantName = session.tenant.display_name ?? "your team";
  let sent = 0;
  let dryRun = 0;
  let blocked = 0;
  let failed = 0;
  const reasons: Record<string, number> = {};

  for (const customer of ordered) {
    const lang =
      (customer.language ?? "").toLowerCase() === "es" ? "es" : "en";
    const body = bodyFor(lang, tenantName, firstNameOf(customer.display_name));

    const res = await sendSmsToCustomer({
      tenantId: session.tenant.id,
      customerId: customer.id,
      body,
      source: "storm-mode",
    });

    if (res.ok) {
      if (res.mode === "sent") sent += 1;
      else dryRun += 1;
    } else {
      if (res.reason === "no_consent" || res.reason === "opted_out" || res.reason === "quiet_hours" || res.reason === "blocked_day") {
        blocked += 1;
      } else {
        failed += 1;
      }
      reasons[res.reason] = (reasons[res.reason] ?? 0) + 1;
    }
  }

  // Audit the activation event itself so the trust console shows
  // "Storm Mode armed" with the operator who triggered it.
  await sb.from("audit_log").insert({
    tenant_id: session.tenant.id,
    user_id: null,
    action: "storm_mode.armed",
    entity_type: "automation",
    entity_id: "storm",
    metadata: {
      operator_email: session.email,
      mode: dispatcherMode(),
      attempted: ordered.length,
      sent,
      dry_run: dryRun,
      blocked,
      failed,
      reasons,
    },
  });

  revalidatePath("/app/automations/storm");
  revalidatePath("/app/trust");

  return {
    ok: true,
    mode: dispatcherMode(),
    attempted: ordered.length,
    sent,
    dryRun,
    blocked,
    failed,
    reasons,
  };
}
