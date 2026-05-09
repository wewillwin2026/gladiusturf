import { supabaseAdmin } from "@/lib/supabase";
import { sendSmsToCustomer } from "@/lib/messaging/dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Auto review-ask SMS cron — Bright Lights Day-1 (2026-05-08).
 *
 * Companion to the "Auto-send a review-ask SMS 3 days after a service visit"
 * toggle on /app/reviews. The toggle writes `tenants.review_ask_enabled`
 * (bool); this cron is the engine that actually scans schedule_items and
 * fires the SMS through the platform's standard outbound choke-point.
 *
 * Schedule: daily at 14:00 UTC (10:00 EDT) — sane window for FL service
 * businesses. Window: completed visits whose starts_at falls in
 * [now()-4d, now()-3d]. The 24-hour window is wide enough that a one-day
 * cron miss doesn't create silent gaps (next run picks up yesterday's
 * cohort), but narrow enough that a single visit fires at most once.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}` — same pattern as the
 * inventory-aging cron. Vercel Cron injects this header automatically.
 *
 * Idempotence: per-customer 60-day audit-log dedupe on action=
 * 'review_ask.sent'. A returning customer who got an ask 30 days ago
 * for a different visit will NOT be re-asked. This is the spam guard
 * the Bright Lights contract Section 2.2 demands.
 *
 * Tenant scoping: every query filters by tenant_id. We never trust a
 * customer_id without re-confirming it lives under the tenant we're
 * iterating — sendSmsToCustomer enforces that internally too.
 *
 * Consent: sendSmsToCustomer runs canSend() (consent + quiet-hours +
 * blocked-day) on every send. STOP-listed customers never see this
 * message. If Twilio creds are absent the dispatcher falls to dry-run
 * and logs message.dry_run, which still satisfies our audit-log dedupe
 * (we log review_ask.sent regardless of send mode — the tenant opted
 * into the cadence and a real attempt was made).
 *
 * Templates: bilingual, picked from customer.preferred_language. Same
 * voice as the review-ask templates the manual button on
 * /app/customers/[id] will reuse once that ships (currently TODO in
 * app/app/(authed)/reviews/actions.ts).
 */

type EligibleVisit = {
  id: string;
  customer_id: string;
};

type CustomerRow = {
  id: string;
  display_name: string;
  preferred_language: "en" | "es";
};

type TenantRow = {
  id: string;
  display_name: string;
  /**
   * Optional — column not in the v1 schema yet. Selected opportunistically
   * via a separate query so missing-column errors don't break the cron.
   */
  review_url?: string | null;
};

const ELIGIBLE_TYPES = [
  "service",
  "install",
  "warranty",
  "storm_response",
] as const;

const DEDUPE_DAYS = 60;
const WINDOW_START_DAYS = 4; // older bound — visits older than this are skipped
const WINDOW_END_DAYS = 3; // newer bound — visits newer than this haven't matured yet

function buildBody(args: {
  language: "en" | "es";
  tenantDisplayName: string;
  reviewUrl: string;
}): string {
  const { language, tenantDisplayName, reviewUrl } = args;
  if (language === "es") {
    return `Gracias por confiar en ${tenantDisplayName}. Si tuvo una buena experiencia, una reseña de 30 segundos nos ayuda muchísimo: ${reviewUrl}  — Responda STOP para cancelar.`;
  }
  return `Thank you for trusting ${tenantDisplayName}. If you had a good experience, a 30-second review goes a long way: ${reviewUrl}  — Reply STOP to opt out.`;
}

export async function GET(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[cron/auto-review-ask] CRON_SECRET not set");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const now = Date.now();
  const windowStartIso = new Date(
    now - WINDOW_START_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const windowEndIso = new Date(
    now - WINDOW_END_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const dedupeCutoffIso = new Date(
    now - DEDUPE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  try {
    // 1. Pull every tenant that opted in. Defensive: review_ask_enabled
    //    may be missing on legacy rows — the column has a NOT NULL default,
    //    so a strict equality check is fine.
    const { data: tenants, error: tenantsErr } = await sb
      .from("tenants")
      .select("id, display_name")
      .eq("review_ask_enabled", true)
      .eq("active", true);
    if (tenantsErr) {
      console.error("[cron/auto-review-ask] tenant query error", tenantsErr);
      return Response.json({ error: tenantsErr.message }, { status: 500 });
    }

    const tenantRows = (tenants ?? []) as TenantRow[];
    if (tenantRows.length === 0) {
      return Response.json({
        ok: true,
        scanned_tenants: 0,
        sent_count: 0,
        blocked_count: 0,
        failed_count: 0,
      });
    }

    // 2. Best-effort opportunistic fetch of tenants.review_url. The column
    //    isn't in the v1 schema yet; if the select fails (column missing)
    //    we silently fall back to a placeholder per tenant. This lets the
    //    cron upgrade automatically the day a future migration adds the
    //    column without code change here.
    const reviewUrlByTenant = new Map<string, string>();
    try {
      const { data: urlRows, error: urlErr } = await sb
        .from("tenants")
        .select("id, review_url")
        .in(
          "id",
          tenantRows.map((t) => t.id),
        );
      if (!urlErr && urlRows) {
        for (const row of urlRows as Array<{
          id: string;
          review_url: string | null;
        }>) {
          if (row.review_url && row.review_url.trim().length > 0) {
            reviewUrlByTenant.set(row.id, row.review_url.trim());
          }
        }
      }
    } catch {
      // Column doesn't exist yet — placeholder fallback below handles it.
    }

    let totalSent = 0;
    let totalBlocked = 0;
    let totalFailed = 0;

    for (const tenant of tenantRows) {
      const reviewUrl =
        reviewUrlByTenant.get(tenant.id) ??
        `https://gladiusturf.com/r/${tenant.id}`;

      // 3. Find candidate visits in the [now-4d, now-3d] window.
      const { data: visits, error: visitsErr } = await sb
        .from("schedule_items")
        .select("id, customer_id")
        .eq("tenant_id", tenant.id)
        .eq("status", "completed")
        .in("type", ELIGIBLE_TYPES as unknown as string[])
        .gte("starts_at", windowStartIso)
        .lte("starts_at", windowEndIso)
        .not("customer_id", "is", null);
      if (visitsErr) {
        console.error(
          `[cron/auto-review-ask] visit query error tenant=${tenant.id}`,
          visitsErr,
        );
        totalFailed += 1;
        continue;
      }

      const candidates = (visits ?? []) as EligibleVisit[];
      if (candidates.length === 0) continue;

      // 4. Collapse to one ask per customer (the latest visit wins
      //    naturally since we've narrowed to a 24h window — but a single
      //    customer can have two completed visits inside that band, e.g.
      //    a service call + a warranty follow-up).
      const customerIds = Array.from(
        new Set(candidates.map((v) => v.customer_id)),
      );

      // 5. Dedupe — pull every audit_log row in the last 60 days where
      //    we already fired a review_ask.sent for one of these customers.
      const { data: priorAsks, error: priorErr } = await sb
        .from("audit_log")
        .select("entity_id")
        .eq("tenant_id", tenant.id)
        .eq("action", "review_ask.sent")
        .eq("entity_type", "customer")
        .gte("created_at", dedupeCutoffIso)
        .in("entity_id", customerIds);
      if (priorErr) {
        console.error(
          `[cron/auto-review-ask] dedupe query error tenant=${tenant.id}`,
          priorErr,
        );
        totalFailed += 1;
        continue;
      }

      const askedRecently = new Set<string>(
        (priorAsks ?? []).map(
          (r) => (r as { entity_id: string }).entity_id,
        ),
      );
      const eligibleCustomerIds = customerIds.filter(
        (cid) => !askedRecently.has(cid),
      );
      if (eligibleCustomerIds.length === 0) continue;

      // 6. Resolve display_name + preferred_language for the survivors.
      const { data: customers, error: custErr } = await sb
        .from("customers")
        .select("id, display_name, preferred_language")
        .eq("tenant_id", tenant.id)
        .in("id", eligibleCustomerIds);
      if (custErr) {
        console.error(
          `[cron/auto-review-ask] customer query error tenant=${tenant.id}`,
          custErr,
        );
        totalFailed += 1;
        continue;
      }

      const customerRows = (customers ?? []) as CustomerRow[];

      // 7. Fire the SMS for each eligible customer. The dispatcher
      //    handles consent, quiet hours, and audit-logging the
      //    message.sent / message.blocked / message.dry_run row.
      //    We add our own review_ask.sent row on top so the dedupe
      //    query in step 5 catches subsequent attempts.
      for (const customer of customerRows) {
        const language = customer.preferred_language ?? "en";
        const body = buildBody({
          language,
          tenantDisplayName: tenant.display_name,
          reviewUrl,
        });

        const result = await sendSmsToCustomer({
          tenantId: tenant.id,
          customerId: customer.id,
          body,
          source: "auto_review_ask",
        });

        if (result.ok) {
          totalSent += 1;
        } else if (result.reason && result.reason !== "twilio_exception") {
          // canSend() rejection (consent / quiet-hours / blocked-day) or
          // missing phone — neither is "platform broken", so count as
          // blocked rather than failed.
          totalBlocked += 1;
        } else {
          totalFailed += 1;
        }

        // Always stamp review_ask.sent on a real send-attempt outcome
        // (sent OR dry-run). On hard rejections we skip the marker so a
        // future run can retry once the consent/phone gap is resolved.
        if (result.ok) {
          try {
            await sb.from("audit_log").insert({
              tenant_id: tenant.id,
              user_id: null,
              action: "review_ask.sent",
              entity_type: "customer",
              entity_id: customer.id,
              metadata: {
                source: "auto_review_ask",
                mode: result.mode,
                language,
                review_url: reviewUrl,
              },
            });
          } catch (err) {
            console.warn(
              "[cron/auto-review-ask] audit insert failed (non-fatal)",
              err,
            );
          }
        }
      }
    }

    return Response.json({
      ok: true,
      scanned_tenants: tenantRows.length,
      sent_count: totalSent,
      blocked_count: totalBlocked,
      failed_count: totalFailed,
    });
  } catch (err) {
    console.error("[cron/auto-review-ask] unhandled error", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
