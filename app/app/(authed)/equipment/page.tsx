import Link from "next/link";
import { Hammer, Plus, Truck, Wrench, Zap } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/app/ui/Button";
import { KPICard } from "@/components/app/ui/KPICard";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { EquipmentBrowser } from "@/components/app/EquipmentBrowser";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { NewEquipmentForm } from "./_components/NewEquipmentForm";

export const dynamic = "force-dynamic";

type EquipmentRow = {
  id: string;
  display_name: string;
  category: string;
  make: string | null;
  model: string | null;
  serial_no: string | null;
  asset_tag: string | null;
  purchase_date: string | null;
  status: string;
  notes: string | null;
};

const STATUS_TONE: Record<string, Tone> = {
  active: "success",
  in_shop: "warning",
  retired: "neutral",
  lost: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  in_shop: "In shop",
  retired: "Retired",
  lost: "Lost",
};

const CATEGORY_ICON: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>
> = {
  truck: Truck,
  trailer: Truck,
  mower: Hammer,
  blower: Hammer,
  trimmer: Hammer,
  lift: Hammer,
  multimeter: Zap,
  other: Wrench,
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function Page() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return <EquipmentBrowser product="demo" />;
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tenant_equipment")
    .select(
      "id, display_name, category, make, model, serial_no, asset_tag, purchase_date, status, notes",
    )
    .eq("tenant_id", session.tenant.id)
    .order("status", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) console.warn("equipment query failed", error);
  const rows = (data ?? []) as unknown as EquipmentRow[];

  const active = rows.filter((r) => r.status === "active");
  const inShop = rows.filter((r) => r.status === "in_shop");
  const trucks = rows.filter((r) => r.category === "truck" && r.status === "active").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${session.tenant.display_name} · Equipment`}
        title="Equipment"
        subtitle={
          rows.length === 0
            ? "Add your first piece of equipment to start tracking the fleet."
            : `${active.length} active · ${inShop.length} in shop · ${trucks} truck${trucks === 1 ? "" : "s"} rolling.`
        }
        actions={
          <Link href="/app/equipment/new" prefetch>
            <Button variant="primary">
              <Plus className="h-3.5 w-3.5" />
              Add equipment
            </Button>
          </Link>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active fleet" value={String(active.length)} />
        <KPICard label="In shop" value={String(inShop.length)} />
        <KPICard label="Trucks" value={String(trucks)} />
        <KPICard label="Total assets" value={String(rows.length)} />
      </section>

      <NewEquipmentForm />

      <section className="g-card overflow-hidden">
        <header className="border-b border-g-border-subtle px-5 py-3">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-g-text-faint">
            Fleet
          </h2>
        </header>
        {rows.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Truck className="mx-auto h-6 w-6 text-g-text-faint" />
            <p className="mt-2 text-[13px] text-g-text-muted">
              No equipment yet. Use the form above to add your first asset.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-g-border-subtle">
            {rows.map((e) => {
              const Icon = CATEGORY_ICON[e.category] ?? Wrench;
              return (
                <li
                  key={e.id}
                  className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[40px_minmax(0,1fr)_auto_auto_auto] md:items-center md:gap-4"
                >
                  <Icon
                    className="h-5 w-5 text-g-text-faint"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="text-[14px] text-g-text">
                      {e.display_name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-g-text-muted">
                      {[e.make, e.model].filter(Boolean).join(" ") || "—"}
                      {e.serial_no && ` · SN ${e.serial_no}`}
                      {e.asset_tag && ` · #${e.asset_tag}`}
                    </div>
                  </div>
                  <span className="text-[11px] text-g-text-faint capitalize">
                    {e.category}
                  </span>
                  <span className="text-[11px] text-g-text-faint">
                    {fmtDate(e.purchase_date)}
                  </span>
                  <StatusPill tone={STATUS_TONE[e.status] ?? "neutral"}>
                    {STATUS_LABEL[e.status] ?? e.status}
                  </StatusPill>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
