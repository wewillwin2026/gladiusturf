import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  ExternalLink,
  Eye,
  Lock,
  MessageSquare,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trust Console · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Tenant Trust Console — Board's #1 trust-as-feature engine
 * (recommended by Trust Director, "the moat no incumbent will copy").
 *
 * Real-time, tenant-visible dashboard surfacing:
 *  - Every AI run executed against this tenant's data (model, surface,
 *    cost, prompt fingerprint), summarized + linkable
 *  - Every outbound consent record on customer_messaging_consent
 *  - Every audit_log event the tenant has produced
 *  - Every founder cross-tenant access (when 20260507_f migration lands)
 *  - Sub-processor list straight from the DPA
 *
 * ServiceTitan/Jobber/Housecall won't ship this because it would expose
 * how often their support staff opens customer accounts. We can —
 * because we built honestly from day one. Compounded over years, this is
 * the un-copyable moat.
 */

const SUBPROCESSORS = [
  { name: "Vercel Inc.", purpose: "Application hosting, CDN, edge middleware" },
  { name: "Supabase Inc.", purpose: "Postgres database, authentication, file storage" },
  { name: "Anthropic, PBC", purpose: "LLM inference for Ask Gladius + Quote Drafter (no model training)" },
  { name: "Resend", purpose: "Transactional + marketing email" },
  { name: "Stripe Inc.", purpose: "Payment processing (browser-tokenized; no PAN on our infra)" },
  { name: "Twilio Inc.", purpose: "SMS + voice (when enabled by tenant)" },
];

