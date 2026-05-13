import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CloudRain,
  Lightbulb,
  Mail,
  MapPin,
  MessageSquare,
  PenSquare,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { demoState } from "@/lib/demo/state";
import { money, relTime, shortDate } from "@/lib/shared/format";
import { cn } from "@/lib/cn";
import { CustomerHeartbeat } from "@/components/app/CustomerHeartbeat";
import { PlanPicker } from "./PlanPicker";
import { LogVisitButton } from "./LogVisitButton";
import { SendReviewAskButton } from "./SendReviewAskButton";
import { LightingAssets } from "./LightingAssets";
import { VoltageTestsPanel } from "./VoltageTestsPanel";

export const dynamic = "force-dynamic";

type DbCustomer = {
  id: string;
  display_name: string;
  primary_email: string | null;
  primary_phone: string | null;
  preferred_language: string;
  service_address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    lat?: number;
    lng?: number;
    cluster?: string;
  } | null;
  customer_tier: string | null;
  notes: string | null;
  acquired_at: string | null;
  created_at: string;
};

type DbFixture = {
  id: string;
  external_id: string | null;
  fixture_type: string;
  brand: string;
  model: string | null;
  wattage_text: string | null;
  install_date: string | null;
  warranty_status: string | null;
  warranty_end: string | null;
  notes: string | null;
};

