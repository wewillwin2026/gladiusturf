import { CheckCircle2 } from "lucide-react";
import { CoaTree } from "@/components/books-sandbox/coa-tree";
import { ExpenseFeed } from "@/components/books-sandbox/expense-feed";
import { PeriodPlCard } from "@/components/books-sandbox/period-pl-card";
import { ReportsRow } from "@/components/books-sandbox/reports-row";
import { ServiceLineTable } from "@/components/books-sandbox/service-line-table";
import { SHOP } from "@/content/books-demo-data";

export default function BooksDemoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-bone md:text-4xl">
          Owner console
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-bone/55">
          What you&apos;d see Monday morning at 7:00 AM if you ran{" "}
          {SHOP.name} on Gladius. Numbers regenerate against the live ledger
          every load — no &quot;as of last Tuesday.&quot;
        </p>
      </div>

      <PeriodPlCard />
      <ServiceLineTable />
      <ExpenseFeed />
      <CoaTree />
      <ReportsRow />

      {/* Footer audit-log strip */}
      <footer className="rounded-2xl border border-bone/10 bg-bone/[0.02] px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-bone/45">
          <span className="inline-flex items-center gap-1.5 text-moss-bright">
            <CheckCircle2 className="h-3 w-3" />
            Last reconciliation · {SHOP.lastReconciliation}
          </span>
          <span className="text-bone/25">·</span>
          <span>Bookkeeper {SHOP.bookkeeper} signed off</span>
          <span className="text-bone/25">·</span>
          <span>{SHOP.disputes} disputed entries</span>
        </div>
      </footer>
    </div>
  );
}
