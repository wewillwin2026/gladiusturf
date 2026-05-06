/**
 * Vertical registry — keyed by tenant.vertical. Encapsulates the
 * vertical-specific shape of the universal `/app` surface so the dashboard,
 * customer detail, and inventory pages don't hardcode `lighting_fixtures`.
 *
 * Adding a new vertical (e.g. irrigation as vertical #2):
 *   1. Add the vertical's asset table to supabase/migrations
 *   2. Add an entry to VERTICAL_REGISTRY below
 *   3. Update buildAssetKpis to compute meaningful KPIs from that table
 *
 * No app/page changes should be needed.
 */

import type { KPI } from "@/lib/shared/types";

type Trend = NonNullable<KPI["trend"]>;
const UP: Trend = "up";
const DOWN: Trend = "down";
const FLAT: Trend = "flat";

export type VerticalRegistryEntry = {
  /** Postgres table holding the per-customer assets for this vertical. */
  assetTable: string;
  /** Singular noun for one asset — "fixture", "backflow assembly", "zone". */
  assetLabel: string;
  /** Plural noun. */
  assetLabelPlural: string;
  /**
   * Columns to select when reading assets for KPI math. Restrict to what
   * `buildAssetKpis` actually needs to keep the query small.
   */
  countSelect: string;
  /**
   * Compute the dashboard KPIs from a tenant's asset rows + side info.
   * Returns up to 4 KPIs — the universal dashboard slot count.
   */
  buildAssetKpis: (
    rows: Array<Record<string, unknown>>,
    opts: { customerCount: number; tenantName: string },
  ) => KPI[];
};

const buildKpis = (kpis: KPI[]): KPI[] => kpis;

/**
 * Lighting — the live vertical. Brand: Cast / Unique / FX. Asset =
 * lighting_fixtures with warranty_status (active|lifetime|expiring|expired).
 */
const LIGHTING: VerticalRegistryEntry = {
  assetTable: "lighting_fixtures",
  assetLabel: "fixture",
  assetLabelPlural: "fixtures",
  countSelect: "id, warranty_status, warranty_end",
  buildAssetKpis(rows, { customerCount, tenantName }) {
    const fixtureCount = rows.length;
    const activeWarranties = rows.filter(
      (f) =>
        f.warranty_status === "active" || f.warranty_status === "lifetime",
    ).length;
    const now = Date.now();
    const expiringSoon = rows.filter((f) => {
      if (f.warranty_status !== "active" || !f.warranty_end) return false;
      const ms = new Date(f.warranty_end as string).getTime() - now;
      return ms > 0 && ms < 90 * 86400_000;
    }).length;

    return [
      {
        label: "Customers",
        value: String(customerCount),
        delta: customerCount === 0 ? "no customers yet" : tenantName,
        trend: customerCount > 0 ? UP : FLAT,
        spark: [],
      },
      {
        label: "Fixtures tracked",
        value: String(fixtureCount),
        delta:
          fixtureCount === 0
            ? "add inventory"
            : `${activeWarranties} under warranty`,
        trend: fixtureCount > 0 ? UP : FLAT,
        spark: [],
      },
      {
        label: "Warranties expiring · 90d",
        value: String(expiringSoon),
        delta: expiringSoon > 0 ? "send Cast outreach" : "no exposure",
        trend: expiringSoon > 0 ? DOWN : FLAT,
        spark: [],
      },
    ];
  },
};

/**
 * Irrigation — vertical #2 (in development). Asset =
 * irrigation_backflow_assemblies with utility-portal status. Schema lands
 * in 20260505_g_irrigation_tables.sql but the app surface ships behind
 * the registry refactor.
 */
const IRRIGATION: VerticalRegistryEntry = {
  assetTable: "irrigation_backflow_assemblies",
  assetLabel: "backflow assembly",
  assetLabelPlural: "backflow assemblies",
  countSelect: "id, last_test_passed, next_test_due_at",
  buildAssetKpis(rows, { customerCount, tenantName }) {
    const total = rows.length;
    const now = Date.now();
    const overdueCount = rows.filter((r) => {
      if (!r.next_test_due_at) return false;
      return new Date(r.next_test_due_at as string).getTime() < now;
    }).length;
    const dueSoon = rows.filter((r) => {
      if (!r.next_test_due_at) return false;
      const ms = new Date(r.next_test_due_at as string).getTime() - now;
      return ms > 0 && ms < 30 * 86400_000;
    }).length;

    return [
      {
        label: "Customers",
        value: String(customerCount),
        delta: customerCount === 0 ? "no customers yet" : tenantName,
        trend: customerCount > 0 ? UP : FLAT,
        spark: [],
      },
      {
        label: "Backflow assemblies",
        value: String(total),
        delta: total === 0 ? "add assets" : `${overdueCount} overdue tests`,
        trend: total > 0 ? UP : FLAT,
        spark: [],
      },
      {
        label: "Tests due · 30d",
        value: String(dueSoon),
        delta: dueSoon > 0 ? "schedule now" : "all current",
        trend: dueSoon > 0 ? DOWN : FLAT,
        spark: [],
      },
    ];
  },
};

/**
 * Generic placeholder for verticals whose asset schema hasn't shipped yet.
 * Used for pool, lawn-care, tree-care, snow, landscape, commercial.
 */
function placeholderEntry(label: string, plural: string): VerticalRegistryEntry {
  return {
    assetTable: "__placeholder__",
    assetLabel: label,
    assetLabelPlural: plural,
    countSelect: "id",
    buildAssetKpis(_rows, { customerCount, tenantName }) {
      return [
        {
          label: "Customers",
          value: String(customerCount),
          delta: customerCount === 0 ? "no customers yet" : tenantName,
          trend: customerCount > 0 ? UP : FLAT,
          spark: [],
        },
        {
          label: plural[0].toUpperCase() + plural.slice(1),
          value: "—",
          delta: "engine in development",
          trend: FLAT,
          spark: [],
        },
        {
          label: "Plan upsell",
          value: "—",
          delta: "needs customers",
          trend: FLAT,
          spark: [],
        },
      ];
    },
  };
}

export const VERTICAL_REGISTRY: Record<string, VerticalRegistryEntry> = {
  lighting: LIGHTING,
  irrigation: IRRIGATION,
  pool: placeholderEntry("pool", "pool systems"),
  "lawn-care": placeholderEntry("property", "properties"),
  "tree-care": placeholderEntry("tree", "trees"),
  snow: placeholderEntry("route", "routes"),
  landscape: placeholderEntry("project", "projects"),
  commercial: placeholderEntry("contract", "contracts"),
};

export function registryFor(vertical: string): VerticalRegistryEntry {
  return VERTICAL_REGISTRY[vertical] ?? LIGHTING;
}