const WARRANTY_TONE: Record<string, Tone> = {
  active: "success",
  expiring: "warning",
  expired: "danger",
  lifetime: "accent",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await readAppSession();

  // Tenant session — render real Supabase data + the lighting_fixtures
  // rollup. The demo path is preserved below.
  if (session.kind === "tenant") {
    const sb = supabaseAdmin();
    const { data: customer, error: cErr } = await sb
      .from("customers")
      .select(
        "id, display_name, primary_email, primary_phone, preferred_language, service_address, customer_tier, notes, acquired_at, created_at",
      )
      .eq("tenant_id", session.tenant.id)
      .eq("id", id)
      .maybeSingle();
    if (cErr || !customer) notFound();

    const c = customer as DbCustomer;

    // Only fetch the lighting_fixtures table for lighting tenants. Other
    // verticals will get their own asset section once the registry's
    // per-vertical AssetSection component ships — until then the lighting
    // block hides for non-lighting tenants and a placeholder appears.
    const isLighting = session.tenant.vertical === "lighting";
    // Active list — `deleted_at is null`. Archived rows feed a separate
    // expandable section in LightingAssets so customers can restore or
    // (owner-only) purge them.
    const fixturesQuery = isLighting
      ? sb
          .from("lighting_fixtures")
          .select(
            "id, external_id, fixture_type, brand, model, wattage_text, install_date, warranty_status, warranty_end, notes",
          )
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id)
          .is("deleted_at", null)
          .order("external_id", { ascending: true })
      : Promise.resolve({ data: [], error: null });
    const transformersQuery = isLighting
      ? sb
          .from("lighting_transformers")
          .select(
            "id, external_id, brand, model, watts_capacity, watts_loaded, zones, install_date, location_note",
          )
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id)
          .is("deleted_at", null)
          .order("external_id", { ascending: true })
      : Promise.resolve({ data: [], error: null });
    const claimsQuery = isLighting
      ? sb
          .from("lighting_warranty_claims")
          .select(
            "id, fixture_id, external_id, claim_date, status, manufacturer, rma_number, resolution, notes",
          )
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id)
          .order("claim_date", { ascending: false })
      : Promise.resolve({ data: [], error: null });
    const archivedFixturesQuery = isLighting
      ? sb
          .from("lighting_fixtures")
          .select(
            "id, external_id, fixture_type, brand, model, wattage_text, install_date, warranty_status, warranty_end, notes, deleted_at",
          )
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id)
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });
    const archivedTransformersQuery = isLighting
      ? sb
          .from("lighting_transformers")
          .select(
            "id, external_id, brand, model, watts_capacity, watts_loaded, zones, install_date, location_note, deleted_at",
          )
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id)
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const voltageTestsQuery = isLighting
      ? sb
          .from("lighting_voltage_tests")
          .select(
            "id, fixture_id, measured_volts, source_tap_volts, tap_label, result, notes, measured_at",
          )
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id)
          .order("measured_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null });

    const [
      fixturesRes,
      transformersRes,
      claimsRes,
      archivedFixturesRes,
      archivedTransformersRes,
      voltageTestsRes,
      plansRes,
      subRes,
      scheduleRes,
      proposalsRes,
    ] = await Promise.all([
      fixturesQuery,
      transformersQuery,
      claimsQuery,
      archivedFixturesQuery,
      archivedTransformersQuery,
      voltageTestsQuery,
        sb
          .from("plans")
          .select("id, display_name, annual_price_cents, badge, most_popular")
          .eq("tenant_id", session.tenant.id)
          .eq("active", true)
          .order("annual_price_cents", { ascending: true }),
        sb
          .from("plan_subscriptions")
          .select("plan_id")
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id)
          .eq("status", "active")
          .maybeSingle(),
        sb
          .from("schedule_items")
          .select("id, type, title, starts_at, status, notes")
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id)
          .order("starts_at", { ascending: false })
          .limit(50),
        sb
          .from("proposals")
          .select("id, status")
          .eq("tenant_id", session.tenant.id)
          .eq("customer_id", id),
      ]);

    const fixtures = (fixturesRes.data ?? []) as DbFixture[];
    type DbTransformer = {
      id: string;
      external_id: string | null;
      brand: string | null;
      model: string | null;
      watts_capacity: number | null;
      watts_loaded: number | null;
      zones: number | null;
      install_date: string | null;
      location_note: string | null;
    };
    const transformers = (transformersRes.data ?? []) as DbTransformer[];
    // Archived rows carry the same shape as their active counterparts —
    // LightingAssets's FixtureRow / TransformerRow types accept the
    // superset; the extra `deleted_at` field is dropped at the boundary
    // since the component doesn't need it.
    const archivedFixtures = ((archivedFixturesRes.data ?? []) as Array<
      DbFixture & { deleted_at: string }
    >).map(({ deleted_at, ...rest }) => {
      void deleted_at;
      return rest;
    }) as DbFixture[];
    const archivedTransformers = ((archivedTransformersRes.data ?? []) as Array<
      DbTransformer & { deleted_at: string }
    >).map(({ deleted_at, ...rest }) => {
      void deleted_at;
      return rest;
    }) as DbTransformer[];

    type VoltageTestRowRaw = {
      id: string;
      fixture_id: string | null;
      measured_volts: number | string;
      source_tap_volts: number | string | null;
      tap_label: string | null;
      result: "pass" | "low" | "high" | "open" | "short";
      notes: string | null;
      measured_at: string;
    };
    const voltageTestsRaw = (voltageTestsRes.data ?? []) as VoltageTestRowRaw[];
    const voltageTests = voltageTestsRaw.map((t) => ({
      id: t.id,
      fixture_id: t.fixture_id,
      measured_volts: typeof t.measured_volts === "string"
        ? Number(t.measured_volts)
        : t.measured_volts,
      source_tap_volts:
        t.source_tap_volts == null
          ? null
          : typeof t.source_tap_volts === "string"
            ? Number(t.source_tap_volts)
            : t.source_tap_volts,
      tap_label: t.tap_label,
      result: t.result,
      notes: t.notes,
      measured_at: t.measured_at,
    }));
    const claims = (claimsRes.data ?? []) as Array<{
      id: string;
      fixture_id: string | null;
      external_id: string | null;
      claim_date: string;
      status: string;
      manufacturer: string | null;
      rma_number: string | null;
      resolution: string | null;
      notes: string | null;
    }>;
    const planOptions = (plansRes.data ?? []) as Array<{
      id: string;
      display_name: string;
      annual_price_cents: number;
      badge: string | null;
      most_popular: boolean;
    }>;
    const currentPlanId = (subRes.data as { plan_id: string } | null)?.plan_id ?? null;
    const visits = (scheduleRes.data ?? []) as Array<{
      id: string;
      type: string;
      title: string;
      starts_at: string;
      status: string | null;
      notes: string | null;
    }>;

    const addr = c.service_address ?? {};
    const fullAddress = [addr.street, addr.city, addr.zip].filter(Boolean).join(", ");
    const cluster = addr.cluster ?? null;

    // Customer Heartbeat signals — Product Director's #4. Four binary
    // pulses computed from existing tables.
    const proposals = (proposalsRes.data ?? []) as Array<{ id: string; status: string }>;
    const ENGAGED_QUOTE_STATUSES = ["sent", "viewed", "walked", "sold", "installed"];
    const NINETY_DAYS_AGO = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const ONE_HUNDRED_EIGHTY_DAYS_AGO = Date.now() - 180 * 24 * 60 * 60 * 1000;
    const heartbeat = {
      hasActivePlan: !!subRes.data,
      hasRecentVisit: visits.some(
        (v) => new Date(v.starts_at).getTime() >= NINETY_DAYS_AGO,
      ),
      hasEngagedQuote: proposals.some((p) =>
        ENGAGED_QUOTE_STATUSES.includes(p.status),
      ),
      isLongTermCustomer:
        c.acquired_at != null &&
        new Date(c.acquired_at).getTime() <= ONE_HUNDRED_EIGHTY_DAYS_AGO,
    };

    const activeWarranty = fixtures.filter((f) => f.warranty_status === "active").length;
    const expiredWarranty = fixtures.filter((f) => f.warranty_status === "expired").length;
    const lifetimeWarranty = fixtures.filter((f) => f.warranty_status === "lifetime").length;
    const installYear = c.acquired_at
      ? new Date(c.acquired_at).getFullYear()
      : null;

    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/app/customers"
          prefetch
          className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to customers
        </Link>

        <PageHeader
          eyebrow={cluster ?? session.tenant.display_name}
          title={c.display_name}
          subtitle={
            <span className="inline-flex flex-wrap items-center gap-3 text-[12px]">
              {fullAddress && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {fullAddress}
                </span>
              )}
              {c.primary_phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {c.primary_phone}
                </span>
              )}
              {c.primary_email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {c.primary_email}
                </span>
              )}
              <StatusPill tone="accent">
                {c.preferred_language === "es" ? "ES" : "EN"}
              </StatusPill>
              {installYear && (
                <span className="text-g-text-faint">Customer since {installYear}</span>
              )}
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link href={`/app/quotes/draft?customer=${c.id}`} prefetch>
                <Button variant="secondary" size="md" type="button">
                  <PenSquare className="h-3.5 w-3.5" />
                  Draft a quote
                </Button>
              </Link>
              <LogVisitButton
                customerId={c.id}
                customerName={c.display_name}
              />
              <SendReviewAskButton
                customerId={c.id}
                customerName={c.display_name}
                preferredLanguage={c.preferred_language}
                tenantDisplayName={session.tenant.display_name}
              />
            </div>
          }
        />

        {/* KPIs — fixture-led for the lighting vertical. */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Fixtures on file"
            value={String(fixtures.length)}
            delta={fixtures.length > 0 ? "live inventory" : "no inventory yet"}
            trend={fixtures.length > 0 ? "up" : "flat"}
          />
          <KPICard
            label="Active warranty"
            value={String(activeWarranty + lifetimeWarranty)}
            delta={
              lifetimeWarranty > 0
                ? `${lifetimeWarranty} lifetime · ${activeWarranty} timed`
                : `${activeWarranty} fixtures`
            }
            trend={activeWarranty + lifetimeWarranty > 0 ? "up" : "flat"}
          />
          <KPICard
            label="Expired warranty"
            value={String(expiredWarranty)}
            delta={
              expiredWarranty > 0 ? "consider plan upsell" : "no exposure"
            }
            trend={expiredWarranty > 0 ? "down" : "flat"}
          />
          <KPICard
            label="Plan tier"
            value={c.customer_tier ?? "—"}
            delta={c.customer_tier ? "active" : "no plan yet"}
            trend={c.customer_tier ? "up" : "flat"}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Asset rollup — lighting tenants see fixtures; other verticals
              see a placeholder until the registry's per-vertical AssetSection
              ships. */}
          <div className="lg:col-span-3">
            {!isLighting ? (
              <div className="g-card p-5 text-center py-8">
                <Lightbulb className="mx-auto h-5 w-5 text-g-text-faint" />
                <p className="mt-3 text-[13px] text-g-text-muted">
                  Per-asset detail for the {session.tenant.vertical} vertical
                  ships in a follow-up.
                </p>
                <p className="mt-1 text-[12px] text-g-text-faint">
                  Customer profile + plan + schedule below all work today.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <LightingAssets
                  customerId={c.id}
                  fixtures={fixtures}
                  transformers={transformers}
                  claims={claims}
                  archivedFixtures={archivedFixtures}
                  archivedTransformers={archivedTransformers}
                />
                <VoltageTestsPanel
                  customerId={c.id}
                  fixtures={fixtures.map((f) => ({
                    id: f.id,
                    label: `${f.external_id ?? f.brand} · ${f.fixture_type}`,
                  }))}
                  transformers={transformers.map((t) => ({
                    id: t.id,
                    label: `${t.external_id ?? t.brand} · ${t.watts_capacity ?? "?"}W`,
                  }))}
                  tests={voltageTests}
                />
              </div>
            )}
          </div>

          {/* Right column — heartbeat + property + notes */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <CustomerHeartbeat signals={heartbeat} />
            <div className="g-card p-5">
              <div className="flex items-baseline justify-between">
                <h2>Property</h2>
                <Calendar className="h-3.5 w-3.5 text-g-text-faint" />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <dt className="text-g-text-faint">Cluster</dt>
                <dd className="text-right">{cluster ?? "—"}</dd>
                <dt className="text-g-text-faint">Language</dt>
                <dd className="text-right">
                  {c.preferred_language === "es" ? "Spanish" : "English"}
                </dd>
                <dt className="text-g-text-faint">Customer since</dt>
                <dd className="text-right font-geist-mono">
                  {installYear ?? "—"}
                </dd>
                <dt className="text-g-text-faint">Lat / Lng</dt>
                <dd className="text-right font-geist-mono text-[11px]">
                  {addr.lat && addr.lng
                    ? `${addr.lat.toFixed(3)}, ${addr.lng.toFixed(3)}`
                    : "—"}
                </dd>
              </dl>
            </div>

            {c.notes && (
              <div className="g-card p-5">
                <div className="flex items-baseline justify-between">
                  <h2 className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-g-accent" />
                    Notes
                  </h2>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-g-text-muted">
                  {c.notes}
                </p>
                <p className="mt-3 text-[11px] text-g-text-faint">
                  Site Memory · pulled from your install record
                </p>
              </div>
            )}

            <PlanPicker
              customerId={id}
              currentPlanId={currentPlanId}
              options={planOptions}
            />

            <div className="g-card p-5">
              <div className="flex items-baseline justify-between">
                <h2>Outreach</h2>
                <Star className="h-3.5 w-3.5 text-g-warning" />
              </div>
              <p className="mt-3 text-[12px] text-g-text-faint">
                Review request + seasonal check-in flows land here in a
                later slice. Use the header button to send a review ask now.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline — service history. Renders only when there are visits;
            an empty array means the customer has no logged service yet
            (most Bright Lights customers are in this state — only Mike
            Jackson's 5 visits are seeded today). */}
        {visits.length > 0 && (
          <section className="g-card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-g-accent" />
                Service history
              </h2>
              <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
                {visits.length} visit{visits.length === 1 ? "" : "s"} on file
              </span>
            </div>

            <ol className="mt-5 flex flex-col gap-4">
              {visits.map((v, i) => {
                const Icon =
                  v.type === "install"
                    ? Truck
                    : v.type === "warranty"
                      ? ShieldCheck
                      : v.type === "storm_response"
                        ? CloudRain
                        : Wrench;
                const date = new Date(v.starts_at);
                const dateLabel = date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                return (
                  <li
                    key={v.id}
                    className="flex gap-4"
                  >
                    {/* Rail with icon + connector line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-8 w-8 rounded-full bg-g-surface-2 border border-g-border inline-flex items-center justify-center text-g-accent">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {i < visits.length - 1 && (
                        <div
                          aria-hidden
                          className="mt-2 w-px flex-1 bg-g-border-subtle"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-[14px] font-medium text-g-text">
                          {v.title}
                        </h3>
                        <span className="font-geist-mono text-[11px] text-g-text-faint shrink-0">
                          {dateLabel}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full border border-g-border bg-g-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-g-text-muted">
                          {v.type.replace("_", " ")}
                        </span>
                        {v.status && v.status !== "completed" && (
                          <StatusPill tone="warning">
                            {v.status}
                          </StatusPill>
                        )}
                      </div>
                      {v.notes && (
                        <p className="mt-2 text-[13px] leading-[1.55] text-g-text-muted">
                          {v.notes}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    );
  }

  // Demo session — preserve the existing seeded Cypress Lawn detail page.
  const state = demoState();
  const customer = state.customers.find((c) => c.id === id);
  if (!customer) notFound();

  const customerJobs = state.jobs.filter((j) => j.customerId === id);
  const customerInvoices = state.invoices.filter((i) => i.customerId === id);
  const customerMessages = state.messages.filter((m) => m.customerId === id);
  const completedJobs = customerJobs.filter((j) => j.status === "Complete");
  const totalRevenueCents = completedJobs.reduce((s, j) => s + j.priceCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/customers"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to customers
      </Link>

      <PageHeader
        eyebrow={customer.tier}
        title={customer.name}
        subtitle={
          <span className="inline-flex items-center gap-3 text-[12px]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {customer.address}, {customer.city} {customer.zip}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {customer.email}
            </span>
            <StatusPill tone={customer.status === "Active" ? "accent" : "neutral"}>
              {customer.status}
            </StatusPill>
          </span>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="LTV"
          value={money(customer.ltvCents)}
          delta={`${customer.tier}`}
          trend="up"
        />
        <KPICard
          label="Visits · all time"
          value={String(completedJobs.length)}
          delta={`+${completedJobs.filter((j) => Date.now() - new Date(j.scheduledAt).getTime() < 30 * 86400_000).length} last 30d`}
          trend="up"
        />
        <KPICard
          label="Revenue · YTD"
          value={money(totalRevenueCents)}
          delta="+$420 vs Q1"
          trend="up"
        />
        <KPICard
          label="NPS"
          value={customer.npsScore != null ? String(customer.npsScore) : "—"}
          delta={customer.npsScore != null && customer.npsScore >= 8 ? "Promoter" : "—"}
          trend={customer.npsScore && customer.npsScore >= 8 ? "up" : "flat"}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 g-card p-5">
          <div className="flex items-baseline justify-between">
            <h2>Timeline</h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
              Last 24 events
            </span>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {[...customerJobs, ...customerInvoices, ...customerMessages]
              .sort((a, b) => {
                const at = "scheduledAt" in a ? a.scheduledAt : "issuedAt" in a ? a.issuedAt : (a as { ts: string }).ts;
                const bt = "scheduledAt" in b ? b.scheduledAt : "issuedAt" in b ? b.issuedAt : (b as { ts: string }).ts;
                return bt.localeCompare(at);
              })
              .slice(0, 24)
              .map((e, i) => {
                const ts =
                  "scheduledAt" in e
                    ? e.scheduledAt
                    : "issuedAt" in e
                      ? e.issuedAt
                      : (e as { ts: string }).ts;
                let label = "Event";
                let detail = "";
                if ("scheduledAt" in e) {
                  label = `${e.service} · ${e.status}`;
                  detail = `${money(e.priceCents)} · crew ${e.crewId}`;
                } else if ("issuedAt" in e) {
                  label = `Invoice ${e.id} · ${e.status}`;
                  detail = `${money(e.amountCents)} · due ${shortDate(e.dueAt)}`;
                } else {
                  const m = e as { channel: string; direction: string; body: string };
                  label = `${m.channel.toUpperCase()} ${m.direction === "in" ? "from" : "to"} ${customer.name.split(" ")[0]}`;
                  detail = m.body;
                }
                return (
                  <li key={`${e.id}_${i}`} className="flex gap-3 text-[13px]">
                    <div className="h-7 w-7 shrink-0 rounded-md bg-g-surface-2 border border-g-border-subtle inline-flex items-center justify-center text-g-text-muted">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-g-text">{label}</p>
                      <p className="text-g-text-muted text-[12px] truncate">{detail}</p>
                    </div>
                    <span className="text-[11px] text-g-text-faint font-geist-mono shrink-0">
                      {relTime(ts)}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="g-card p-5">
            <div className="flex items-baseline justify-between">
              <h2>Property</h2>
              <Calendar className="h-3.5 w-3.5 text-g-text-faint" />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <dt className="text-g-text-faint">Lot size</dt>
              <dd className="text-right font-geist-mono">8,420 sqft</dd>
              <dt className="text-g-text-faint">Beds</dt>
              <dd className="text-right font-geist-mono">1,240 sqft</dd>
              <dt className="text-g-text-faint">Driveway</dt>
              <dd className="text-right font-geist-mono">580 sqft</dd>
              <dt className="text-g-text-faint">Trees</dt>
              <dd className="text-right font-geist-mono">7</dd>
              <dt className="text-g-text-faint">Route</dt>
              <dd className="text-right">{customer.routeId}</dd>
              <dt className="text-g-text-faint">Joined</dt>
              <dd className="text-right">{shortDate(customer.joinedAt)}</dd>
            </dl>
          </div>

          <div className="g-card p-5">
            <div className="flex items-baseline justify-between">
              <h2>Reviews</h2>
              <Star className="h-3.5 w-3.5 text-g-warning" />
            </div>
            {customer.npsScore != null ? (
              <p className="mt-3 text-[13px] text-g-text-muted leading-relaxed">
                &ldquo;{customer.npsScore >= 9 ? "Crew was on time and the yard looks unreal. Best service we've used in three years." : customer.npsScore >= 7 ? "Solid work, solid communication. Recommend." : "Decent. Sometimes misses the back fence line."}&rdquo;
                <br />
                <span className="text-g-text-faint text-[11px]">
                  NPS {customer.npsScore} · Google · {shortDate(customer.lastVisit)}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-[12px] text-g-text-faint">
                No reviews yet. Auto-ask fires after next NPS &ge; 8 visit.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
