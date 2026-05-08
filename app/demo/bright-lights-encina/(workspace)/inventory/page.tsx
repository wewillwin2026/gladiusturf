import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { money } from "@/lib/shared/format";
import { BRIGHT_LIGHTS_INVENTORY } from "@/lib/demo-data/bright-lights-inventory";
import { ageInDays, oldestAgeDays, valueTiedUpCents } from "@/lib/inventory/aging";
import { DemoInventoryView } from "./_components/DemoInventoryView";
import type { DemoInventoryItem } from "@/lib/demo-data/bright-lights-inventory";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventory · Bright Lights",
  robots: { index: false, follow: false },
};

export type DemoInventoryRow = DemoInventoryItem & {
  inStock: number;
  oldestAgeDays: number;
  tiedUpCents: number;
};

function summarize(rows: DemoInventoryRow[]) {
  let inStock = 0;
  let aging = 0;
  let staleOrDead = 0;
  let deadCapital = 0;
  for (const r of rows) {
    inStock += r.inStock;
    for (const u of r.units) {
      if (u.status !== "in_stock") continue;
      const days = ageInDays(u.receivedAt);
      if (days >= 30 && days < 90) aging += 1;
      if (days >= 90) {
        staleOrDead += 1;
        deadCapital += u.costCents ?? 0;
      }
    }
  }
  return { inStock, aging, staleOrDead, deadCapital };
}

export default function DemoInventoryPage() {
  const rows: DemoInventoryRow[] = BRIGHT_LIGHTS_INVENTORY.map((item) => {
    const unitsForAging = item.units.map((u) => ({
      received_at: u.receivedAt,
      status: u.status,
      cost_cents: u.costCents,
    }));
    const inStock = item.units.filter((u) => u.status === "in_stock").length;
    return {
      ...item,
      inStock,
      oldestAgeDays: oldestAgeDays(unitsForAging),
      tiedUpCents: valueTiedUpCents(unitsForAging),
    };
  }).sort((a, b) => b.oldestAgeDays - a.oldestAgeDays);

  const summary = summarize(rows);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Bright Lights · Ops"
        title="Inventory"
        subtitle="Move what's been sitting longest."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="In stock"
          value={String(summary.inStock)}
          delta={`${rows.length} SKU${rows.length === 1 ? "" : "s"}`}
          trend={summary.inStock > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Aging (30-89d)"
          value={String(summary.aging)}
          delta={summary.aging > 0 ? "watch closely" : "clear"}
          trend={summary.aging > 0 ? "down" : "flat"}
        />
        <KPICard
          label="Stale ≥90d"
          value={String(summary.staleOrDead)}
          delta={summary.staleOrDead > 0 ? "deploy or return" : "clear"}
          trend={summary.staleOrDead > 0 ? "down" : "flat"}
        />
        <KPICard
          label="Dead capital"
          value={money(summary.deadCapital)}
          delta={summary.deadCapital > 0 ? "tied up ≥90d" : "no exposure"}
          trend={summary.deadCapital > 0 ? "down" : "flat"}
        />
      </section>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-g-border-subtle bg-g-surface px-6 py-12 text-center">
          <Boxes className="h-5 w-5 text-g-text-faint" />
          <div className="text-g-text">No inventory yet</div>
          <div className="text-[12px] text-g-text-muted">
            Scan a fresh box to add it.
          </div>
        </div>
      ) : (
        <DemoInventoryView rows={rows} />
      )}
    </div>
  );
}
