import * as React from "react";
import { PageHeader } from "./PageHeader";
import { KPICard } from "./ui/KPICard";
import { DataTable, type Column } from "./ui/DataTable";
import { type ProductKind } from "./engines";

export type StubKpi = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  spark?: number[];
};

export function EngineStub<T>({
  product,
  eyebrow,
  title,
  subtitle,
  actions,
  kpis,
  rows,
  columns,
  rowHref,
  empty,
  caption,
  rowKey,
}: {
  product: ProductKind;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  kpis: StubKpi[];
  rows: T[];
  columns: Column<T>[];
  rowHref?: (row: T) => string | null;
  empty?: React.ReactNode;
  caption?: React.ReactNode;
  rowKey?: (row: T, idx: number) => string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={eyebrow ?? (product === "demo" ? "Cypress Lawn" : "War Room")}
        title={title}
        subtitle={subtitle}
        actions={actions}
      />
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <KPICard
            key={k.label}
            label={k.label}
            value={k.value}
            delta={k.delta}
            trend={k.trend}
            spark={k.spark}
          />
        ))}
      </section>
      <DataTable
        columns={columns}
        rows={rows}
        rowHref={rowHref}
        empty={empty}
        caption={caption}
        rowKey={rowKey}
      />
    </div>
  );
}
