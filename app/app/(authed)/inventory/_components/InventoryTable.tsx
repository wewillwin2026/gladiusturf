"use client";

import * as React from "react";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import AgeBadge from "@/components/app/inventory/AgeBadge";
import { money } from "@/lib/shared/format";
import type { InventoryItemWithStats } from "@/lib/inventory/queries";
import { UnitDrawer } from "./UnitDrawer";

// Map the canonical category values from migration 20260505_i_inventory.sql
// to StatusPill tones. New categories should be added here, not invented
// in the JSX. Keeping a single source of truth for the colour mapping
// means a "lighting" or "irrigation" category added later only needs to
// be wired in one place.
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

const COLUMNS: Column<InventoryItemWithStats>[] = [
  {
    key: "sku",
    header: "SKU",
    cell: (r) => r.sku,
    mono: true,
    width: "120px",
  },
  {
    key: "name",
    header: "Name",
    cell: (r) => (
      <div className="min-w-0">
        <div className="text-g-text truncate">{r.name}</div>
        {r.brand && (
          <div className="text-[11px] text-g-text-faint truncate">
            {r.brand}
            {r.group_label ? ` · ${r.group_label}` : ""}
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
        {r.in_stock}
        {r.par_level != null && r.in_stock < r.par_level && (
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
    cell: (r) => <AgeBadge days={r.oldest_age_days} />,
    width: "120px",
  },
  {
    key: "par",
    header: "Par",
    cell: (r) => (r.par_level != null ? r.par_level : "—"),
    align: "right",
    mono: true,
    width: "70px",
  },
  {
    key: "unit_cost",
    header: "Unit cost",
    cell: (r) =>
      r.unit_cost_cents != null ? money(r.unit_cost_cents) : "—",
    align: "right",
    mono: true,
    width: "100px",
  },
  {
    key: "tied_up",
    header: "Tied-up",
    cell: (r) =>
      r.tied_up_cents > 0 ? (
        <span className="text-g-text">{money(r.tied_up_cents)}</span>
      ) : (
        <span className="text-g-text-faint">—</span>
      ),
    align: "right",
    mono: true,
    width: "110px",
  },
];

export function InventoryTable({ items }: { items: InventoryItemWithStats[] }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Memoize columns once and inject row-click handler via the table's
  // first column's `cell` wrapper. DataTable doesn't currently expose an
  // onRowClick, so we render the SKU cell as a clickable button to keep
  // accessibility cleaner than wrapping the whole <tr>.
  const columns = React.useMemo<Column<InventoryItemWithStats>[]>(() => {
    return COLUMNS.map((col, idx) => {
      if (idx !== 0) return col;
      return {
        ...col,
        cell: (row) => (
          <button
            type="button"
            onClick={() => setSelectedId(row.id)}
            className="font-geist-mono text-g-text hover:text-g-accent"
          >
            {col.cell(row)}
          </button>
        ),
      };
    });
  }, []);

  const selected = selectedId
    ? items.find((i) => i.id === selectedId) ?? null
    : null;

  return (
    <>
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(r) => r.id}
        empty="No inventory yet."
      />
      <UnitDrawer
        item={selected}
        open={selected != null}
        onOpenChange={(o) => {
          if (!o) setSelectedId(null);
        }}
      />
    </>
  );
}
