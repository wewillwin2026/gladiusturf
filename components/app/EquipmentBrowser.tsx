import * as React from "react";
import {
  AlertTriangle,
  Fuel,
  Gauge,
  Hammer,
  Package,
  Truck,
  Wrench,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import { type ProductKind } from "./engines";

type Asset = {
  id: string;
  name: string;
  type: "Mower" | "Trimmer" | "Backpack Blower" | "Chainsaw" | "Truck" | "Trailer" | "Water Pump";
  crew: string;
  hours: number;
  hoursMax: number;
  fuelGal: number;
  nextSvc: string;
  overdue?: boolean;
};

const ICON_FOR: Record<Asset["type"], React.ComponentType<{ className?: string }>> = {
  Mower: Hammer,
  Trimmer: Wrench,
  "Backpack Blower": Wrench,
  Chainsaw: Wrench,
  Truck: Truck,
  Trailer: Package,
  "Water Pump": Wrench,
};

const ASSETS: Asset[] = [
  {
    id: "EQ-001",
    name: "Toro Z-Master 2000",
    type: "Mower",
    crew: "Riverside North",
    hours: 1284,
    hoursMax: 2000,
    fuelGal: 412,
    nextSvc: "+38h",
  },
  {
    id: "EQ-002",
    name: "Toro Z-Master 2000",
    type: "Mower",
    crew: "Westshore",
    hours: 921,
    hoursMax: 2000,
    fuelGal: 298,
    nextSvc: "+71h",
  },
  {
    id: "EQ-003",
    name: "Stihl FS131R",
    type: "Trimmer",
    crew: "Ballast Point",
    hours: 442,
    hoursMax: 600,
    fuelGal: 28,
    nextSvc: "+12h",
  },
  {
    id: "EQ-004",
    name: "Echo PB-9010T",
    type: "Backpack Blower",
    crew: "Hyde Park",
    hours: 612,
    hoursMax: 800,
    fuelGal: 41,
    nextSvc: "+8h",
  },
  {
    id: "EQ-005",
    name: "Husqvarna 460 Rancher",
    type: "Chainsaw",
    crew: "Bayshore",
    hours: 88,
    hoursMax: 400,
    fuelGal: 3.2,
    nextSvc: "+92h",
  },
  {
    id: "EQ-006",
    name: "Ford F-250 · LP-447X",
    type: "Truck",
    crew: "Tampa East",
    hours: 4220,
    hoursMax: 8000,
    fuelGal: 1880,
    nextSvc: "+1140mi",
  },
  {
    id: "EQ-007",
    name: "Big Tex 16ft Trailer",
    type: "Trailer",
    crew: "Riverside North",
    hours: 0,
    hoursMax: 1,
    fuelGal: 0,
    nextSvc: "Annual reg.",
  },
  {
    id: "EQ-008",
    name: "Honda WB30 Pump",
    type: "Water Pump",
    crew: "Bayshore",
    hours: 28,
    hoursMax: 200,
    fuelGal: 6,
    nextSvc: "−12h overdue",
    overdue: true,
  },
];

export function EquipmentBrowser({ product }: { product: ProductKind }) {
  const overdue = ASSETS.filter((a) => a.overdue).length;
  const totalHours = ASSETS.reduce((s, a) => s + a.hours, 0);
  const totalFuel = ASSETS.reduce((s, a) => s + a.fuelGal, 0);
  const fuelCostCents = Math.round(totalFuel * 380);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={product === "demo" ? "Cypress Lawn" : "War Room"}
        title="Equipment"
        subtitle="Fleet, fuel, maintenance. Per-asset utilization and service forecast."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active assets" value={String(ASSETS.length)} />
        <KPICard
          label="Total hours · YTD"
          value={totalHours.toLocaleString()}
        />
        <KPICard
          label="Fuel · this week"
          value={`$${(fuelCostCents / 100).toFixed(0)}`}
          delta="−$42 vs last"
          trend="down"
        />
        <KPICard
          label="Overdue service"
          value={String(overdue)}
          delta={overdue > 0 ? "Honda WB30" : "All current"}
          trend={overdue > 0 ? "up" : "flat"}
        />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ASSETS.map((a) => (
          <AssetCard key={a.id} asset={a} />
        ))}
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const Icon = ICON_FOR[asset.type] || Wrench;
  const utilPct = asset.hoursMax > 1
    ? Math.min(100, (asset.hours / asset.hoursMax) * 100)
    : 0;
  const utilTone = utilPct > 80 ? "bg-g-warning" : utilPct > 60 ? "bg-g-info" : "bg-g-accent";
  const fuelDisplay = asset.fuelGal === 0
    ? "—"
    : asset.fuelGal < 10
      ? `${asset.fuelGal} gal`
      : `${Math.round(asset.fuelGal)} gal`;

  return (
    <div className="g-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-g-surface-2 border border-g-border-subtle flex items-center justify-center text-g-text-muted shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-g-text font-medium truncate">{asset.name}</span>
            <StatusPill tone={asset.overdue ? "danger" : "neutral"}>
              {asset.type}
            </StatusPill>
          </div>
          <div className="mt-0.5 text-[11px] text-g-text-faint font-mono">
            {asset.id} · {asset.crew}
          </div>
        </div>
      </div>

      {asset.hoursMax > 1 && (
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3 w-3" /> Hours used
            </span>
            <span className="font-mono normal-case tracking-normal text-g-text-muted">
              {asset.hours.toLocaleString()} / {asset.hoursMax.toLocaleString()}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-g-surface-2 overflow-hidden">
            <div className={`h-full ${utilTone}`} style={{ width: `${utilPct}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-g-border-subtle/60 text-[11px]">
        <div className="inline-flex items-center gap-1.5 text-g-text-faint">
          <Fuel className="h-3 w-3" />
          <span className="font-mono">{fuelDisplay}</span>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 ${
            asset.overdue ? "text-g-danger" : "text-g-text-muted"
          }`}
        >
          {asset.overdue && <AlertTriangle className="h-3 w-3" />}
          <span className="font-mono">{asset.nextSvc}</span>
        </div>
      </div>
    </div>
  );
}
