import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { readAppSession } from "@/lib/app/session";
import {
  getInventoryForTenant,
  summarizeInventory,
} from "@/lib/inventory/queries";
import { money } from "@/lib/shared/format";
import { InventoryTable } from "./_components/InventoryTable";
import { ScanButton } from "./_components/ScanButton";
import { InventoryActions } from "./_components/InventoryActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventory · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function InventoryPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }

  const items = await getInventoryForTenant(session.tenant.id);
  const summary = summarizeInventory(items);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Ops`}
        title="Inventory"
        subtitle="Move what's been sitting longest."
        actions={<InventoryActions items={items} />}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="In stock"
          value={String(summary.totalInStock)}
          delta={`${items.length} SKU${items.length === 1 ? "" : "s"}`}
          trend={summary.totalInStock > 0 ? "up" : "flat"}
        />
        <KPICard
          label="Aging (30-89d)"
          value={String(summary.agingCount)}
          delta={summary.agingCount > 0 ? "watch closely" : "clear"}
          trend={summary.agingCount > 0 ? "down" : "flat"}
        />
        <KPICard
          label="Stale ≥90d"
          value={String(summary.staleOrDeadCount)}
          delta={summary.staleOrDeadCount > 0 ? "deploy or return" : "clear"}
          trend={summary.staleOrDeadCount > 0 ? "down" : "flat"}
        />
        <KPICard
          label="Dead capital"
          value={money(summary.deadCapitalCents)}
          delta={
            summary.deadCapitalCents > 0
              ? "tied up ≥90d"
              : "no exposure"
          }
          trend={summary.deadCapitalCents > 0 ? "down" : "flat"}
        />
      </section>

      {items.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No inventory yet"
          body="Scan a fresh box to add it."
          action={<ScanButton />}
        />
      ) : (
        <InventoryTable items={items} />
      )}
    </div>
  );
}
