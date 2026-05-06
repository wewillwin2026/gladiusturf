import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Weekly inventory-aging reminder cron.
 *
 * Runs Mondays at 12:00 UTC (~7:00 AM Eastern). For each tenant, finds
 * inventory_units that have been sitting `in_stock` for 90+ days and emails
 * the tenant owner a short list of the oldest 5 units with a CTA back into
 * the app.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`. This is the pattern Vercel
 * Cron uses when it dispatches scheduled requests — it injects the same
 * Authorization header automatically when CRON_SECRET is set on the project.
 *
 * "Owner email" is sourced from `tenant_invitations` (role='owner', status=
 * 'active'). The schema doesn't carry an owner email column on `tenants`
 * directly — invitations are the canonical mapping of email → tenant.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gladiusturf.com";
// `radar@gladiusturf.com` so the email reads as a person, not a no-reply
// system address. Verify the alias on Resend / DNS before the first send to a
// real tenant — gracefully falls back to the configured RESEND_FROM if set.
const FROM_ADDRESS =
  process.env.RESEND_FROM || "Gladius Radar <radar@gladiusturf.com>";
const STALE_THRESHOLD_DAYS = 90;
const TOP_N = 5;

type StaleUnitRow = {
  id: string;
  tenant_id: string;
  qr_code: string;
  location: string | null;
  received_at: string;
  inventory_items: { sku: string; name: string } | { sku: string; name: string }[] | null;
};

type StaleUnit = {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  location: string | null;
  receivedAt: string;
  ageDays: number;
};

type TenantSummary = {
  id: string;
  slug: string;
  displayName: string;
  ownerEmail: string;
};

function ageInDays(receivedAt: string): number {
  const ms = Date.now() - new Date(receivedAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmail(tenantName: string, totalCount: number, topUnits: StaleUnit[]) {
  const ctaUrl = `${SITE_URL}/app/inventory?sort=oldest`;
  const oldestDays = topUnits[0]?.ageDays ?? STALE_THRESHOLD_DAYS;
  const subject = `${tenantName} — ${totalCount} fixture${totalCount === 1 ? "" : "s"} aging on your shelf (${oldestDays}d+)`;

  const htmlList = topUnits
    .map((u) => {
      const sku = escapeHtml(u.sku);
      const name = escapeHtml(u.name);
      const loc = u.location ? escapeHtml(u.location) : "—";
      return `<li style="margin-bottom:6px"><strong>${sku}</strong> &middot; ${name} &middot; <strong>${u.ageDays}d</strong> &middot; ${loc}</li>`;
    })
    .join("");

  const html = [
    `<p>Hi ${escapeHtml(tenantName)},</p>`,
    `<p>Quick Monday radar from your inventory engine — these are the units that have been sitting longest in your shop. Worth thinking about which ones to push first this week:</p>`,
    `<ul style="padding-left:18px">${htmlList}</ul>`,
    `<p style="margin-top:18px"><a href="${ctaUrl}" style="background:#00d26a;color:#0a0a0a;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:500">Review inventory →</a></p>`,
    `<p style="color:#666;font-size:12px;margin-top:32px">This radar fires every Monday morning. To pause it, reply to this email — a real person picks it up.</p>`,
    `<p style="color:#999;font-size:11px">— Gladius Radar · gladiusturf.com</p>`,
  ].join("");

  const textList = topUnits
    .map(
      (u) =>
        `- ${u.sku} · ${u.name} · ${u.ageDays}d · ${u.location ?? "—"}`,
    )
    .join("\n");

  const text = [
    `Hi ${tenantName},`,
    ``,
    `Quick Monday radar from your inventory engine — these units have been sitting longest in your shop. Worth thinking about which ones to push first this week:`,
    ``,
    textList,
    ``,
    `Review inventory: ${ctaUrl}`,
    ``,
    `This radar fires every Monday morning. Reply to pause — a real person picks it up.`,
    ``,
    `— Gladius Radar`,
  ].join("\n");

  return { subject, html, text };
}

export async function GET(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[cron/inventory-aging] CRON_SECRET not set");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = supabaseAdmin();

    // 1) Stale units across all tenants in one query.
    const cutoffIso = new Date(
      Date.now() - STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: rawUnits, error: unitsErr } = await sb
      .from("inventory_units")
      .select(
        "id, tenant_id, qr_code, location, received_at, inventory_items!inner(sku, name)",
      )
      .eq("status", "in_stock")
      .lt("received_at", cutoffIso)
      .order("received_at", { ascending: true });

    if (unitsErr) {
      console.error("[cron/inventory-aging] unit query error", unitsErr);
      return Response.json({ error: unitsErr.message }, { status: 500 });
    }

    const units: StaleUnit[] = (rawUnits ?? []).map((row) => {
      const r = row as StaleUnitRow;
      const item = Array.isArray(r.inventory_items)
        ? r.inventory_items[0]
        : r.inventory_items;
      return {
        id: r.id,
        tenantId: r.tenant_id,
        sku: item?.sku ?? r.qr_code,
        name: item?.name ?? "Unknown item",
        location: r.location,
        receivedAt: r.received_at,
        ageDays: ageInDays(r.received_at),
      };
    });

    if (units.length === 0) {
      return Response.json({ ok: true, tenantsNotified: 0, totalUnits: 0 });
    }

    // 2) Group by tenant.
    const byTenant = new Map<string, StaleUnit[]>();
    for (const u of units) {
      const arr = byTenant.get(u.tenantId);
      if (arr) arr.push(u);
      else byTenant.set(u.tenantId, [u]);
    }

    const tenantIds = Array.from(byTenant.keys());

    // 3) Resolve owner email + tenant name for each affected tenant.
    const { data: tenantRows, error: tenantErr } = await sb
      .from("tenants")
      .select("id, slug, display_name")
      .in("id", tenantIds);
    if (tenantErr) {
      console.error("[cron/inventory-aging] tenant query error", tenantErr);
      return Response.json({ error: tenantErr.message }, { status: 500 });
    }

    const { data: invitationRows, error: invErr } = await sb
      .from("tenant_invitations")
      .select("email, tenant_id, role, status, created_at")
      .in("tenant_id", tenantIds)
      .eq("role", "owner")
      .eq("status", "active")
      .order("created_at", { ascending: true });
    if (invErr) {
      console.error("[cron/inventory-aging] invitation query error", invErr);
      return Response.json({ error: invErr.message }, { status: 500 });
    }

    // Pick the first (earliest) active owner invitation per tenant.
    const ownerByTenant = new Map<string, string>();
    for (const inv of invitationRows ?? []) {
      const row = inv as { email: string; tenant_id: string };
      if (!ownerByTenant.has(row.tenant_id)) {
        ownerByTenant.set(row.tenant_id, row.email);
      }
    }

    const summaries: TenantSummary[] = (tenantRows ?? [])
      .map((t) => {
        const row = t as { id: string; slug: string; display_name: string };
        const ownerEmail = ownerByTenant.get(row.id);
        if (!ownerEmail) return null;
        return {
          id: row.id,
          slug: row.slug,
          displayName: row.display_name,
          ownerEmail,
        };
      })
      .filter((x): x is TenantSummary => x !== null);

    // 4) Send. Resend is required at runtime; missing key → fail soft (log
    // and 200) so we don't trigger Vercel cron-failure alerts on a
    // fresh / un-keyed environment.
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        "[cron/inventory-aging] RESEND_API_KEY missing — skipping send",
      );
      return Response.json({
        ok: true,
        tenantsNotified: 0,
        totalUnits: units.length,
        skipped: "no_resend_key",
      });
    }
    const resend = new Resend(apiKey);

    let notified = 0;
    for (const tenant of summaries) {
      const tenantUnits = byTenant.get(tenant.id) ?? [];
      if (tenantUnits.length === 0) continue;
      // Already ordered oldest-first by query; take the first TOP_N.
      const topUnits = tenantUnits.slice(0, TOP_N);
      const { subject, html, text } = buildEmail(
        tenant.displayName,
        tenantUnits.length,
        topUnits,
      );
      try {
        await resend.emails.send({
          from: FROM_ADDRESS,
          to: tenant.ownerEmail,
          subject,
          html,
          text,
        });
        notified += 1;
      } catch (err) {
        console.error(
          `[cron/inventory-aging] send failed for tenant ${tenant.slug}`,
          err,
        );
      }
    }

    return Response.json({
      ok: true,
      tenantsNotified: notified,
      totalUnits: units.length,
    });
  } catch (err) {
    console.error("[cron/inventory-aging] unhandled error", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
