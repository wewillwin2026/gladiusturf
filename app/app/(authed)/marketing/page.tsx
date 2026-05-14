import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Globe2, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketing · GladiusTurf",
  robots: { index: false, follow: false },
};

type Session = {
  id: string;
  visitor_hash: string;
  last_seen_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_path: string | null;
  referrer: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  device: string | null;
  page_view_count: number;
  form_start_count: number;
  form_submit_count: number;
  customer_id: string | null;
};

function sourceFor(row: Pick<Session, "utm_source" | "referrer">): string {
  if (row.utm_source?.trim()) return row.utm_source.trim();
  if (row.referrer) {
    try {
      return new URL(row.referrer).hostname;
    } catch {
      return "direct";
    }
  }
  return "direct";
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function MarketingPage() {
  const session = await readAppSession();
  if (session.kind === "unauthenticated") redirect("/app/login");
  if (session.kind !== "tenant") notFound();
  // Tab not enabled yet — bounce them to the install page so they have
  // a clear next step instead of a 404.
  if (!session.tenant.marketing_tab_enabled) {
    redirect("/app/marketing/install");
  }

  const sb = supabaseAdmin();

  const now = new Date();
  const sevenDaysAgoIso = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const thirtyDaysAgoIso = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    sessionsCountRes,
    sessionsListRes,
    formStartsRes,
    formSubmitsRes,
    proposalsSentRes,
    proposalsPaidRes,
  ] = await Promise.all([
    sb
      .from("web_sessions")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", session.tenant.id)
      .gte("last_seen_at", thirtyDaysAgoIso),
    sb
      .from("web_sessions")
      .select(
        "id, visitor_hash, last_seen_at, utm_source, utm_medium, utm_campaign, landing_path, referrer, city, region, country, device, page_view_count, form_start_count, form_submit_count, customer_id",
      )
      .eq("tenant_id", session.tenant.id)
      .gte("last_seen_at", thirtyDaysAgoIso)
      .order("last_seen_at", { ascending: false })
      .limit(100),
    sb
      .from("web_sessions")
      .select("form_start_count")
      .eq("tenant_id", session.tenant.id)
      .gte("last_seen_at", thirtyDaysAgoIso),
    sb
      .from("web_sessions")
      .select("form_submit_count")
      .eq("tenant_id", session.tenant.id)
      .gte("last_seen_at", thirtyDaysAgoIso),
    sb
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", session.tenant.id)
      .gte("sent_at", thirtyDaysAgoIso),
    sb
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", session.tenant.id)
      .in("status", ["sold", "installed"])
      .gte("sold_at", thirtyDaysAgoIso),
  ]);

  const sessions = (sessionsListRes.data ?? []) as Session[];
  const totalSessions30 = sessionsCountRes.count ?? 0;
  const formStarts30 = (
    (formStartsRes.data ?? []) as Array<{ form_start_count: number | null }>
  ).reduce((s, r) => s + (r.form_start_count ?? 0), 0);
  const formSubmits30 = (
    (formSubmitsRes.data ?? []) as Array<{ form_submit_count: number | null }>
  ).reduce((s, r) => s + (r.form_submit_count ?? 0), 0);
  const quotesSent30 = proposalsSentRes.count ?? 0;
  const quotesPaid30 = proposalsPaidRes.count ?? 0;

  // Top sources (last 30d).
  const sourceMap = new Map<string, number>();
  for (const s of sessions) {
    const k = sourceFor(s);
    sourceMap.set(k, (sourceMap.get(k) ?? 0) + 1);
  }
  const topSources = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Last 7d count for the subtitle.
  const last7Count = sessions.filter(
    (s) => s.last_seen_at >= sevenDaysAgoIso,
  ).length;

  const funnel: { label: string; value: number; hint?: string }[] = [
    { label: "Visitors", value: totalSessions30, hint: "Unique sessions" },
    {
      label: "Form starts",
      value: formStarts30,
      hint:
        totalSessions30 > 0
          ? `${Math.round((formStarts30 / totalSessions30) * 100)}% of visitors`
          : undefined,
    },
    {
      label: "Form submits",
      value: formSubmits30,
      hint:
        formStarts30 > 0
          ? `${Math.round((formSubmits30 / formStarts30) * 100)}% of starts`
          : undefined,
    },
    {
      label: "Quotes sent",
      value: quotesSent30,
      hint: "All proposals moved draft → sent",
    },
    {
      label: "Quotes paid",
      value: quotesPaid30,
      hint:
        quotesSent30 > 0
          ? `${Math.round((quotesPaid30 / quotesSent30) * 100)}% close on sent`
          : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Marketing`}
        title="Marketing"
        subtitle={`${last7Count.toLocaleString()} sessions last 7d · ${totalSessions30.toLocaleString()} last 30d. Web visitors → quote conversions, scoped to your shop.`}
      />

      <Link
        href="/app/marketing/install"
        className="self-start inline-flex items-center gap-1.5 text-[11px] text-g-text-muted hover:text-g-text"
      >
        <Settings2 className="h-3 w-3" />
        Tracker install + manual events
      </Link>

      {/* Funnel row */}
      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
          <h2 className="text-[13px] text-g-text">Funnel · last 30 days</h2>
          <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Web → revenue
          </span>
        </header>
        <ol className="grid grid-cols-2 gap-px bg-g-border-subtle sm:grid-cols-5">
          {funnel.map((f, idx) => (
            <li
              key={f.label}
              className="bg-g-card px-4 py-4 flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                  {idx + 1}. {f.label}
                </span>
                {idx < funnel.length - 1 && (
                  <ArrowRight className="hidden sm:inline-block h-3 w-3 text-g-text-faint" />
                )}
              </div>
              <div className="font-mono tabular-nums text-[24px] text-g-text">
                {f.value.toLocaleString()}
              </div>
              {f.hint && (
                <div className="text-[11px] text-g-text-muted">{f.hint}</div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Sources + table side-by-side on large screens */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Visitor table */}
        <section className="g-card overflow-hidden">
          <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
            <h2 className="text-[13px] text-g-text">Recent visitors</h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Last 30 days · {sessions.length} shown
            </span>
          </header>
          {sessions.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Globe2 className="mx-auto h-5 w-5 text-g-text-faint" />
              <p className="mt-2 text-[12px] text-g-text-muted">
                Visitors appear here once your site posts to the tracker.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-[12px]">
                <thead className="text-g-text-faint">
                  <tr className="border-b border-g-border-subtle">
                    <th className="text-left px-4 py-2 font-normal uppercase tracking-[0.12em] text-[10px]">
                      When
                    </th>
                    <th className="text-left px-4 py-2 font-normal uppercase tracking-[0.12em] text-[10px]">
                      Source
                    </th>
                    <th className="text-left px-4 py-2 font-normal uppercase tracking-[0.12em] text-[10px]">
                      Landing
                    </th>
                    <th className="text-right px-4 py-2 font-normal uppercase tracking-[0.12em] text-[10px]">
                      Pages
                    </th>
                    <th className="text-right px-4 py-2 font-normal uppercase tracking-[0.12em] text-[10px]">
                      Form
                    </th>
                    <th className="text-left px-4 py-2 font-normal uppercase tracking-[0.12em] text-[10px]">
                      Geo
                    </th>
                    <th className="text-left px-4 py-2 font-normal uppercase tracking-[0.12em] text-[10px]">
                      Match
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-g-border-subtle last:border-b-0 hover:bg-g-surface/40"
                    >
                      <td className="px-4 py-2 text-g-text-muted whitespace-nowrap">
                        {relativeTime(s.last_seen_at)}
                      </td>
                      <td className="px-4 py-2 text-g-text whitespace-nowrap">
                        {sourceFor(s)}
                        {s.utm_campaign && (
                          <span className="ml-1.5 text-g-text-faint text-[11px]">
                            · {s.utm_campaign}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-g-text-muted truncate max-w-[280px]">
                        <span className="font-mono text-[11px]">
                          {s.landing_path ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {s.page_view_count}
                      </td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {s.form_submit_count > 0 ? (
                          <span className="text-g-success">
                            ✓{s.form_submit_count}
                          </span>
                        ) : s.form_start_count > 0 ? (
                          <span className="text-g-text-muted">
                            ◐{s.form_start_count}
                          </span>
                        ) : (
                          <span className="text-g-text-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-g-text-muted whitespace-nowrap">
                        {[s.city, s.region].filter(Boolean).join(", ") ||
                          s.country ||
                          "—"}
                      </td>
                      <td className="px-4 py-2">
                        {s.customer_id ? (
                          <span className="inline-flex items-center rounded-md bg-g-accent-faint px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-g-accent">
                            Customer
                          </span>
                        ) : (
                          <span className="text-g-text-faint text-[11px]">
                            anon
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Sources side panel */}
        <section className="g-card overflow-hidden h-fit">
          <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
            <h2 className="text-[13px] text-g-text">Top sources</h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              30d
            </span>
          </header>
          {topSources.length === 0 ? (
            <div className="px-5 py-6 text-[12px] text-g-text-muted">
              Sources populate as UTM-tagged + referrer traffic lands.
            </div>
          ) : (
            <ul className="divide-y divide-g-border-subtle">
              {topSources.map((s) => {
                const pct =
                  totalSessions30 > 0
                    ? Math.round((s.count / totalSessions30) * 100)
                    : 0;
                return (
                  <li
                    key={s.source}
                    className="flex items-center justify-between px-5 py-2.5"
                  >
                    <span className="text-[12px] text-g-text truncate">
                      {s.source}
                    </span>
                    <span className="flex items-center gap-2 text-[12px]">
                      <span className="font-mono tabular-nums text-g-text">
                        {s.count}
                      </span>
                      <span className="text-g-text-faint text-[11px]">
                        {pct}%
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
