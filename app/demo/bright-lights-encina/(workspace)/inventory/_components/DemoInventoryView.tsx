"use client";

import * as React from "react";
import { PackagePlus, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import { Button } from "@/components/app/ui/Button";
import AgeBadge from "@/components/app/inventory/AgeBadge";
import BarcodeScannerDialog from "@/components/app/inventory/BarcodeScannerDialog";
import { money } from "@/lib/shared/format";
import { ageInDays } from "@/lib/inventory/aging";
import { findUnitByQrCode } from "@/lib/demo-data/bright-lights-inventory";
import type { DemoInventoryRow } from "../page";

const CATEGORY_TONE: Record<string, Tone> = {
  fixture: "success",
  transformer: "warning",
  controller: "info",
  sensor: "accent",
  bulb: "warning",
  wire: "neutral",
  accessory: "neutral",
  other: "neutral",
};

const COLUMNS: Column<DemoInventoryRow>[] = [
  { key: "sku", header: "SKU", cell: (r) => r.sku, mono: true, width: "140px" },
  {
    key: "name",
    header: "Name",
    cell: (r) => (
      <div className="min-w-0">
        <div className="text-g-text truncate">{r.name}</div>
        {r.brand && (
          <div className="text-[11px] text-g-text-faint truncate">
            {r.brand}
            {r.groupLabel ? ` · ${r.groupLabel}` : ""}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    cell: (r) => (
      <StatusPill tone={CATEGORY_TONE[r.category] ?? "neutral"}>
        {r.category}
      </StatusPill>
    ),
  },
  {
    key: "in_stock",
    header: "In stock",
    cell: (r) => (
      <span>
        {r.inStock}
        {r.parLevel != null && r.inStock < r.parLevel && (
          <span className="ml-1 text-g-warning text-[11px]">↓</span>
        )}
      </span>
    ),
    align: "right",
    mono: true,
    width: "90px",
  },
  {
    key: "oldest",
    header: "Oldest age",
    cell: (r) => <AgeBadge days={r.oldestAgeDays} />,
    width: "150px",
  },
  {
    key: "par",
    header: "Par",
    cell: (r) => (r.parLevel != null ? r.parLevel : "—"),
    align: "right",
    mono: true,
    width: "70px",
  },
  {
    key: "unit_cost",
    header: "Unit cost",
    cell: (r) => (r.unitCostCents != null ? money(r.unitCostCents) : "—"),
    align: "right",
    mono: true,
    width: "100px",
  },
  {
    key: "tied_up",
    header: "Tied-up",
    cell: (r) =>
      r.tiedUpCents > 0 ? (
        <span className="text-g-text">{money(r.tiedUpCents)}</span>
      ) : (
        <span className="text-g-text-faint">—</span>
      ),
    align: "right",
    mono: true,
    width: "110px",
  },
];

export function DemoInventoryView({ rows }: { rows: DemoInventoryRow[] }) {
  const [scannerOpen, setScannerOpen] = React.useState(false);

  function handleScan(code: string) {
    const hit = findUnitByQrCode(code);
    if (!hit) {
      toast.error(`No unit with code ${code}`);
      return;
    }
    const days = ageInDays(hit.unit.receivedAt);
    toast.success(`${hit.item.sku} · ${hit.item.name}`, {
      description: `${hit.unit.status} · ${days}d on shelf${
        hit.unit.location ? ` · ${hit.unit.location}` : ""
      }`,
    });
    setScannerOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 -mt-2">
        <Button
          variant="secondary"
          size="md"
          onClick={() =>
            toast.info("Receiving is live in the real CRM", {
              description:
                "In production, this opens a scan-and-stage flow that books units into inventory in seconds.",
            })
          }
        >
          <PackagePlus className="h-3.5 w-3.5" />
          Receive
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => setScannerOpen(true)}
        >
          <ScanLine className="h-3.5 w-3.5" />
          Scan
        </Button>
      </div>
      <DataTable
        columns={COLUMNS}
        rows={rows}
        rowKey={(r) => r.sku}
        empty="No inventory yet."
      />
      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScan}
      />
    </>
  );
}
