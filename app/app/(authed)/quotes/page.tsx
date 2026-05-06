import Link from "next/link";
import { ArrowRight, FileText, PenSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { QuotesKanban } from "@/components/app/QuotesKanban";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { demoState } from "@/lib/demo/state";
import { money, num, pct } from "@/lib/shared/format";
import { MarkSentButton } from "./_components/MarkSentButton";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, Tone> = {
  draft: "neutral",
  sent: "info",
  viewed: "accent",
  walked: "warning",
  sold: "success",
  installed: "success",
  lost: "danger",
};

type DbProposal = {
  id: string;
  customer_id: string | null;
  status: string;
  total_cents: number | null;
  language: string;
  bom: { title?: string } | null;
  created_at: string;
  customers: { display_name: string } | { display_name: string }[] | null;
};

export default async function QuotesPage() {
  const session = await readAppSession();

  if (session.kind === "tenant") {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("proposals")
      .select(
        "id, customer_id, status, total_cents, language, bom, created_at, customers!inner(display_name)",
      )
      .eq("tenant_id", session.tenant.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.warn("proposals query error", error);
    }

    const rows = (data ?? []) as unknown as DbProposal[];

    const draftCount = rows.filter((r) => r.status === "draft").length;
    const sentCount = rows.filter(
      (r) => r.status === "sent" || r.status === "viewed",
    ).length;
    const soldCount = rows.filter(
      (r) => r.status === "sold" || r.status === "installed",
    ).length;
    const lostCount = rows.filter((r) => r.status === "lost" || r.status === "walked").length;
    const pipelineCents = rows
      .filter((r) => r.status === "draft" || r.status === "sent" || r.status === "viewed")
      .reduce((s, r) => s + (r.total_cents ?? 0), 0);
    const winRate =
      soldCount + lostCount === 0
        ? "—"
        : pct((soldCount / (soldCount + lostCount)) * 100, 0);

    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={session.tenant.display_name}
          title="Quotes"
          subtitle={
            rows.length > 0
              ? `${rows.length} quote${rows.length === 1 ? "" : "s"} on file · ${money(pipelineCents)} in pipeline`
              : "No quotes yet. Draft one in 90 seconds."
          }
          actions={
            <Link href="/app/quotes/draft" prefetch>
              <Button variant="primary" size="md" type="button">
                <PenSquare className="h-3.5 w-3.5" />
                Draft a quote
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          }
        />

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Drafts"
            value={String(draftCount)}
            delta={draftCount > 0 ? "ready to send" : "no drafts"}
            trend="flat"
          />
          <KPICard
            label="In flight"
            value={String(sentCount)}
            delta={sentCount > 0 ? "watch for replies" : "—"}
            trend={sentCount > 0 ? "up" : "flat"}
          />
          <KPICard
            label="Pipeline"
            value={money(pipelineCents)}
            delta={`${draftCount + sentCount} live`}
            trend={pipelineCents > 0 ? "up" : "flat"}
          />
          <KPICard
            label="Win rate"
            value={winRate}
            delta={
              soldCount + lostCount === 0
                ? "first close incoming"
                : `${soldCount} won · ${lostCount} lost`
            }
            trend={soldCount > lostCount ? "up" : "flat"}
          />
        </section>

        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotes yet"
            body="Draft your first quote in 90 seconds. The AI Quote Drafter for tenants ships next; the manual draft path is live today."
            action={
              <Link href="/app/quotes/draft" prefetch>
                <Button variant="primary" size="md" type="button">
                  <PenSquare className="h-3.5 w-3.5" />
                  Draft a quote
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="g-card overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-g-border-subtle">
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Title
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Total
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Customer link
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const cust = Array.isArray(r.customers)
                    ? r.customers[0]
                    : r.customers;
                  const title = (r.bom as { title?: string } | null)?.title ?? "(no title)";
                  return (
                    <tr key={r.id} className="border-b border-g-border-subtle last:border-b-0">
                      <td className="px-4 py-2.5 text-g-text">
                        {cust?.display_name ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-g-text">{title}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill tone={STATUS_TONE[r.status] ?? "neutral"}>
                          {r.status}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-2.5 text-right font-geist-mono tabular-nums">
                        {r.total_cents != null ? money(r.total_cents) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {r.status === "draft" ? (
                          <MarkSentButton proposalId={r.id} />
                        ) : r.status === "lost" ? (
                          <span className="text-g-text-faint text-[11px]">—</span>
                        ) : (
                          <Link
                            href={`/quote/${r.id}`}
                            target="_blank"
                            className="text-[11px] text-g-accent hover:underline font-geist-mono"
                          >
                            /quote/{r.id.slice(0, 8)}…
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-geist-mono tabular-nums text-g-text-muted">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Demo session — preserve the existing seeded Cypress Lawn dashboard.
  const state = demoState();
  const customerById = Object.fromEntries(
    state.customers.map((c) => [c.id, c.name] as const),
  );
  const sent = state.quotes.filter((q) => q.stage === "Sent" || q.stage === "Viewed").length;
  const won = state.quotes.filter((q) => q.stage === "Won").length;
  const lost = state.quotes.filter((q) => q.stage === "Lost").length;
  const totalValueCents = state.quotes.reduce((s, q) => s + q.total, 0);
  const winRate = pct((won / Math.max(1, won + lost)) * 100, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cypress Lawn"
        title="Quotes"
        subtitle={`${num(state.quotes.length)} quotes · ${money(totalValueCents)} pipeline. Drag cards between columns.`}
        actions={
          <Link href="/app/quotes/new" prefetch>
            <Button variant="primary" size="lg">
              <Sparkles className="h-3.5 w-3.5" />
              New AI quote
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="In flight"
          value={String(sent)}
          delta="+3 this week"
          trend="up"
        />
        <KPICard
          label="Won this month"
          value={String(won)}
          delta="+2"
          trend="up"
        />
        <KPICard
          label="Pipeline value"
          value={money(totalValueCents)}
          delta="+22%"
          trend="up"
        />
        <KPICard label="Win rate" value={winRate} delta="+4 pts" trend="up" />
      </section>

      <QuotesKanban quotes={state.quotes} customerById={customerById} />
    </div>
  );
}
