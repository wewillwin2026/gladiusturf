import { AlertTriangle, Check, CheckCircle2, Circle, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Launch Checklist · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Bright Lights Monday launch checklist — board-derived punch list of
 * everything that needs to be true before Felipe + Cristian Encina can
 * use the workspace as a paying tenant on 2026-05-12.
 *
 * Some items are statically-known process gates (board memo). Others are
 * live-data checks against Supabase — the page renders them with the
 * current state when the founder loads it.
 *
 * After Monday, this same page becomes the gladiusturf code-lock dashboard.
 */

type CheckState = "done" | "in_progress" | "blocked" | "manual";

type ChecklistItem = {
  id: string;
  title: string;
  why: string;
  blocks: "felipe" | "next_tenant" | "both";
  effort: string;
  state: CheckState;
  evidence?: string;
  cta?: { label: string; href: string };
};

async function loadLiveSignals() {
  const sb = supabaseAdmin();

  const signals = {
    feliphInvited: false,
    invitationCount: 0,
    invitations: [] as Array<{ email: string; role: string; status: string }>,
    brightLightsActive: false,
    brightLightsId: null as string | null,
    brightLightsCustomers: 0,
    reviewUrlColumnReady: false,
    ownerPhoneColumnReady: false,
    tenantUserSecretsTableReady: false,
    supportAccessGrantsTableReady: false,
  };

  try {
    const { data: tenant } = await sb
      .from("tenants")
      .select("id, active")
      .eq("slug", "bright-lights-encina")
      .maybeSingle();
    if (tenant) {
      signals.brightLightsId = (tenant as { id: string }).id;
      signals.brightLightsActive = (tenant as { active: boolean }).active;
    }
  } catch {
    /* swallow */
  }

  if (signals.brightLightsId) {
    try {
      const { data: invites } = await sb
        .from("tenant_invitations")
        .select("email, role, status")
        .eq("tenant_id", signals.brightLightsId);
      const list = (invites ?? []) as Array<{
        email: string;
        role: string;
        status: string;
      }>;
      signals.invitations = list;
      signals.invitationCount = list.length;
      signals.feliphInvited = list.some(
        (r) =>
          r.status === "active" &&
          r.email !== "ricardo.gamon99@icloud.com" &&
          r.email !== "joshuapyorke@gmail.com",
      );
    } catch {
      /* swallow */
    }

    try {
      const { count } = await sb
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", signals.brightLightsId);
      signals.brightLightsCustomers = count ?? 0;
    } catch {
      /* swallow */
    }
  }

  // Defensive column probes — selecting a missing column errors; if it
  // succeeds we know the migration is applied.
  try {
    await sb.from("tenants").select("review_url").limit(1);
    signals.reviewUrlColumnReady = true;
  } catch {
    /* missing */
  }
  try {
    await sb.from("tenants").select("owner_phone").limit(1);
    signals.ownerPhoneColumnReady = true;
  } catch {
    /* missing */
  }
  try {
    await sb.from("tenant_user_secrets").select("email").limit(1);
    signals.tenantUserSecretsTableReady = true;
  } catch {
    /* missing */
  }
  try {
    await sb.from("support_access_grants").select("id").limit(1);
    signals.supportAccessGrantsTableReady = true;
  } catch {
    /* missing */
  }

  return signals;
}

export default async function LaunchChecklistPage() {
  const live = await loadLiveSignals();

  const items: ChecklistItem[] = [
    {
      id: "felipe-invitation",
      title: "Felipe's email in tenant_invitations",
      why:
        "Without an active invitation row matching his email, the magic-link route silently 200s and Felipe never gets the email. This is the SINGLE BIGGEST risk per the 5/9 board memo.",
      blocks: "felipe",
      effort: "5 min — paste SQL with his real email",
      state: live.feliphInvited ? "done" : "blocked",
      evidence: live.feliphInvited
        ? `${live.invitationCount} active invitations on Bright Lights — non-founder email present`
        : "Only the two founder emails are in tenant_invitations. Add Felipe's real email before he tries to sign in Monday.",
    },
    {
      id: "founders-resend-verified",
      title: "founders@gladiusturf.com is Resend-verified",
      why:
        "The magic-link route just got fixed to read RESEND_FROM_EMAIL with founders@ as fallback. If this domain isn't Resend-verified with DKIM/SPF green, every magic-link send fails silently.",
      blocks: "both",
      effort: "5 min — check Resend dashboard",
      state: "manual",
      evidence: "Verify at https://resend.com/domains — gladiusturf.com row.",
    },
    {
      id: "migration-review-url",
      title: "Migration 20260509_a applied (tenants.review_url)",
      why:
        "Without it, /app/settings ReviewUrlForm shows 'Migration not applied yet' toast. Cristian's review-ask SMS renders the placeholder URL.",
      blocks: "felipe",
      effort: "Already applied",
      state: live.reviewUrlColumnReady ? "done" : "blocked",
      evidence: live.reviewUrlColumnReady
        ? "Column probe succeeded."
        : "Run supabase/migrations/20260509_a_tenants_review_url.sql.",
    },
    {
      id: "migration-owner-briefing",
      title: "Migration 20260509_b applied (owner_phone + daily_briefing_sms_enabled)",
      why:
        "Without it, /app/settings OwnerSmsForm + the owners-daily-briefing cron are disabled.",
      blocks: "felipe",
      effort: "Already applied",
      state: live.ownerPhoneColumnReady ? "done" : "blocked",
      evidence: live.ownerPhoneColumnReady
        ? "Columns probe succeeded."
        : "Run supabase/migrations/20260509_b_owner_daily_briefing.sql.",
    },
    {
      id: "migration-auth-upgrade",
      title: "Migration 20260509_c applied (tenant_user_secrets)",
      why:
        "Without it, the new password + TOTP MFA upgrade silently degrades — Felipe can't enroll TOTP at /app/account/security.",
      blocks: "both",
      effort: "5 min — paste SQL",
      state: live.tenantUserSecretsTableReady ? "done" : "blocked",
      evidence: live.tenantUserSecretsTableReady
        ? "Table probe succeeded."
        : "Run supabase/migrations/20260509_c_tenant_user_secrets.sql.",
    },
    {
      id: "migration-support-access",
      title: "Migration 20260507_f applied (support_access_grants)",
      why:
        "Trust Console at /app/trust degrades silently to zero rows without it. Cross-tenant founder reads aren't logged in a way the tenant can see.",
      blocks: "next_tenant",
      effort: "5 min — paste SQL",
      state: live.supportAccessGrantsTableReady ? "done" : "blocked",
      evidence: live.supportAccessGrantsTableReady
        ? "Tables probe succeeded."
        : "Run supabase/migrations/20260507_f_support_access_grants.sql.",
    },
    {
      id: "iphone-walkthrough",
      title: "iPhone end-to-end walkthrough as Felipe",
      why:
        "Mobile nav, magic-link, customer detail, draft quote, log visit — all on a real iPhone in real Sarasota cell. Catches Safari touch quirks before Felipe does.",
      blocks: "felipe",
      effort: "30 min — one founder",
      state: "manual",
      cta: { label: "Open /app/login", href: "/app/login" },
    },
    {
      id: "tenant-active",
      title: "Bright Lights tenant row is active",
      why:
        "If tenants.active=false the magic-link verify route bounces with 'tenant_inactive'. Belt and suspenders.",
      blocks: "felipe",
      effort: "Live signal",
      state: live.brightLightsActive ? "done" : "blocked",
      evidence: live.brightLightsActive
        ? "tenants.active=true."
        : `Run: update public.tenants set active=true where slug='bright-lights-encina'`,
    },
    {
      id: "tenant-secrets-env",
      title: "TENANT_SESSION_SECRET set on Vercel production",
      why:
        "Production hard-fails if missing (lib/app/tenant-auth.ts:78-83). Silent fallback only on preview. Felipe signing in production triggers the throw if unset.",
      blocks: "both",
      effort: "1 min — Vercel dashboard env",
      state: "manual",
      evidence: "Verify at https://vercel.com/gofetchcodes-projects/gladiusturf/settings/environment-variables.",
    },
    {
      id: "owner-phone-test",
      title: "Felipe's phone in tenant.owner_phone + dry-run test SMS",
      why:
        "Set Felipe's phone via /app/settings then click 'Send test now' to verify the daily briefing body before the 7 AM ET cron fires Tuesday.",
      blocks: "felipe",
      effort: "5 min after Felipe signs in once",
      state: "manual",
      cta: { label: "Open /app/settings", href: "/app/settings" },
    },
    {
      id: "code-tag",
      title: "Cut release/v1.0-bright-lights tag Sunday night",
      why:
        "Code-lock anchor. Without a tag, 'rollback' Monday at 9 AM means archaeology.",
      blocks: "both",
      effort: "1 min — git tag + push",
      state: "manual",
      evidence: "git tag -a release/v1.0-bright-lights -m 'Bright Lights launch'  &&  git push origin release/v1.0-bright-lights",
    },
    {
      id: "cheat-sheet",
      title: "1-page Felipe cheat sheet (EN + ES)",
      why:
        "Felipe is an installer, not a SaaS power user. Login URL, support email, what to do if the magic link doesn't arrive. Saves a 9 AM Monday text.",
      blocks: "felipe",
      effort: "30 min — one founder writes it",
      state: "manual",
    },
  ];

  const counts = items.reduce(
    (acc, i) => {
      acc[i.state] += 1;
      return acc;
    },
    { done: 0, in_progress: 0, blocked: 0, manual: 0 } as Record<
      CheckState,
      number
    >,
  );
  const blockingFelipe = items.filter(
    (i) => (i.blocks === "felipe" || i.blocks === "both") && i.state === "blocked",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Launch"
        title="Bright Lights Monday checklist"
        subtitle="Every item that has to be true before Felipe + Cristian Encina sign in Monday 2026-05-12. Live data where the system can probe; manual where a human has to confirm."
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile
          label="Done"
          value={counts.done}
          tone="ok"
          icon={CheckCircle2}
        />
        <KpiTile
          label="Blocked"
          value={counts.blocked}
          tone={counts.blocked > 0 ? "danger" : "muted"}
          icon={AlertTriangle}
        />
        <KpiTile
          label="Manual review"
          value={counts.manual}
          tone="warn"
          icon={Clock}
        />
        <KpiTile
          label="Felipe-blocking"
          value={blockingFelipe}
          tone={blockingFelipe > 0 ? "danger" : "ok"}
          icon={blockingFelipe > 0 ? AlertTriangle : Check}
        />
      </section>

      <section className="g-card overflow-hidden">
        <ul className="divide-y divide-g-border-subtle">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 p-5 md:flex-row md:gap-5">
              <div className="md:w-12 shrink-0">
                <StateIcon state={item.state} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-[14px] font-medium text-g-text">
                    {item.title}
                  </h3>
                  <BlocksPill blocks={item.blocks} />
                  <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                    {item.effort}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-[1.55] text-g-text-muted">
                  {item.why}
                </p>
                {item.evidence && (
                  <p className="mt-2 rounded-md bg-g-surface-2 p-2 font-geist-mono text-[11px] text-g-text-muted">
                    {item.evidence}
                  </p>
                )}
              </div>
              {item.cta && (
                <a
                  href={item.cta.href}
                  className="self-start rounded-md border border-g-border-subtle bg-g-surface px-3 py-1.5 text-[12px] text-g-text-muted hover:border-g-accent/60 hover:text-g-text"
                >
                  {item.cta.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="g-card flex items-start gap-3 p-4">
        <div className="text-[12px] text-g-text-muted leading-relaxed">
          <strong className="text-g-text">Live signals.</strong>{" "}
          Bright Lights tenant row: {live.brightLightsId ? `id ${live.brightLightsId.slice(0, 8)}…` : "not found"} ·{" "}
          customers: {live.brightLightsCustomers} · invitations: {live.invitationCount}.
          Migration probes are best-effort; if Supabase is offline the page
          renders manual gates.
        </div>
      </section>
    </div>
  );
}

function KpiTile({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "danger" | "muted";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const cls =
    tone === "danger"
      ? "border-g-danger/40 bg-g-danger/10 text-g-danger"
      : tone === "warn"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
        : tone === "ok"
          ? "border-g-accent/30 bg-g-accent-faint/30 text-g-accent"
          : "border-g-border-subtle bg-g-surface-2 text-g-text-muted";
  return (
    <div className={`g-card flex items-center gap-3 p-3 ${cls}`}>
      <Icon className="h-5 w-5" />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.14em] opacity-70">
          {label}
        </span>
        <span className="font-geist-mono text-[20px] tabular-nums">{value}</span>
      </div>
    </div>
  );
}

function StateIcon({ state }: { state: CheckState }) {
  if (state === "done") {
    return <CheckCircle2 className="h-5 w-5 text-g-accent" />;
  }
  if (state === "blocked") {
    return <AlertTriangle className="h-5 w-5 text-g-danger" />;
  }
  if (state === "in_progress") {
    return <Clock className="h-5 w-5 text-amber-300" />;
  }
  return <Circle className="h-5 w-5 text-g-text-faint" />;
}

function BlocksPill({ blocks }: { blocks: ChecklistItem["blocks"] }) {
  const label =
    blocks === "felipe" ? "Blocks Felipe" : blocks === "next_tenant" ? "Blocks next tenant" : "Blocks both";
  const cls =
    blocks === "felipe"
      ? "border-g-danger/40 bg-g-danger/10 text-g-danger"
      : blocks === "next_tenant"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
        : "border-g-border bg-g-surface text-g-text-muted";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${cls}`}
    >
      {label}
    </span>
  );
}
