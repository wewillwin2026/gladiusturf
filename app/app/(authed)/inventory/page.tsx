import { Boxes, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { KPICard } from "@/components/app/ui/KPICard";
import { EmptyState } from "@/components/app/ui/EmptyState";
import { readAppSession } from "@/lib/app/session";
import {
  getInventoryForTenant,
  summarizeInventory,
} from "@/lib/inventory/queries";
import { money } from "@/lib/shared/format";
import { InventoryTable } from "./_components/InventoryTable";
import { InventoryActions } from "./_components/InventoryActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventory · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function InventoryPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Demo · Ops"
          title="Inventory"
          subtitle="Move what's been sitting longest."
        />
        <EmptyState
          icon={Boxes}
          title="Tenant-only engine"
          body="Inventory tracking is live for tenant workspaces. Sign up to scan, receive, and age-track your lighting stock."
        />
      </div>
    );
  }

  const items = await getInventoryForTenant(session.tenant.id);
  const summary = summarizeInventory(items);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Ops`}
        title="Inventory"
        subtitle="Move what's been sitting longest."
        actions={
          <>
            <InventoryActions items={items} />
            <Link href="/app/inventory/new" prefetch>
              <Button variant="primary">
                <Plus className="h-3.5 w-3.5" />
                Add item
              </Button>
            </Link>
          </>
        }
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
          body="Add your first SKU with the New item button above (e.g. VOLT-G4-3W). Once an item exists, hit Receive to add units against it, scan QR labels in the field, and print labels for new arrivals."
        />
      ) : (
        <InventoryTable items={items} />
      )}
    </div>
  );
}