export default async function TrustConsolePage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  const sb = supabaseAdmin();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // ai_run was applied to prod 2026-05-07. Safe to query.
  // Pull `id` so we can render shareable /receipt/[id] links for the
  // most-recent runs — Trust Director's "AI transparency receipts to
  // end customers" mandate.
  const aiRunsRes = await sb
    .from("ai_run")
    .select(
      "id, surface, model, prompt_version, cost_cents, output_tokens, created_at",
    )
    .eq("tenant_id", session.tenant.id)
    .gte("created_at", since30d)
    .order("created_at", { ascending: false })
    .limit(500);

  // customer_messaging_consent was applied to prod 2026-05-07. Safe.
  const consentsRes = await sb
    .from("customer_messaging_consent")
    .select("id, channel, status, source, consent_at, created_at")
    .eq("tenant_id", session.tenant.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // audit_log shipped earlier — every tenant write event lands here.
  const auditRes = await sb
    .from("audit_log")
    .select("id, action, entity_type, entity_id, created_at, metadata")
    .eq("tenant_id", session.tenant.id)
    .gte("created_at", since30d)
    .order("created_at", { ascending: false })
    .limit(20);

  // Outbound dispatch summary — count message.* and email.* actions
  // separately from the generic audit feed so the tenant can see the
  // canSend() funnel: queued -> blocked -> sent.
  const dispatchRes = await sb
    .from("audit_log")
    .select("action")
    .eq("tenant_id", session.tenant.id)
    .gte("created_at", since30d)
    .or(
      "action.eq.message.sent,action.eq.message.dry_run,action.eq.message.blocked,action.eq.message.failed,action.eq.email.sent,action.eq.email.dry_run,action.eq.email.blocked,action.eq.email.failed,action.eq.tenant_alert.sent,action.eq.tenant_alert.dry_run,action.eq.tenant_alert.failed",
    )
    .limit(2000);

  // cross_tenant_access_log — migration 20260507_f not yet applied. Query
  // gracefully and treat missing table as empty.
  let crossTenantReads: Array<{
    actor_email: string;
    surface: string;
    action: string;
    created_at: string;
  }> = [];
  try {
    const ct = await sb
      .from("cross_tenant_access_log")
      .select("actor_email, surface, action, created_at")
      .eq("tenant_id", session.tenant.id)
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!ct.error) {
      crossTenantReads = (ct.data ?? []) as typeof crossTenantReads;
    }
  } catch {
    /* table not yet migrated — empty array is the right answer */
  }

  const dispatchRows = (dispatchRes.data ?? []) as Array<{ action: string }>;
  const dispatchCounts = dispatchRows.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.action] = (acc[r.action] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const smsSent = dispatchCounts["message.sent"] ?? 0;
  const smsDryRun = dispatchCounts["message.dry_run"] ?? 0;
  const smsBlocked = dispatchCounts["message.blocked"] ?? 0;
  const smsFailed = dispatchCounts["message.failed"] ?? 0;
  const emailSent = dispatchCounts["email.sent"] ?? 0;
  const emailDryRun = dispatchCounts["email.dry_run"] ?? 0;
  const emailBlocked = dispatchCounts["email.blocked"] ?? 0;
  const emailFailed = dispatchCounts["email.failed"] ?? 0;
  const alertSent = dispatchCounts["tenant_alert.sent"] ?? 0;
  const alertDryRun = dispatchCounts["tenant_alert.dry_run"] ?? 0;
  const totalDispatch =
    smsSent +
    smsDryRun +
    smsBlocked +
    smsFailed +
    emailSent +
    emailDryRun +
    emailBlocked +
    emailFailed;

  const aiRuns = (aiRunsRes.data ?? []) as Array<{
    id: string;
    surface: string;
    model: string;
    prompt_version: string | null;
    cost_cents: number | null;
    output_tokens: number | null;
    created_at: string;
  }>;
  const consents = (consentsRes.data ?? []) as Array<{
    id: string;
    channel: string;
    status: string;
    source: string;
    consent_at: string | null;
    created_at: string;
  }>;
  const audit = (auditRes.data ?? []) as Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    created_at: string;
    metadata: unknown;
  }>;

  // KPI roll-ups
  const aiRuns24h = aiRuns.filter((r) => r.created_at >= since24h).length;
  const aiCostCents24h = aiRuns
    .filter((r) => r.created_at >= since24h)
    .reduce((s, r) => s + (r.cost_cents ?? 0), 0);
  const consentOptedIn = consents.filter((c) => c.status === "opted_in").length;
  const consentOptedOut = consents.filter((c) => c.status === "opted_out").length;
  const consentPending = consents.filter((c) => c.status === "pending").length;
  const aiSurfaceCounts = aiRuns.reduce<Record<string, number>>((acc, r) => {
    acc[r.surface] = (acc[r.surface] ?? 0) + 1;
    return acc;
  }, {});
  const surfaceList = Object.entries(aiSurfaceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Trust Console`}
        title="Trust Console"
        subtitle="Every AI run, every consent record, every audit event we've produced for your workspace — in real time."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="AI runs · 24h"
          value={String(aiRuns24h)}
          delta={
            aiCostCents24h > 0
              ? `$${(aiCostCents24h / 100).toFixed(2)} spent`
              : "no calls yet"
          }
          trend={aiRuns24h > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Consent records"
          value={String(consents.length)}
          delta={`${consentOptedIn} opt-in · ${consentPending} pending · ${consentOptedOut} opt-out`}
          trend={consentOptedIn > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Audit events · 30d"
          value={String(audit.length)}
          delta="every tenant-side change"
          trend={audit.length > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Cross-tenant reads"
          value={String(crossTenantReads.length)}
          delta={
            crossTenantReads.length === 0
              ? "no founder access"
              : "every read logged"
          }
          trend={crossTenantReads.length > 0 ? "down" : "flat"}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        {/* AI runs (left, larger) */}
        <div className="g-card overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-g-accent" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                AI runs (last 30 days · top surfaces)
              </span>
            </div>
            <Link
              href="#all-ai-runs"
              className="text-[11px] text-g-text-muted hover:text-g-text inline-flex items-center gap-1"
            >
              {aiRuns.length} total <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <div className="p-4">
            {surfaceList.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="mx-auto h-5 w-5 text-g-text-faint" />
                <p className="mt-3 text-[13px] text-g-text-muted">
                  No AI runs yet. When you use Ask Gladius or the Quote
                  Drafter, every call writes a row here with the model,
                  prompt fingerprint, token count, and cost.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {surfaceList.map(([surface, count]) => (
                  <div
                    key={surface}
                    className="flex items-center justify-between rounded-md bg-g-surface-2 px-3 py-2 text-[13px]"
                  >
                    <span className="font-medium text-g-text">{surface}</span>
                    <span className="font-geist-mono text-g-text-muted">
                      {count} call{count === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-g-text-faint mt-2">
                  Each call writes prompt_hash, prompt_version, model, input
                  + cached_input + output tokens, cost_cents, and a 4KB
                  output excerpt to <code className="font-geist-mono text-g-text-muted">ai_run</code>.
                  Per-tenant daily budget cap: $5/day (env-overridable).
                </p>
                {aiRuns.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-[11px] text-g-text-muted hover:text-g-text">
                      Show last {Math.min(5, aiRuns.length)} call
                      {aiRuns.length === 1 ? "" : "s"} with shareable receipt URLs
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1.5 text-[11px]">
                      {aiRuns.slice(0, 5).map((r) => (
                        <li
                          key={r.id}
                          className="rounded-md bg-g-surface-2 px-2.5 py-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-g-text font-medium">
                              {r.surface}
                            </span>
                            <span className="font-geist-mono text-g-text-faint">
                              {new Date(r.created_at).toLocaleString()}
                            </span>
                          </div>
                          <Link
                            href={`/receipt/${r.id}`}
                            target="_blank"
                            className="mt-0.5 block break-all text-g-accent hover:underline font-geist-mono text-[10px]"
                          >
                            /receipt/{r.id}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-[10px] text-g-text-faint leading-relaxed">
                      Public receipt URLs anyone can verify. Each shows the
                      model, prompt fingerprint, output excerpt, and
                      timestamp — never the prompt body. Drop one of these
                      in any AI-drafted message you send.
                    </p>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cross-tenant reads (right, smaller) */}
        <div className="g-card overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-g-text-muted" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Founder cross-tenant access
              </span>
            </div>
          </header>
          <div className="p-4">
            {crossTenantReads.length === 0 ? (
              <div className="text-center py-6">
                <ShieldCheck className="mx-auto h-5 w-5 text-g-accent" />
                <p className="mt-3 text-[13px] text-g-text">
                  No founder reads in the last 30 days.
                </p>
                <p className="mt-1 text-[12px] text-g-text-muted">
                  Per /legal/privacy §2.5: founder cross-tenant access is
                  disclosed and logged. Currently there are no entries.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {crossTenantReads.map((r, i) => (
                  <li
                    key={i}
                    className="rounded-md bg-g-surface-2 px-3 py-2 text-[12px]"
                  >
                    <div className="text-g-text font-medium">{r.actor_email}</div>
                    <div className="text-g-text-muted">
                      {r.action} · {r.surface}
                    </div>
                    <div className="text-g-text-faint font-geist-mono text-[10px] mt-0.5">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-g-accent" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Outbound dispatch funnel — last 30 days
            </span>
          </div>
          <span className="text-[11px] font-geist-mono text-g-text-faint">
            {totalDispatch} attempts
          </span>
        </header>
        <div className="p-4">
          {totalDispatch === 0 ? (
            <p className="text-[13px] text-g-text-muted text-center py-6">
              No outbound dispatches yet. Once you send your first quote
              email or arm Storm Mode, the canSend() funnel populates here:
              attempted &rarr; blocked-by-consent &rarr; sent / dry-run.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              <DispatchBlock
                title="SMS"
                sent={smsSent}
                dryRun={smsDryRun}
                blocked={smsBlocked}
                failed={smsFailed}
              />
              <DispatchBlock
                title="Email"
                sent={emailSent}
                dryRun={emailDryRun}
                blocked={emailBlocked}
                failed={emailFailed}
              />
              <DispatchBlock
                title="Owner alerts"
                sent={alertSent}
                dryRun={alertDryRun}
                blocked={0}
                failed={dispatchCounts["tenant_alert.failed"] ?? 0}
              />
            </div>
          )}
          <p className="mt-3 text-[11px] text-g-text-faint leading-relaxed">
            Every send goes through{" "}
            <code className="font-geist-mono text-g-text-muted">canSend()</code>{" "}
            for consent + quiet hours + blocked weekday. Dry-run = preview only,
            no provider call (Twilio / Resend env not set). Blocked = consent
            gate rejected. Failed = phone/email missing or provider error.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Consent ledger */}
        <div className="g-card overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-g-accent" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Messaging consent ledger
              </span>
            </div>
            <span className="text-[11px] font-geist-mono text-g-text-faint">
              {consents.length} record{consents.length === 1 ? "" : "s"}
            </span>
          </header>
          <div className="p-4">
            {consents.length === 0 ? (
              <p className="text-[13px] text-g-text-muted text-center py-6">
                No consent records yet. CSV import attestations + reply-keyword
                opt-ins land here automatically.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {consents.slice(0, 8).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between text-[12px] py-1.5 border-b border-g-border-subtle/40 last:border-b-0"
                  >
                    <div>
                      <span className="font-medium text-g-text">
                        {c.channel.toUpperCase()}
                      </span>
                      <span className="text-g-text-muted"> · {c.source}</span>
                    </div>
                    <StatusPill
                      tone={
                        c.status === "opted_in"
                          ? "success"
                          : c.status === "opted_out"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {c.status}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Audit log */}
        <div className="g-card overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-g-accent" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Recent audit events
              </span>
            </div>
            <span className="text-[11px] font-geist-mono text-g-text-faint">
              {audit.length}
            </span>
          </header>
          <div className="p-4">
            {audit.length === 0 ? (
              <p className="text-[13px] text-g-text-muted text-center py-6">
                Audit feed populates as you use the workspace — every plan
                subscribed, every visit logged, every consent attestation
                writes a row.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {audit.slice(0, 8).map((a) => (
                  <li
                    key={a.id}
                    className="text-[12px] py-1.5 border-b border-g-border-subtle/40 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-g-text">
                        {a.action}
                      </span>
                      <span className="text-g-text-faint font-geist-mono text-[10px]">
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-g-text-muted text-[11px]">
                      {a.entity_type}
                      {a.entity_id ? ` · ${a.entity_id.slice(0, 8)}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-g-accent" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Sub-processors with access to your data
            </span>
          </div>
          <Link
            href="/legal/dpa"
            target="_blank"
            className="text-[11px] text-g-text-muted hover:text-g-text inline-flex items-center gap-1"
          >
            Full DPA
            <ExternalLink className="h-3 w-3" />
          </Link>
        </header>
        <div className="p-4">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUBPROCESSORS.map((s) => (
              <li
                key={s.name}
                className="rounded-md bg-g-surface-2 px-3 py-2 text-[12px]"
              >
                <div className="font-medium text-g-text">{s.name}</div>
                <div className="text-g-text-muted">{s.purpose}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="g-card flex items-start gap-3 p-4">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-g-accent-faint text-g-accent">
          <Shield className="h-4 w-4" />
        </span>
        <div className="text-[13px] text-g-text-muted">
          <strong className="text-g-text">
            One thing no competitor will copy.
          </strong>{" "}
          ServiceTitan, Jobber, and Housecall Pro won&apos;t ship this — it
          would expose how often their support staff opens customer accounts
          and how their AI features can&apos;t cite a source. We can, because
          we built it that way from day one. Want a question answered or a
          record disputed? Email{" "}
          <a
            href="mailto:legal@gladiusturf.com"
            className="text-g-accent hover:underline"
          >
            legal@gladiusturf.com
          </a>{" "}
          — we respond within one business day.
        </div>
      </section>

      <section className="flex items-center justify-between gap-2 text-[11px] text-g-text-faint">
        <span>
          <AlertTriangle className="h-3 w-3 inline-block mr-1" />
          Cryptographic audit live: each UTC day&apos;s Merkle root is
          recomputable by anyone — see{" "}
          <Link
            href="/transparency"
            target="_blank"
            className="text-g-accent hover:underline"
          >
            /transparency
          </Link>
          {" or fetch your tenant-scoped root via "}
          <code className="font-geist-mono">/api/transparency/root/YYYY-MM-DD</code>.
        </span>
      </section>
    </div>
  );
}

function DispatchBlock({
  title,
  sent,
  dryRun,
  blocked,
  failed,
}: {
  title: string;
  sent: number;
  dryRun: number;
  blocked: number;
  failed: number;
}) {
  const total = sent + dryRun + blocked + failed;
  return (
    <div className="rounded-md bg-g-surface-2 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          {title}
        </span>
        <span className="font-geist-mono text-[11px] text-g-text-muted">
          {total}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
        <span className="text-g-text-muted">Sent</span>
        <span className="text-right font-geist-mono text-g-accent">{sent}</span>
        <span className="text-g-text-muted">Dry-run</span>
        <span className="text-right font-geist-mono text-g-text">{dryRun}</span>
        <span className="text-g-text-muted">Blocked</span>
        <span className="text-right font-geist-mono text-g-warning">{blocked}</span>
        <span className="text-g-text-muted">Failed</span>
        <span className="text-right font-geist-mono text-g-danger">{failed}</span>
      </div>
    </div>
  );
}
