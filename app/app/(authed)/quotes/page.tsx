import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { KPICard } from "@/components/app/ui/KPICard";
import { QuotesKanban } from "@/components/app/QuotesKanban";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";
import { demoState } from "@/lib/demo/state";
import { money, num, pct } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Quotes"
        tenant={session.tenant}
        icon={FileText}
        body="Proposals you draft via the AI Quote Drafter (or manually) will appear here. Linked to customers, fixtures, and the install schedule."
      />
    );
  }
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
