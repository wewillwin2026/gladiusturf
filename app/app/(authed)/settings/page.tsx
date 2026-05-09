import {
  Bell,
  Building2,
  Cog,
  Languages,
  Mail,
  MessageSquare,
  Moon,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { SettingsBrowser } from "@/components/app/SettingsBrowser";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { dispatcherMode, twilioCredStatus } from "@/lib/messaging/dispatch";
import { emailDispatcherMode, resendCredStatus } from "@/lib/messaging/email";
import { ReviewUrlForm } from "./_components/ReviewUrlForm";

export const dynamic = "force-dynamic";

const VERTICAL_LABEL: Record<string, string> = {
  lighting: "Outdoor Lighting",
  irrigation: "Irrigation",
  pool: "Pool",
  landscape: "Landscape",
  "lawn-care": "Lawn Care",
  "tree-care": "Tree Care",
  snow: "Snow Removal",
  commercial: "Commercial Services",
};

const DAY_NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function Page() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return <SettingsBrowser product="demo" />;
  }

  const sb = supabaseAdmin();
  const [settingsRes, invitesRes] = await Promise.all([
    sb
      .from("tenant_messaging_settings")
      .select(
        "quiet_hours_start, quiet_hours_end, blocked_weekdays, timezone",
      )
      .eq("tenant_id", session.tenant.id)
      .maybeSingle(),
    sb
      .from("tenant_invitations")
      .select("email, role, status, created_at")
      .eq("tenant_id", session.tenant.id)
      .eq("status", "active")
      .order("created_at", { ascending: true }),
  ]);

  // tenants.review_url — defensive read: column may not be deployed yet,
  // in which case the select fails silently and the form renders empty.
  let reviewUrl: string | null = null;
  try {
    const { data: tenantRow } = await sb
      .from("tenants")
      .select("review_url")
      .eq("id", session.tenant.id)
      .maybeSingle();
    const candidate =
      (tenantRow as { review_url?: string | null } | null)?.review_url ?? null;
    reviewUrl = candidate ?? null;
  } catch {
    // column missing — form will save once migration is applied
  }

  const settings = settingsRes.data ?? {
    quiet_hours_start: 20,
    quiet_hours_end: 8,
    blocked_weekdays: "",
    timezone: "America/New_York",
  };
  const blockedDays = (settings.blocked_weekdays || "")
    .split(",")
    .map((s: string) => Number.parseInt(s.trim(), 10))
    .filter((n: number) => Number.isFinite(n));
  const invites = (invitesRes.data ?? []) as Array<{
    email: string;
    role: string;
    status: string;
    created_at: string;
  }>;

  const smsMode = dispatcherMode();
  const emailMode = emailDispatcherMode();
  const smsCreds = twilioCredStatus();
  const emailCreds = resendCredStatus();
  const quietRange = `${settings.quiet_hours_start}:00 → ${settings.quiet_hours_end}:00`;

  const smsMissing = (
    [
      ["TWILIO_ACCOUNT_SID", smsCreds.sid],
      ["TWILIO_AUTH_TOKEN", smsCreds.token],
      ["TWILIO_FROM_NUMBER", smsCreds.from],
    ] as const
  )
    .filter(([, v]) => !v)
    .map(([k]) => k);
  const smsPartial =
    smsMissing.length > 0 && smsMissing.length < 3;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Settings`}
        title="Workspace settings"
        subtitle="Identity, language, messaging guardrails, and team. Edit access ships in the next pass — for now, founders can adjust these via support."
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="g-card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-g-accent" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Workspace identity
            </span>
          </div>
          <Row label="Display name" value={session.tenant.display_name} />
          <Row
            label="Slug"
            value={
              <code className="font-geist-mono text-[12px]">
                {session.tenant.slug}
              </code>
            }
          />
          <Row
            label="Vertical"
            value={
              VERTICAL_LABEL[session.tenant.vertical] ?? session.tenant.vertical
            }
          />
          <Row
            label="Plan tier"
            value={
              <span className="inline-flex items-center rounded-full bg-g-accent-faint/40 px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-g-accent">
                {session.tenant.plan_tier}
              </span>
            }
          />
        </div>

        <div className="g-card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-g-accent" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Language
            </span>
          </div>
          <Row
            label="Primary"
            value={
              session.tenant.primary_language === "es"
                ? "Spanish"
                : "English"
            }
          />
          <Row
            label="Bilingual mode"
            value={
              session.tenant.bilingual ? "Enabled (EN + ES)" : "Single-language"
            }
          />
          <p className="mt-2 text-[12px] text-g-text-muted leading-relaxed">
            Quotes, customer-facing emails, and Storm Mode messages render in
            this customer&apos;s language when bilingual is on. Falls back to
            primary if the customer&apos;s language isn&apos;t set.
          </p>
        </div>
      </section>

      <section className="g-card p-5">
        <ReviewUrlForm initial={reviewUrl} />
      </section>

      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-g-accent" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Outbound dispatch — provider status
            </span>
          </div>
          <Link
            href="/app/trust"
            prefetch
            className="text-[11px] text-g-text-muted hover:text-g-text inline-flex items-center gap-1"
          >
            View funnel
          </Link>
        </header>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <ProviderRow
            icon={MessageSquare}
            title="SMS · Twilio"
            mode={smsMode}
            partial={smsPartial}
            note={
              smsMode === "live"
                ? "TWILIO_ACCOUNT_SID, AUTH_TOKEN, FROM_NUMBER are all set. Storm Mode + cadence-driven SMS dispatch via Twilio when consent allows."
                : smsPartial
                  ? `Partially configured — missing ${smsMissing.join(", ")}. Sends are previewed only and logged to audit_log as message.dry_run until all three are set.`
                  : "Twilio creds not set yet. Sends are previewed only and logged to audit_log as message.dry_run. Set TWILIO_ACCOUNT_SID / AUTH_TOKEN / FROM_NUMBER to flip live."
            }
          />
          <ProviderRow
            icon={Mail}
            title="Email · Resend"
            mode={emailMode}
            partial={false}
            note={
              emailMode === "live"
                ? `RESEND_API_KEY is set${emailCreds.from ? " (custom From override active)" : ""}. Quote-share + tenant alert emails dispatch via Resend.`
                : "Resend API key not set yet. Sends are previewed only. Set RESEND_API_KEY to flip live."
            }
          />
        </div>
      </section>

      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-g-accent" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Messaging guardrails
            </span>
          </div>
        </header>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <Row label="Quiet hours" value={quietRange} />
          <Row label="Timezone" value={settings.timezone} />
          <Row
            label="Blocked weekdays"
            value={
              blockedDays.length === 0
                ? "None"
                : blockedDays.map((d: number) => DAY_NAME[d]).join(", ")
            }
          />
        </div>
        <div className="px-4 pb-4 text-[11px] text-g-text-faint leading-relaxed">
          Every outbound SMS / email runs through{" "}
          <code className="font-geist-mono">canSend()</code>: the message is
          queued only if the customer is opted in for the channel, the local
          time is outside quiet hours, and the weekday isn&apos;t blocked.
        </div>
      </section>

      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-g-accent" />
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Team
            </span>
          </div>
          <span className="text-[11px] font-geist-mono text-g-text-faint">
            {invites.length} active
          </span>
        </header>
        <div className="p-4">
          {invites.length === 0 ? (
            <p className="text-[13px] text-g-text-muted text-center py-6">
              No team members invited yet. Founders add your team via support.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {invites.map((m) => (
                <li
                  key={`${m.email}-${m.role}`}
                  className="flex items-center justify-between text-[13px] py-1.5 border-b border-g-border-subtle/40 last:border-b-0"
                >
                  <span className="text-g-text font-medium">{m.email}</span>
                  <span className="inline-flex items-center rounded-full bg-g-surface-2 px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-g-text-muted">
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="g-card flex items-start gap-3 p-4">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-g-accent-faint text-g-accent">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="text-[13px] text-g-text-muted">
          <strong className="text-g-text">Settings edit UI ships next.</strong>
          {" "}For now this surface is read-only — the values are sourced from
          your <code className="font-geist-mono">tenants</code>,{" "}
          <code className="font-geist-mono">tenant_messaging_settings</code>,
          and <code className="font-geist-mono">tenant_invitations</code>{" "}
          rows. Need a change before the editor ships?{" "}
          <a
            href="mailto:founders@gladiusturf.com"
            className="text-g-accent hover:underline"
          >
            founders@gladiusturf.com
          </a>{" "}
          — same-day turnaround.
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-g-text-muted">{label}</span>
      <span className="text-[13px] text-g-text text-right">{value}</span>
    </div>
  );
}

function ProviderRow({
  icon: Icon,
  title,
  mode,
  partial,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  mode: "live" | "dry_run";
  partial: boolean;
  note: string;
}) {
  const isLive = mode === "live";
  const chipClass = isLive
    ? "inline-flex items-center gap-1 rounded-full bg-g-accent-faint/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-g-accent"
    : partial
      ? "inline-flex items-center gap-1 rounded-full bg-g-warning/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-g-warning border border-g-warning/30"
      : "inline-flex items-center gap-1 rounded-full bg-g-surface px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-g-text-muted border border-g-border-subtle";
  const label = isLive ? "Live" : partial ? "Partial · dry-run" : "Dry-run";
  return (
    <div className="rounded-md bg-g-surface-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-g-text" />
          <span className="text-[13px] font-medium text-g-text">{title}</span>
        </div>
        <span className={chipClass}>
          <Cog className="h-2.5 w-2.5" />
          {label}
        </span>
      </div>
      <p className="mt-2 text-[12px] text-g-text-muted leading-relaxed">
        {note}
      </p>
    </div>
  );
}
