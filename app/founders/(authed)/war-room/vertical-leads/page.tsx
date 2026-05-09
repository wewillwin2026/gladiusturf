import Link from "next/link";
import { Database, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { supabaseAdmin } from "@/lib/supabase";
import { relTime } from "@/lib/shared/format";
import { cn } from "@/lib/cn";
import { VERTICALS, type VerticalSlug } from "@/lib/vertical/types";
import { SearchBar } from "./_components/SearchBar";
import { StatusBadge } from "./_components/StatusBadge";
import { ExportButton } from "./_components/ExportButton";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { slug: "all", label: "All statuses" },
  { slug: "new", label: "New" },
  { slug: "contacted", label: "Contacted" },
  { slug: "converted", label: "Converted" },
  { slug: "disqualified", label: "DQ" },
] as const;

type VerticalLead = {
  id: string;
  vertical: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  service_area: string | null;
  years_in_business: string | null;
  crews: string | null;
  pain_point: string | null;
  status: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  source_page: string | null;
  created_at: string;
};

type SearchParams = { vertical?: string; status?: string; q?: string };

export default async function VerticalLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filter = params?.vertical ?? "all";
  const validFilter =
    filter === "all" || VERTICALS.some((v) => v.slug === filter)
      ? filter
      : "all";
  const statusFilter = params?.status ?? "all";
  const validStatus =
    STATUS_FILTERS.some((s) => s.slug === statusFilter) ? statusFilter : "all";
  const q = (params?.q ?? "").trim();

  let leads: VerticalLead[] = [];
  let error: string | null = null;
  try {
    const sb = supabaseAdmin();
    let query = sb
      .from("vertical_leads")
      .select(
        "id, vertical, name, email, phone, company, service_area, years_in_business, crews, pain_point, status, utm_source, utm_campaign, source_page, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(150);
    if (validFilter !== "all") {
      query = query.eq("vertical", validFilter);
    }
    if (validStatus !== "all") {
      query = query.eq("status", validStatus);
    }
    if (q) {
      const safe = q.replace(/[\\,()]/g, "");
      query = query.or(
        `email.ilike.%${safe}%,company.ilike.%${safe}%,name.ilike.%${safe}%`,
      );
    }
    const { data, error: e } = await query;
    if (e) throw e;
    leads = (data ?? []) as VerticalLead[];
  } catch (err) {
    error = err instanceof Error ? err.message : "supabase_offline";
  }

  // Group counts for filter pills (this-week)
  const countsByVertical = new Map<VerticalSlug | "all", number>();
  try {
    const sb = supabaseAdmin();
    const since = new Date(Date.now() - 7 * 86400_000).toISOString();
    const { data } = await sb
      .from("vertical_leads")
      .select("vertical")
      .gte("created_at", since);
    countsByVertical.set("all", (data ?? []).length);
    for (const v of VERTICALS) {
      countsByVertical.set(
        v.slug,
        (data ?? []).filter((r) => (r as { vertical: string }).vertical === v.slug).length,
      );
    }
  } catch {
    /* counts are best-effort */
  }

  const total = leads.length;
  const week = leads.filter(
    (l) => Date.now() - new Date(l.created_at).getTime() < 7 * 86400_000,
  ).length;
  const today = leads.filter((l) => isToday(l.created_at)).length;
  const withPain = leads.filter((l) => (l.pain_point ?? "").trim() !== "").length;

  const columns: Column<VerticalLead>[] = [
    {
      key: "vertical",
      header: "Vertical",
      cell: (r) => (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-g-border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-g-text-muted">
          {r.vertical}
        </span>
      ),
    },
    {
      key: "company",
      header: "Company",
      cell: (r) => r.company ?? "—",
    },
    {
      key: "name",
      header: "Contact",
      cell: (r) => (
        <span>
          <span className="text-g-text">{r.name ?? "—"}</span>
          <span className="text-g-text-faint"> · {r.email ?? "—"}</span>
        </span>
      ),
      className: "text-g-text-muted",
    },
    {
      key: "area",
      header: "Service area",
      cell: (r) => r.service_area ?? "—",
      className: "text-g-text-muted",
    },
    {
      key: "crews",
      header: "Crews",
      cell: (r) => r.crews ?? "—",
      align: "center",
    },
    {
      key: "years",
      header: "Years",
      cell: (r) => r.years_in_business ?? "—",
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge id={r.id} initial={r.status ?? "new"} />,
      align: "center",
    },
    {
      key: "ts",
      header: "Submitted",
      cell: (r) => relTime(r.created_at),
      mono: true,
      align: "right",
    },
  ];

  // Build href helpers that preserve other query params when changing one.
  function pillHref(updates: Record<string, string | null>): string {
    const next = new URLSearchParams();
    if (validFilter !== "all") next.set("vertical", validFilter);
    if (validStatus !== "all") next.set("status", validStatus);
    if (q) next.set("q", q);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    return `/founders/war-room/vertical-leads${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Verticals"
        title="Vertical Leads"
        subtitle="All inbound waitlist + lighting submissions, grouped by vertical. Reply within 24h with three slots and (for lighting) the workspace passcode."
      />

      {/* Search + export bar */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1 md:max-w-md">
          <SearchBar />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
        </div>
      </section>

      {/* Per-vertical filter pills */}
      <section className="flex flex-wrap gap-2">
        <FilterPill
          href={pillHref({ vertical: null })}
          label="All"
          count={countsByVertical.get("all") ?? 0}
          active={validFilter === "all"}
        />
        {VERTICALS.map((v) => (
          <FilterPill
            key={v.slug}
            href={pillHref({ vertical: v.slug })}
            label={v.name}
            count={countsByVertical.get(v.slug) ?? 0}
            active={validFilter === v.slug}
            live={v.status === "live"}
          />
        ))}
      </section>

      {/* Status filter pills */}
      <section className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s.slug}
            href={pillHref({ status: s.slug === "all" ? null : s.slug })}
            prefetch
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition-colors",
              validStatus === s.slug
                ? "border-g-accent/60 bg-g-accent-faint text-g-accent"
                : "border-g-border bg-g-surface text-g-text-muted hover:text-g-text",
            )}
          >
            {s.label}
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label={validFilter === "all" ? "Total leads" : `${validFilter} · total`}
          value={String(total)}
          delta={total ? "all time" : "—"}
          trend={total ? "up" : "flat"}
        />
        <KPICard
          label="This week"
          value={String(week)}
          delta="last 7 days"
          trend={week > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Today"
          value={String(today)}
          delta={today > 0 ? "fresh" : "—"}
          trend={today > 0 ? "up" : "flat"}
        />
        <KPICard
          label="With pain point"
          value={String(withPain)}
          delta={total ? `${Math.round((withPain / total) * 100)}% engagement` : "—"}
          trend={withPain > 0 ? "up" : "flat"}
        />
      </section>

      {error ? (
        <EmptyState
          icon={Database}
          title="Supabase unreachable"
          body="Couldn't load vertical_leads. Check NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel."
        />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={
            validFilter === "all"
              ? "First lead will appear here"
              : `No ${validFilter} leads yet`
          }
          body="When a prospect submits a vertical waitlist or lighting form, the row lands in vertical_leads and shows up here within seconds. Founders also get an email alert via Resend."
        />
      ) : (
        <>
          <DataTable columns={columns} rows={leads} rowKey={(r) => r.id} />

          {leads.some((l) => (l.pain_point ?? "").trim() !== "") && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[12px] uppercase tracking-[0.18em] text-g-text-faint">
                Pain points · conversation fuel
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {leads
                  .filter((l) => (l.pain_point ?? "").trim() !== "")
                  .map((l) => (
                    <article
                      key={l.id}
                      className="rounded-lg border border-g-border bg-g-surface p-4"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13px] font-medium text-g-text">
                          {l.company ?? "—"}
                          <span className="ml-2 text-[11px] text-g-text-faint">
                            · {l.vertical}
                          </span>
                        </p>
                        <p className="font-geist-mono text-[10px] text-g-text-faint">
                          {relTime(l.created_at)}
                        </p>
                      </div>
                      <p className="mt-2 text-[14px] leading-[1.55] text-g-text-muted">
                        “{l.pain_point}”
                      </p>
                      <p className="mt-3 text-[11px] text-g-text-faint">
                        {l.name ?? "—"} · {l.email ?? "—"}
                      </p>
                    </article>
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function FilterPill({
  href,
  label,
  count,
  active,
  live,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  live?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] transition-colors",
        active
          ? "border-g-accent/60 bg-g-accent-faint text-g-accent"
          : "border-g-border bg-g-surface text-g-text-muted hover:border-g-border-subtle hover:text-g-text",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-mono",
          active ? "bg-g-accent/20 text-g-accent" : "bg-g-bg text-g-text-faint",
        )}
      >
        {count}
      </span>
      {live && (
        <span
          aria-hidden
          className="h-1 w-1 rounded-full bg-g-accent"
        />
      )}
    </Link>
  );
}
