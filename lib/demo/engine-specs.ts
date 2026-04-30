/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Engine page specs for the /app demo CRM. Each function returns the props
 * needed by <EngineStub /> — KPIs, DataTable columns, rows. Rows derive from
 * the deterministic seeded state in lib/demo/state.ts.
 *
 * The cell handlers use `(r: any)` because each engine returns its own row
 * shape, and the typed `Column<T>` constraint is satisfied by the cast at the
 * end of each spec. The runtime is well-typed via the local `rows` variable.
 */

import type { Column } from "@/components/app/ui/DataTable";
import type { StubKpi } from "@/components/app/EngineStub";
import { demoState } from "./state";
import { rng } from "@/lib/shared/prng";
import { SERVICE_RATES } from "@/lib/shared/pricing";
import {
  money,
  num,
  pct,
  shortDate,
  timeOfDay,
  relTime,
} from "@/lib/shared/format";

export type EngineSpec = {
  title: string;
  subtitle?: string;
  kpis: StubKpi[];
  // Typed loosely so each engine can return its own row shape.
  rows: unknown[];
  columns: Column<unknown>[];
  rowHref?: (row: unknown) => string | null;
  caption?: string;
  empty?: string;
};

// ---- helpers ----

function sparkFor(seed: number, n = 14, lo = 4, hi = 18): number[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => r.int(lo, hi));
}

function pill(text: string): string {
  return text;
}

// ---- per-engine specs ----

function customersSpec(): EngineSpec {
  const { customers } = demoState();
  const rows = customers.slice(0, 60);
  const columns: Column<(typeof customers)[number]>[] = [
    { key: "name", header: "Customer", cell: (c: any) => c.name },
    { key: "tier", header: "Tier", cell: (c: any) => c.tier, align: "center" },
    { key: "addr", header: "Address", cell: (c: any) => `${c.address}, ${c.zip}`, className: "text-g-text-muted" },
    {
      key: "ltv",
      header: "LTV",
      cell: (c: any) => money(c.ltvCents),
      mono: true,
      align: "right",
    },
    {
      key: "next",
      header: "Next visit",
      cell: (c: any) => (c.nextVisit ? relTime(c.nextVisit) : "—"),
      align: "right",
      mono: true,
    },
    { key: "status", header: "Status", cell: (c: any) => c.status, align: "center" },
  ];
  return {
    title: "Customers",
    subtitle: `${num(customers.filter((c) => c.status === "Active").length)} active · ${num(customers.length)} total`,
    kpis: [
      {
        label: "Active customers",
        value: num(customers.filter((c) => c.status === "Active").length),
        delta: "+24 vs Q1",
        trend: "up",
        spark: sparkFor(101),
      },
      {
        label: "Pro / Enterprise",
        value: num(
          customers.filter((c) => c.tier !== "Independent" && c.status === "Active").length,
        ),
        delta: "+11 vs Q1",
        trend: "up",
      },
      {
        label: "Avg. LTV",
        value: money(
          Math.round(customers.reduce((s, c) => s + c.ltvCents, 0) / customers.length),
        ),
        delta: "+$320",
        trend: "up",
      },
      {
        label: "Lapsed",
        value: num(customers.filter((c) => c.status === "Lapsed").length),
        delta: "−4 this month",
        trend: "down",
      },
    ],
    rows,
    columns: columns as unknown as Column<unknown>[],
    rowHref: (row) => `/app/customers/${(row as (typeof customers)[number]).id}`,
  };
}

function quotesSpec(): EngineSpec {
  const { quotes, customers } = demoState();
  const byId = new Map(customers.map((c) => [c.id, c.name] as const));
  const rows = quotes;
  const columns: Column<(typeof quotes)[number]>[] = [
    { key: "id", header: "Quote", cell: (q: any) => q.id, mono: true },
    {
      key: "customer",
      header: "Customer",
      cell: (q: any) => byId.get(q.customerId) ?? "—",
    },
    { key: "stage", header: "Stage", cell: (q: any) => q.stage, align: "center" },
    {
      key: "total",
      header: "Total",
      cell: (q: any) => money(q.total),
      mono: true,
      align: "right",
    },
    {
      key: "created",
      header: "Created",
      cell: (q: any) => shortDate(q.createdAt),
      align: "right",
      mono: true,
    },
  ];
  const sent = quotes.filter((q) => q.stage === "Sent" || q.stage === "Viewed").length;
  const won = quotes.filter((q) => q.stage === "Won").length;
  const totalValueCents = quotes.reduce((s, q) => s + q.total, 0);
  return {
    title: "Quotes",
    subtitle: `${quotes.length} quotes · ${money(totalValueCents)} pipeline`,
    kpis: [
      { label: "In flight", value: num(sent), delta: "+3 this week", trend: "up" },
      { label: "Won this month", value: num(won), delta: "+2", trend: "up" },
      { label: "Pipeline", value: money(totalValueCents), trend: "up", spark: sparkFor(102) },
      {
        label: "Win rate",
        value: pct(
          (won / Math.max(1, won + quotes.filter((q) => q.stage === "Lost").length)) * 100,
          0,
        ),
        delta: "+4 pts",
        trend: "up",
      },
    ],
    rows,
    columns: columns as unknown as Column<unknown>[],
  };
}

function quotesNewSpec(): EngineSpec {
  type DraftRow = { id: string; addr: string; services: string; total: number };
  const rows: DraftRow[] = [
    { id: "DRAFT-12", addr: "2231 Lakeshore Way", services: "Mowing + Aeration", total: 18400 },
    { id: "DRAFT-11", addr: "412 Bayshore Blvd", services: "Mulch refresh", total: 96000 },
    { id: "DRAFT-10", addr: "3218 Maple Hollow Ln", services: "Fertilization (NPK)", total: 24800 },
    { id: "DRAFT-09", addr: "780 Heritage Oaks", services: "Mowing + Edging", total: 9600 },
    { id: "DRAFT-08", addr: "5601 Riverside Dr", services: "Tree Trim", total: 39000 },
    { id: "DRAFT-07", addr: "1450 Beaumont Ave", services: "Pest Control", total: 16400 },
    { id: "DRAFT-06", addr: "2102 Cypress Pointe", services: "Aeration + Overseed", total: 27000 },
    { id: "DRAFT-05", addr: "660 Hampton Pl", services: "Full maintenance", total: 31200 },
  ];
  const columns: Column<DraftRow>[] = [
    { key: "id", header: "Draft", cell: (r: any) => r.id, mono: true },
    { key: "addr", header: "Address", cell: (r: any) => r.addr },
    { key: "svc", header: "Services", cell: (r: any) => r.services },
    {
      key: "total",
      header: "Estimated",
      cell: (r: any) => money(r.total * 100),
      align: "right",
      mono: true,
    },
  ];
  return {
    title: "AI Quote Drafter",
    subtitle:
      "Address → satellite measure → quote. Phase 3 wires the Anthropic streaming and Mapbox satellite tiles. Sample drafts shown below.",
    kpis: [
      { label: "Drafts this month", value: "37", delta: "+22 vs last", trend: "up" },
      { label: "Avg. time to send", value: "1m 47s", delta: "−4m vs manual", trend: "down" },
      { label: "Win rate (AI)", value: "62%", delta: "+18 pts", trend: "up" },
      { label: "Sq ft measured", value: "184k", delta: "this month", trend: "up", spark: sparkFor(103, 14, 60, 220) },
    ],
    rows,
    columns: columns as unknown as Column<unknown>[],
  };
}

function reviewsSpec(): EngineSpec {
  const { customers } = demoState();
  const reviewed = customers
    .filter((c) => typeof c.npsScore === "number")
    .slice(0, 24);
  const rows = reviewed.map((c, i) => ({
    id: `rev_${i}`,
    name: c.name,
    nps: c.npsScore!,
    source: i % 3 === 0 ? "Google" : i % 3 === 1 ? "Nextdoor" : "Yelp",
    blurb: blurbForNps(c.npsScore!, c.name.split(" ")[0]!),
    ts: c.lastVisit,
  }));
  return {
    title: "Reviews",
    subtitle: `Google + Yelp + Nextdoor unified. ${rows.length} new this month.`,
    kpis: [
      { label: "Avg. rating", value: "4.84", delta: "+0.07", trend: "up", spark: sparkFor(110, 14, 70, 100) },
      { label: "Reviews this month", value: "23", delta: "+8", trend: "up" },
      { label: "Response rate", value: "100%", delta: "founder reply", trend: "flat" },
      { label: "Promoters", value: "84%", delta: "+3 pts", trend: "up" },
    ],
    rows,
    columns: [
      { key: "name", header: "Customer", cell: (r: any) => (r as (typeof rows)[number]).name },
      { key: "src", header: "Source", cell: (r: any) => (r as (typeof rows)[number]).source, align: "center" },
      {
        key: "nps",
        header: "NPS",
        cell: (r: any) => (r as (typeof rows)[number]).nps,
        mono: true,
        align: "center",
      },
      { key: "blurb", header: "Excerpt", cell: (r: any) => (r as (typeof rows)[number]).blurb, className: "text-g-text-muted" },
      {
        key: "ts",
        header: "When",
        cell: (r: any) => relTime((r as (typeof rows)[number]).ts),
        align: "right",
        mono: true,
      },
    ] as unknown as Column<unknown>[],
  };
}

function referralsSpec(): EngineSpec {
  const { customers } = demoState();
  const r = rng(120);
  const rows = customers.slice(0, 16).map((c, i) => ({
    id: `ref_${i}`,
    referrer: c.name,
    referred: customers[(i + 100) % customers.length]!.name,
    status: pill(["Pending", "Booked", "Won", "Won", "Won"][r.int(0, 4)]!),
    payoutCents: r.int(2500, 12000),
    ts: c.joinedAt,
  }));
  return {
    title: "Referrals",
    subtitle: "Source attribution and payout tracking. 24 referrers active.",
    kpis: [
      { label: "Referrers active", value: "24", delta: "+5", trend: "up" },
      { label: "Won this month", value: "9", delta: "+4", trend: "up" },
      { label: "Avg. referrer LTV", value: "$3,860", delta: "+$210", trend: "up" },
      { label: "Payouts ytd", value: "$1,840", delta: "−$60", trend: "down" },
    ],
    rows,
    columns: [
      { key: "by", header: "Referrer", cell: (r: any) => (r as (typeof rows)[number]).referrer },
      { key: "to", header: "Referred", cell: (r: any) => (r as (typeof rows)[number]).referred },
      { key: "st", header: "Status", cell: (r: any) => (r as (typeof rows)[number]).status, align: "center" },
      {
        key: "p",
        header: "Payout",
        cell: (r: any) => money((r as (typeof rows)[number]).payoutCents),
        mono: true,
        align: "right",
      },
      {
        key: "ts",
        header: "Joined",
        cell: (r: any) => shortDate((r as (typeof rows)[number]).ts),
        align: "right",
        mono: true,
      },
    ] as unknown as Column<unknown>[],
  };
}

function campaignsSpec(): EngineSpec {
  const rows = [
    { id: "cmp_spring_clean", name: "Spring Clean-Up Outbound", channel: "SMS + Email", touches: 4, sent: 412, replied: 38, booked: 14 },
    { id: "cmp_aeration", name: "Fall Aeration Push", channel: "SMS", touches: 3, sent: 188, replied: 22, booked: 9 },
    { id: "cmp_lapsed_winback", name: "Lapsed Customer Win-Back", channel: "Voice + SMS", touches: 5, sent: 64, replied: 11, booked: 6 },
    { id: "cmp_neighbor", name: "Neighbor Of Active Customer", channel: "Postcard", touches: 1, sent: 1240, replied: 41, booked: 18 },
    { id: "cmp_storm_response", name: "Post-Storm Yard Cleanup", channel: "SMS", touches: 1, sent: 92, replied: 18, booked: 12 },
    { id: "cmp_referral_ask", name: "Referral Ask · Promoters Only", channel: "Email", touches: 2, sent: 84, replied: 14, booked: 7 },
    { id: "cmp_holiday_lights", name: "Holiday Lights Add-On", channel: "Email", touches: 2, sent: 240, replied: 21, booked: 12 },
    { id: "cmp_irrigation", name: "Irrigation Tune-Up · April", channel: "SMS", touches: 2, sent: 168, replied: 14, booked: 6 },
  ];
  return {
    title: "Campaigns",
    subtitle: "Outbound BDC sequences across SMS, email, voice, postcards.",
    kpis: [
      { label: "Active campaigns", value: "8", delta: "+2", trend: "up" },
      { label: "Reply rate", value: "11.4%", delta: "+1.6 pts", trend: "up" },
      { label: "Booked", value: "84", delta: "+22 vs last", trend: "up", spark: sparkFor(130) },
      { label: "Cost per booking", value: "$18.40", delta: "−$3.20", trend: "down" },
    ],
    rows,
    columns: [
      { key: "n", header: "Campaign", cell: (r: any) => (r as (typeof rows)[number]).name },
      { key: "ch", header: "Channel", cell: (r: any) => (r as (typeof rows)[number]).channel },
      {
        key: "sent",
        header: "Sent",
        cell: (r: any) => num((r as (typeof rows)[number]).sent),
        mono: true,
        align: "right",
      },
      {
        key: "rep",
        header: "Replied",
        cell: (r: any) => num((r as (typeof rows)[number]).replied),
        mono: true,
        align: "right",
      },
      {
        key: "bk",
        header: "Booked",
        cell: (r: any) => num((r as (typeof rows)[number]).booked),
        mono: true,
        align: "right",
      },
    ] as unknown as Column<unknown>[],
  };
}

function pricingSpec(): EngineSpec {
  return {
    title: "Pricing tables",
    subtitle: "Per-sqft service rates that feed the AI Quote Drafter.",
    kpis: [
      { label: "Service categories", value: String(SERVICE_RATES.length) },
      { label: "Avg. minimum charge", value: money(Math.round(SERVICE_RATES.reduce((s, r) => s + r.minCharge, 0) / SERVICE_RATES.length) * 100) },
      { label: "Highest rate / sqft", value: "$1.20", delta: "Mulch", trend: "flat" },
      { label: "Lowest rate / sqft", value: "$0.0042", delta: "Mowing", trend: "flat" },
    ],
    rows: SERVICE_RATES,
    columns: [
      { key: "n", header: "Service", cell: (r: any) => (r as (typeof SERVICE_RATES)[number]).name },
      { key: "cat", header: "Category", cell: (r: any) => (r as (typeof SERVICE_RATES)[number]).category, align: "center" },
      { key: "u", header: "Unit", cell: (r: any) => (r as (typeof SERVICE_RATES)[number]).unit, align: "center" },
      {
        key: "rate",
        header: "Rate",
        cell: (r: any) => `$${(r as (typeof SERVICE_RATES)[number]).rate}`,
        mono: true,
        align: "right",
      },
      {
        key: "min",
        header: "Min charge",
        cell: (r: any) => money((r as (typeof SERVICE_RATES)[number]).minCharge * 100),
        mono: true,
        align: "right",
      },
    ] as unknown as Column<unknown>[],
  };
}

function scheduleSpec(): EngineSpec {
  const { jobs, customers, crews } = demoState();
  const byId = new Map(customers.map((c) => [c.id, c.name] as const));
  const crewById = new Map(crews.map((c) => [c.id, c.name] as const));
  const upcoming = jobs
    .filter((j) => new Date(j.scheduledAt).getTime() >= Date.now() - 6 * 3600_000)
    .slice(0, 60);
  return {
    title: "Schedule",
    subtitle: "Week view, 6 crews. Drag-and-drop reschedule lands in Phase 3.",
    kpis: [
      { label: "Visits this week", value: num(upcoming.filter((j) => new Date(j.scheduledAt).getTime() < Date.now() + 7 * 86400_000).length), delta: "+8 vs avg", trend: "up" },
      { label: "Crews active", value: String(crews.length) },
      { label: "Avg. drive-time saved", value: "47 min", delta: "Auto-optimize", trend: "down" },
      { label: "Open slots", value: "11", delta: "fillable", trend: "flat" },
    ],
    rows: upcoming,
    columns: [
      {
        key: "ts",
        header: "When",
        cell: (j: any) =>
          `${shortDate((j as (typeof jobs)[number]).scheduledAt)} · ${timeOfDay((j as (typeof jobs)[number]).scheduledAt)}`,
        mono: true,
      },
      {
        key: "cust",
        header: "Customer",
        cell: (j: any) => byId.get((j as (typeof jobs)[number]).customerId) ?? "—",
      },
      { key: "svc", header: "Service", cell: (j: any) => (j as (typeof jobs)[number]).service },
      {
        key: "crew",
        header: "Crew",
        cell: (j: any) => crewById.get((j as (typeof jobs)[number]).crewId) ?? "—",
      },
      { key: "st", header: "Status", cell: (j: any) => (j as (typeof jobs)[number]).status, align: "center" },
    ] as unknown as Column<unknown>[],
  };
}

function jobsSpec(): EngineSpec {
  const { jobs, customers, crews } = demoState();
  const byId = new Map(customers.map((c) => [c.id, c.name] as const));
  const crewById = new Map(crews.map((c) => [c.id, c.name] as const));
  const today = jobs.filter((j) => isToday(j.scheduledAt));
  return {
    title: "Jobs",
    subtitle: "Today's job board. Live status across all crews.",
    kpis: [
      { label: "Visits today", value: num(today.length) },
      { label: "Complete", value: num(today.filter((j) => j.status === "Complete").length) },
      { label: "On site", value: num(today.filter((j) => j.status === "OnSite").length) },
      { label: "Skipped", value: num(today.filter((j) => j.status === "Skipped").length) },
    ],
    rows: today,
    columns: [
      {
        key: "ts",
        header: "Time",
        cell: (j: any) => timeOfDay((j as (typeof jobs)[number]).scheduledAt),
        mono: true,
      },
      { key: "cust", header: "Customer", cell: (j: any) => byId.get((j as (typeof jobs)[number]).customerId) ?? "—" },
      { key: "svc", header: "Service", cell: (j: any) => (j as (typeof jobs)[number]).service },
      { key: "crew", header: "Crew", cell: (j: any) => crewById.get((j as (typeof jobs)[number]).crewId) ?? "—" },
      { key: "st", header: "Status", cell: (j: any) => (j as (typeof jobs)[number]).status, align: "center" },
      {
        key: "p",
        header: "Price",
        cell: (j: any) => money((j as (typeof jobs)[number]).priceCents),
        mono: true,
        align: "right",
      },
    ] as unknown as Column<unknown>[],
  };
}

function routesSpec(): EngineSpec {
  const { customers } = demoState();
  const groups = new Map<string, number>();
  customers.forEach((c) => groups.set(c.routeId, (groups.get(c.routeId) || 0) + 1));
  const rows = Array.from(groups.entries()).map(([id, count]) => ({
    id,
    customers: count,
    miles: 28 + Math.round((count % 11) * 1.6),
    durationMin: 220 + (count * 3) % 80,
    fuelCents: (28 + (count % 11)) * 240,
    revenueDensity: 1700 + (count * 12) % 600,
  }));
  return {
    title: "Routes",
    subtitle: "Optimization & revenue density. Auto-balance lands in Phase 3.",
    kpis: [
      { label: "Active routes", value: String(rows.length) },
      { label: "Avg. miles / day", value: String(Math.round(rows.reduce((s, r) => s + r.miles, 0) / rows.length)) },
      { label: "Revenue / mile", value: "$112", delta: "+$14", trend: "up" },
      { label: "Fuel / week", value: money(rows.reduce((s, r) => s + r.fuelCents, 0)), trend: "down" },
    ],
    rows,
    columns: [
      { key: "id", header: "Route", cell: (r: any) => (r as (typeof rows)[number]).id, mono: true },
      {
        key: "c",
        header: "Customers",
        cell: (r: any) => num((r as (typeof rows)[number]).customers),
        mono: true,
        align: "right",
      },
      {
        key: "m",
        header: "Miles",
        cell: (r: any) => num((r as (typeof rows)[number]).miles),
        mono: true,
        align: "right",
      },
      {
        key: "d",
        header: "Duration",
        cell: (r: any) => `${(r as (typeof rows)[number]).durationMin}m`,
        mono: true,
        align: "right",
      },
      {
        key: "f",
        header: "Fuel",
        cell: (r: any) => money((r as (typeof rows)[number]).fuelCents),
        mono: true,
        align: "right",
      },
      {
        key: "rd",
        header: "$/mile",
        cell: (r: any) => money((r as (typeof rows)[number]).revenueDensity),
        mono: true,
        align: "right",
      },
    ] as unknown as Column<unknown>[],
  };
}

function territorySpec(): EngineSpec {
  const { customers } = demoState();
  const groups = new Map<string, { count: number; ltv: number }>();
  customers.forEach((c) => {
    const g = groups.get(c.zip) || { count: 0, ltv: 0 };
    groups.set(c.zip, { count: g.count + 1, ltv: g.ltv + c.ltvCents });
  });
  const rows = Array.from(groups.entries()).map(([zip, g]) => ({
    zip,
    count: g.count,
    ltv: g.ltv,
    avg: Math.round(g.ltv / g.count),
  }));
  return {
    title: "Territory",
    subtitle: "Zip-level coverage and customer density.",
    kpis: [
      { label: "ZIP codes covered", value: String(rows.length) },
      { label: "Densest ZIP", value: rows[0]?.zip || "—", delta: `${rows[0]?.count ?? 0} customers`, trend: "flat" },
      { label: "Avg. customers / ZIP", value: String(Math.round(customers.length / rows.length)) },
      { label: "ZIP w/ highest LTV", value: rows.sort((a, b) => b.avg - a.avg)[0]?.zip ?? "—", trend: "up" },
    ],
    rows,
    columns: [
      { key: "z", header: "ZIP", cell: (r: any) => (r as (typeof rows)[number]).zip, mono: true },
      {
        key: "c",
        header: "Customers",
        cell: (r: any) => num((r as (typeof rows)[number]).count),
        mono: true,
        align: "right",
      },
      {
        key: "ltv",
        header: "LTV total",
        cell: (r: any) => money((r as (typeof rows)[number]).ltv),
        mono: true,
        align: "right",
      },
      {
        key: "avg",
        header: "Avg LTV",
        cell: (r: any) => money((r as (typeof rows)[number]).avg),
        mono: true,
        align: "right",
      },
    ] as unknown as Column<unknown>[],
  };
}

function crewSpec(): EngineSpec {
  const { crews, jobs } = demoState();
  const rows = crews.map((c) => {
    const cjobs = jobs.filter((j) => j.crewId === c.id && j.status === "Complete");
    const revenue = cjobs.reduce((s, j) => s + j.priceCents, 0);
    return {
      id: c.id,
      name: c.name,
      members: c.members.length,
      plate: c.vehiclePlate,
      jobsTotal: cjobs.length,
      revenueCents: revenue,
    };
  });
  return {
    title: "Crew",
    subtitle: "Roster, vehicle plates, per-crew performance.",
    kpis: [
      { label: "Crews", value: String(crews.length) },
      { label: "Techs total", value: String(crews.reduce((s, c) => s + c.members.length, 0)) },
      { label: "Revenue / crew · ytd", value: money(Math.round(rows.reduce((s, r) => s + r.revenueCents, 0) / rows.length)) },
      { label: "Best on-time rate", value: "98.4%", delta: "Bayshore", trend: "up" },
    ],
    rows,
    columns: [
      { key: "n", header: "Crew", cell: (r: any) => (r as (typeof rows)[number]).name },
      { key: "m", header: "Members", cell: (r: any) => num((r as (typeof rows)[number]).members), mono: true, align: "right" },
      { key: "p", header: "Vehicle", cell: (r: any) => (r as (typeof rows)[number]).plate, mono: true },
      { key: "j", header: "Jobs · ytd", cell: (r: any) => num((r as (typeof rows)[number]).jobsTotal), mono: true, align: "right" },
      { key: "rev", header: "Revenue", cell: (r: any) => money((r as (typeof rows)[number]).revenueCents), mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function equipmentSpec(): EngineSpec {
  const rows = [
    { id: "EQ-001", name: "Toro Z-Master 2000", type: "Mower", crew: "Riverside North", hours: 1284, fuelGal: 412, nextSvc: "+38h" },
    { id: "EQ-002", name: "Toro Z-Master 2000", type: "Mower", crew: "Westshore", hours: 921, fuelGal: 298, nextSvc: "+71h" },
    { id: "EQ-003", name: "Stihl FS131R", type: "Trimmer", crew: "Ballast Point", hours: 442, fuelGal: 28, nextSvc: "+12h" },
    { id: "EQ-004", name: "Echo PB-9010T", type: "Backpack Blower", crew: "Hyde Park", hours: 612, fuelGal: 41, nextSvc: "+8h" },
    { id: "EQ-005", name: "Husqvarna 460 Rancher", type: "Chainsaw", crew: "Bayshore", hours: 88, fuelGal: 3.2, nextSvc: "+92h" },
    { id: "EQ-006", name: "Ford F-250", type: "Truck", crew: "Tampa East", hours: 4220, fuelGal: 1880, nextSvc: "+1140mi" },
    { id: "EQ-007", name: "Big Tex 16ft Trailer", type: "Trailer", crew: "Riverside North", hours: 0, fuelGal: 0, nextSvc: "Annual reg." },
    { id: "EQ-008", name: "Honda WB30 Pump", type: "Water Pump", crew: "Bayshore", hours: 28, fuelGal: 6, nextSvc: "−12h overdue" },
  ];
  return {
    title: "Equipment",
    subtitle: "Fleet, fuel, maintenance.",
    kpis: [
      { label: "Active assets", value: String(rows.length) },
      { label: "Hours · this week", value: "412" },
      { label: "Fuel · this week", value: "$842", trend: "down" },
      { label: "Overdue service", value: "1", delta: "Honda WB30", trend: "up" },
    ],
    rows,
    columns: [
      { key: "id", header: "ID", cell: (r: any) => (r as (typeof rows)[number]).id, mono: true },
      { key: "n", header: "Asset", cell: (r: any) => (r as (typeof rows)[number]).name },
      { key: "t", header: "Type", cell: (r: any) => (r as (typeof rows)[number]).type, align: "center" },
      { key: "c", header: "Crew", cell: (r: any) => (r as (typeof rows)[number]).crew },
      { key: "h", header: "Hours", cell: (r: any) => num((r as (typeof rows)[number]).hours), mono: true, align: "right" },
      { key: "ns", header: "Next service", cell: (r: any) => (r as (typeof rows)[number]).nextSvc, mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function chemicalsSpec(): EngineSpec {
  const rows = [
    { id: "CH-001", name: "Lesco 24-0-11 Pre-emerge", category: "Herbicide", lotNo: "L4422", appliedToday: 1280, mUnit: "lbs", lastApp: "2026-04-22" },
    { id: "CH-002", name: "Roundup Pro Concentrate", category: "Herbicide", lotNo: "R8841", appliedToday: 14, mUnit: "oz", lastApp: "2026-04-29" },
    { id: "CH-003", name: "Bifenthrin 7.9% EC", category: "Insecticide", lotNo: "B2034", appliedToday: 22, mUnit: "oz", lastApp: "2026-04-28" },
    { id: "CH-004", name: "Iron HMA 6%", category: "Foliar", lotNo: "IH-617", appliedToday: 8, mUnit: "gal", lastApp: "2026-04-24" },
    { id: "CH-005", name: "Spreader-Sticker", category: "Adjuvant", lotNo: "SS-8810", appliedToday: 4, mUnit: "oz", lastApp: "2026-04-29" },
    { id: "CH-006", name: "MSMA 6.6", category: "Herbicide", lotNo: "M210", appliedToday: 0, mUnit: "—", lastApp: "2026-04-12" },
    { id: "CH-007", name: "Tenacity 4SC", category: "Herbicide", lotNo: "T-117", appliedToday: 6, mUnit: "oz", lastApp: "2026-04-26" },
    { id: "CH-008", name: "Imidacloprid 75 WSP", category: "Insecticide", lotNo: "I-22B", appliedToday: 2, mUnit: "oz", lastApp: "2026-04-23" },
  ];
  return {
    title: "Chemicals",
    subtitle: "Applications, MSDS, regulatory log.",
    kpis: [
      { label: "Active SKUs", value: String(rows.length) },
      { label: "Applied today", value: "8", delta: "12 customers", trend: "flat" },
      { label: "MSDS up to date", value: "100%", trend: "flat" },
      { label: "Regulatory inspections passed", value: "3 / 3", trend: "up" },
    ],
    rows,
    columns: [
      { key: "id", header: "ID", cell: (r: any) => (r as (typeof rows)[number]).id, mono: true },
      { key: "n", header: "Product", cell: (r: any) => (r as (typeof rows)[number]).name },
      { key: "c", header: "Category", cell: (r: any) => (r as (typeof rows)[number]).category, align: "center" },
      { key: "l", header: "Lot", cell: (r: any) => (r as (typeof rows)[number]).lotNo, mono: true },
      { key: "a", header: "Applied today", cell: (r: any) => `${(r as (typeof rows)[number]).appliedToday} ${(r as (typeof rows)[number]).mUnit}`, mono: true, align: "right" },
      { key: "ts", header: "Last applied", cell: (r: any) => (r as (typeof rows)[number]).lastApp, mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function invoicesSpec(): EngineSpec {
  const { invoices, customers } = demoState();
  const byId = new Map(customers.map((c) => [c.id, c.name] as const));
  const rows = invoices.slice(0, 60);
  const overdue = invoices.filter((i) => i.status === "Overdue");
  const ar30 = overdue.reduce((s, i) => s + i.amountCents, 0);
  const paidThisMonth = invoices
    .filter(
      (i) =>
        i.status === "Paid" &&
        i.paidAt &&
        new Date(i.paidAt).getMonth() === new Date().getMonth(),
    )
    .reduce((s, i) => s + i.amountCents, 0);

  return {
    title: "Invoices",
    subtitle: "List + AR aging. Resend reminders one-click.",
    kpis: [
      { label: "Paid · this month", value: money(paidThisMonth), delta: "+18.2%", trend: "up", spark: sparkFor(140, 14, 50, 110) },
      { label: "Outstanding", value: money(invoices.filter((i) => i.status === "Sent").reduce((s, i) => s + i.amountCents, 0)) },
      { label: "AR · 30+ days", value: money(ar30), delta: `${overdue.length} invoices`, trend: "down" },
      { label: "Days to pay (avg)", value: "8.4", delta: "−1.2", trend: "down" },
    ],
    rows,
    columns: [
      { key: "id", header: "Invoice", cell: (i: any) => (i as (typeof rows)[number]).id, mono: true },
      { key: "c", header: "Customer", cell: (i: any) => byId.get((i as (typeof rows)[number]).customerId) ?? "—" },
      { key: "amt", header: "Amount", cell: (i: any) => money((i as (typeof rows)[number]).amountCents), mono: true, align: "right" },
      { key: "st", header: "Status", cell: (i: any) => (i as (typeof rows)[number]).status, align: "center" },
      { key: "is", header: "Issued", cell: (i: any) => shortDate((i as (typeof rows)[number]).issuedAt), mono: true, align: "right" },
      { key: "due", header: "Due", cell: (i: any) => shortDate((i as (typeof rows)[number]).dueAt), mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function timesheetsSpec(): EngineSpec {
  const { crews } = demoState();
  const r = rng(150);
  const rows = crews.flatMap((c) =>
    c.members.map((m, i) => ({
      id: `${c.id}_${i}`,
      crew: c.name,
      tech: m.name,
      role: m.role,
      hoursWeek: r.float(28, 44).toFixed(1),
      otHours: r.float(0, 4).toFixed(1),
      stops: r.int(40, 86),
    })),
  );
  return {
    title: "Timesheets",
    subtitle: "Hours by employee, with overtime flags.",
    kpis: [
      { label: "Techs", value: String(rows.length) },
      { label: "Hours this week", value: rows.reduce((s, r) => s + Number(r.hoursWeek), 0).toFixed(1) },
      { label: "OT hours", value: rows.reduce((s, r) => s + Number(r.otHours), 0).toFixed(1), trend: "down" },
      { label: "Avg stops / tech", value: String(Math.round(rows.reduce((s, r) => s + r.stops, 0) / rows.length)) },
    ],
    rows,
    columns: [
      { key: "tech", header: "Tech", cell: (r: any) => (r as (typeof rows)[number]).tech },
      { key: "crew", header: "Crew", cell: (r: any) => (r as (typeof rows)[number]).crew },
      { key: "role", header: "Role", cell: (r: any) => (r as (typeof rows)[number]).role, align: "center" },
      { key: "h", header: "Hours · wk", cell: (r: any) => (r as (typeof rows)[number]).hoursWeek, mono: true, align: "right" },
      { key: "ot", header: "OT", cell: (r: any) => (r as (typeof rows)[number]).otHours, mono: true, align: "right" },
      { key: "s", header: "Stops", cell: (r: any) => num((r as (typeof rows)[number]).stops), mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function payrollSpec(): EngineSpec {
  const { crews } = demoState();
  const r = rng(160);
  const rows = crews.flatMap((c) =>
    c.members.map((m, i) => {
      const hourly = m.role === "Lead" ? r.float(28, 32) : r.float(20, 24);
      const hours = r.float(34, 44);
      const ot = r.float(0, 4);
      const gross = hourly * hours + hourly * 1.5 * ot;
      return {
        id: `${c.id}_${i}`,
        tech: m.name,
        rate: hourly,
        hours,
        ot,
        gross: Math.round(gross * 100),
      };
    }),
  );
  const grossTotal = rows.reduce((s, r) => s + r.gross, 0);
  return {
    title: "Payroll",
    subtitle: "Weekly run preview. Exports to Gusto, ADP, Paychex.",
    kpis: [
      { label: "Gross · this week", value: money(grossTotal) },
      { label: "Techs", value: String(rows.length) },
      { label: "OT % of hours", value: pct((rows.reduce((s, r) => s + r.ot, 0) / rows.reduce((s, r) => s + r.hours, 0)) * 100, 1) },
      { label: "Run unblocked", value: "Yes", delta: "Friday 12:00", trend: "flat" },
    ],
    rows,
    columns: [
      { key: "n", header: "Tech", cell: (r: any) => (r as (typeof rows)[number]).tech },
      { key: "rate", header: "Rate", cell: (r: any) => `$${(r as (typeof rows)[number]).rate.toFixed(2)}/hr`, mono: true, align: "right" },
      { key: "h", header: "Hours", cell: (r: any) => (r as (typeof rows)[number]).hours.toFixed(1), mono: true, align: "right" },
      { key: "ot", header: "OT", cell: (r: any) => (r as (typeof rows)[number]).ot.toFixed(1), mono: true, align: "right" },
      { key: "g", header: "Gross", cell: (r: any) => money((r as (typeof rows)[number]).gross), mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function inboxSpec(): EngineSpec {
  const { messages, customers } = demoState();
  const byId = new Map(customers.map((c) => [c.id, c.name] as const));
  const rows = messages.slice(0, 30);
  return {
    title: "Inbox",
    subtitle: "Unified SMS · email · voice transcripts · portal.",
    kpis: [
      { label: "Unread", value: String(messages.filter((m) => !m.read && m.direction === "in").length), delta: "+4 today", trend: "up" },
      { label: "Avg. response", value: "1m 12s", delta: "−18s", trend: "down" },
      { label: "SMS this week", value: String(messages.filter((m) => m.channel === "sms").slice(0, 60).length) },
      { label: "Voice this week", value: String(messages.filter((m) => m.channel === "voice").slice(0, 60).length) },
    ],
    rows,
    columns: [
      {
        key: "ts",
        header: "When",
        cell: (m: any) => relTime((m as (typeof rows)[number]).ts),
        mono: true,
      },
      { key: "ch", header: "Channel", cell: (m: any) => (m as (typeof rows)[number]).channel.toUpperCase(), align: "center" },
      { key: "dir", header: "Dir", cell: (m: any) => ((m as (typeof rows)[number]).direction === "in" ? "→" : "←"), align: "center" },
      { key: "c", header: "Customer", cell: (m: any) => byId.get((m as (typeof rows)[number]).customerId) ?? "—" },
      {
        key: "body",
        header: "Body",
        cell: (m: any) => (m as (typeof rows)[number]).body,
        className: "text-g-text-muted truncate max-w-[420px]",
      },
    ] as unknown as Column<unknown>[],
  };
}

function reportsSpec(): EngineSpec {
  return {
    title: "Reports",
    subtitle: "5 tabs: Revenue · Margin · Churn · NPS · Routes.",
    kpis: [
      { label: "Revenue · TTM", value: "$1,408,290", delta: "+22.4%", trend: "up", spark: sparkFor(170, 14, 70, 130) },
      { label: "Gross margin", value: "48.6%", delta: "+2.1 pts", trend: "up" },
      { label: "Churn · 12mo", value: "5.8%", delta: "−1.2 pts", trend: "down" },
      { label: "NPS", value: "72", delta: "+8", trend: "up" },
    ],
    rows: [
      { tab: "Revenue", kpi: "$1.4M TTM", note: "Up 22.4% YoY. Q1 was the highest gross-margin quarter on record." },
      { tab: "Margin", kpi: "48.6%", note: "Bayshore + Westshore are pulling 51%+. Tampa East drags at 39% — labor utilization issue." },
      { tab: "Churn", kpi: "5.8%", note: "Down 1.2pts after Save Play rollout. Most churn is move-outs (uncontrollable)." },
      { tab: "NPS", kpi: "72", note: "+8 vs Q1. Highest at Bayshore (84). Opportunity at Tampa East (61)." },
      { tab: "Routes", kpi: "47 min/day saved", note: "Auto-optimize trims roughly 4.7 hours/week across 6 crews. Worth $612 in fuel + labor." },
      { tab: "Cohorts", kpi: "Mar '25 cohort", note: "21-month median LTV $4,820 — best on record." },
      { tab: "Top customers", kpi: "$48,400", note: "Riverside Plaza HOA is the largest single account. 14 properties." },
      { tab: "Risk", kpi: "12 at risk", note: "Save Play queued for: Beaumont House, Hampton Pools, Tom Lyons, Maria Quintana, +8 more." },
    ],
    columns: [
      { key: "t", header: "Tab", cell: (r: any) => (r as { tab: string }).tab },
      { key: "k", header: "Headline", cell: (r: any) => (r as { kpi: string }).kpi, mono: true },
      { key: "n", header: "Note", cell: (r: any) => (r as { note: string }).note, className: "text-g-text-muted" },
    ] as unknown as Column<unknown>[],
  };
}

function analyticsSpec(): EngineSpec {
  return {
    title: "Analytics",
    subtitle: "Funnel, cohort, LTV.",
    kpis: [
      { label: "Quote → Won", value: "37%", delta: "+4 pts", trend: "up" },
      { label: "Avg. LTV", value: "$3,860", delta: "+$320", trend: "up" },
      { label: "Payback", value: "4.1 mo", delta: "−0.6", trend: "down" },
      { label: "Active cohort retention", value: "89%", delta: "12 mo", trend: "up" },
    ],
    rows: [
      { metric: "Quotes sent", value: "412", delta: "+22%" },
      { metric: "Quotes viewed", value: "298", delta: "+19%" },
      { metric: "Quotes won", value: "153", delta: "+24%" },
      { metric: "Avg. quote size", value: "$1,840", delta: "+$130" },
      { metric: "Quote → won (median days)", value: "3.4", delta: "−0.8" },
      { metric: "Cancellation rate", value: "5.8%", delta: "−1.2 pts" },
      { metric: "Upsell rate (per customer)", value: "1.6×", delta: "+0.2×" },
      { metric: "Referral conversion", value: "44%", delta: "+6 pts" },
    ],
    columns: [
      { key: "m", header: "Metric", cell: (r: any) => (r as { metric: string }).metric },
      { key: "v", header: "Value", cell: (r: any) => (r as { value: string }).value, mono: true, align: "right" },
      { key: "d", header: "Delta", cell: (r: any) => (r as { delta: string }).delta, mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function automationsSpec(): EngineSpec {
  const rows = [
    { id: "auto_quote_intercept", name: "Quote Intercept · Voicemail", trigger: "Inbound voicemail", action: "AI returns call in <60s", runs: 84, conv: "31%" },
    { id: "auto_instant_text", name: "InstantText · Web form", trigger: "Form submit", action: "AI replies < 60s with availability", runs: 312, conv: "44%" },
    { id: "auto_ghost_recovery", name: "Ghost Recovery · Day 7", trigger: "Quote not viewed 7d", action: "Send personalized re-pitch", runs: 47, conv: "21%" },
    { id: "auto_save_play", name: "Save Play · At-risk", trigger: "Reply latency 2× baseline", action: "Schedule founder call", runs: 12, conv: "67%" },
    { id: "auto_weather_pivot", name: "Weather Pivot", trigger: "NOAA 60%+ rain", action: "Reshuffle routes, text customers", runs: 9, conv: "—" },
    { id: "auto_review_blast", name: "Review Ask · Promoters", trigger: "Job complete + NPS≥8", action: "Send Google + Nextdoor link", runs: 88, conv: "32%" },
    { id: "auto_invoice_followup", name: "Invoice Reminder · D+7", trigger: "Invoice unpaid 7d", action: "SMS + email reminder", runs: 41, conv: "62%" },
    { id: "auto_referral_ask", name: "Referral Ask · Won quote", trigger: "Quote signed", action: "Ask for 1 neighbor", runs: 68, conv: "18%" },
  ];
  return {
    title: "Automations",
    subtitle: "Workflow builder. 8 live, 3 paused.",
    kpis: [
      { label: "Live workflows", value: String(rows.length) },
      { label: "Total runs · 30d", value: num(rows.reduce((s, r) => s + r.runs, 0)) },
      { label: "Avg. conversion", value: "32%", delta: "+4 pts", trend: "up" },
      { label: "Engines firing", value: "33 / 33", trend: "flat" },
    ],
    rows,
    columns: [
      { key: "n", header: "Workflow", cell: (r: any) => (r as (typeof rows)[number]).name },
      { key: "t", header: "Trigger", cell: (r: any) => (r as (typeof rows)[number]).trigger, className: "text-g-text-muted" },
      { key: "a", header: "Action", cell: (r: any) => (r as (typeof rows)[number]).action, className: "text-g-text-muted" },
      { key: "r", header: "Runs", cell: (r: any) => num((r as (typeof rows)[number]).runs), mono: true, align: "right" },
      { key: "c", header: "Conv.", cell: (r: any) => (r as (typeof rows)[number]).conv, mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function askGladiusSpec(): EngineSpec {
  return {
    title: "Ask Gladius",
    subtitle:
      "Natural-language ops queries. Chat panel wires to Anthropic streaming in Phase 4 — sample answers below.",
    kpis: [
      { label: "Questions · 30d", value: "412", delta: "+88", trend: "up" },
      { label: "Answers w/ data", value: "98.4%", trend: "up" },
      { label: "Median latency", value: "1.4s" },
      { label: "Saved · ops time", value: "6.2 hrs / wk", trend: "up" },
    ],
    rows: [
      { id: 1, q: "Show me overdue invoices", a: "12 invoices, $8,940 total. Largest: Beaumont House $1,210." },
      { id: 2, q: "Which customers are at risk this week?", a: "5 flagged by Save Play. Top: Hampton Pools HOA, $8.4K LTV at risk." },
      { id: 3, q: "Best route by revenue density", a: "Bayshore — $182/mile. North is 21% lower." },
      { id: 4, q: "What's our churn last 12 months?", a: "5.8%, down 1.2pts after Save Play. Mostly move-outs." },
      { id: 5, q: "Reschedule Friday — 60% rain forecast", a: "Reshuffled 18 visits to Saturday. Texted all 18 customers — 0 complaint replies." },
      { id: 6, q: "Top 5 promoters this month", a: "Henderson, Patel, O'Brien, Goldberg, Quintana — all NPS 9+." },
      { id: 7, q: "Pipeline by tier", a: "Pro $87K · Enterprise $54K · Independent $7.2K." },
      { id: 8, q: "Which crew has best on-time rate", a: "Bayshore — 98.4%. Tampa East lags at 91%." },
    ],
    columns: [
      { key: "q", header: "Question", cell: (r: any) => (r as { q: string }).q },
      { key: "a", header: "Answer", cell: (r: any) => (r as { a: string }).a, className: "text-g-text-muted" },
    ] as unknown as Column<unknown>[],
  };
}

function integrationsSpec(): EngineSpec {
  const rows = [
    { name: "QuickBooks", category: "Accounting", status: "Connected", lastSync: "12 min ago" },
    { name: "Stripe", category: "Payments", status: "Connected", lastSync: "2 min ago" },
    { name: "Resend", category: "Email", status: "Connected", lastSync: "5 min ago" },
    { name: "Twilio", category: "SMS / Voice", status: "Connected", lastSync: "Live" },
    { name: "Mapbox", category: "Maps / Satellite", status: "Connected", lastSync: "Live" },
    { name: "Google Reviews", category: "Reviews", status: "Connected", lastSync: "1 hr ago" },
    { name: "Nextdoor", category: "Reviews", status: "Connected", lastSync: "3 hr ago" },
    { name: "Zapier", category: "Automation", status: "Available", lastSync: "—" },
    { name: "Slack", category: "Notifications", status: "Available", lastSync: "—" },
    { name: "Plaid", category: "ACH", status: "Connected", lastSync: "12 hr ago" },
  ];
  return {
    title: "Integrations",
    subtitle: "Connector tiles. One-click OAuth where supported.",
    kpis: [
      { label: "Connected", value: String(rows.filter((r) => r.status === "Connected").length) },
      { label: "Available", value: String(rows.filter((r) => r.status === "Available").length) },
      { label: "Sync errors · 24h", value: "0", trend: "flat" },
      { label: "Webhooks delivered · 24h", value: "1,284", trend: "up" },
    ],
    rows,
    columns: [
      { key: "n", header: "Integration", cell: (r: any) => (r as (typeof rows)[number]).name },
      { key: "c", header: "Category", cell: (r: any) => (r as (typeof rows)[number]).category, className: "text-g-text-muted" },
      { key: "s", header: "Status", cell: (r: any) => (r as (typeof rows)[number]).status, align: "center" },
      { key: "ls", header: "Last sync", cell: (r: any) => (r as (typeof rows)[number]).lastSync, mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function apiSpec(): EngineSpec {
  const rows = [
    { id: "key_live_*****a92", label: "Production · Cypress Lawn", scope: "read+write", created: "2026-01-12", lastUsed: "3m ago" },
    { id: "key_live_*****1bc", label: "QuickBooks Sync", scope: "read+write", created: "2025-09-30", lastUsed: "12m ago" },
    { id: "key_live_*****d44", label: "Mapbox Tile Cache", scope: "read", created: "2025-08-04", lastUsed: "2hr ago" },
    { id: "key_test_*****eef", label: "Test · Joshua's machine", scope: "read", created: "2026-04-22", lastUsed: "1d ago" },
    { id: "wh_evt_invoice_paid", label: "Webhook · invoice.paid", scope: "POST → /hooks/qb", created: "2025-09-14", lastUsed: "8m ago" },
    { id: "wh_evt_quote_signed", label: "Webhook · quote.signed", scope: "POST → /hooks/qb", created: "2025-10-01", lastUsed: "1hr ago" },
    { id: "wh_evt_job_done", label: "Webhook · job.completed", scope: "POST → /hooks/portal", created: "2025-10-12", lastUsed: "12m ago" },
    { id: "wh_evt_review_received", label: "Webhook · review.received", scope: "POST → /hooks/slack", created: "2026-02-22", lastUsed: "2hr ago" },
  ];
  return {
    title: "API",
    subtitle: "Keys + webhooks. Read-only in demo.",
    kpis: [
      { label: "Active keys", value: String(rows.filter((r) => r.id.startsWith("key_")).length) },
      { label: "Active webhooks", value: String(rows.filter((r) => r.id.startsWith("wh_")).length) },
      { label: "Requests · 24h", value: "12,842" },
      { label: "Errors · 24h", value: "0", trend: "flat" },
    ],
    rows,
    columns: [
      { key: "id", header: "ID", cell: (r: any) => (r as (typeof rows)[number]).id, mono: true },
      { key: "l", header: "Label", cell: (r: any) => (r as (typeof rows)[number]).label },
      { key: "s", header: "Scope", cell: (r: any) => (r as (typeof rows)[number]).scope, mono: true },
      { key: "c", header: "Created", cell: (r: any) => (r as (typeof rows)[number]).created, mono: true, align: "right" },
      { key: "u", header: "Last used", cell: (r: any) => (r as (typeof rows)[number]).lastUsed, mono: true, align: "right" },
    ] as unknown as Column<unknown>[],
  };
}

function changelogSpec(): EngineSpec {
  const rows = [
    { date: "2026-04-29", who: "—RG", title: "Hybrid SaaS shipped — /app demo CRM + War Room behind real auth.", body: "One codebase, two products, shared component library. Phase 1 + 2 of the master build prompt." },
    { date: "2026-04-22", who: "—RG", title: "Slot collision prevention with DST correctness.", body: "ServiceTitan still doesn't have this. Fixed in a weekend." },
    { date: "2026-04-18", who: "—JY", title: "Per-founder 2FA via TOTP.", body: "Replaces the shared admin cookie. Magic link + 6-digit code." },
    { date: "2026-04-12", who: "—RG", title: "Save Play · founder-call automation.", body: "Auto-flag at-risk customers based on reply latency + invoice slippage." },
    { date: "2026-03-30", who: "—RG", title: "Ask Gladius rolled out internally.", body: "Natural-language queries over real Supabase data. Founders only for now." },
    { date: "2026-03-12", who: "—JY", title: "AI Quote Drafter — bundled, not bolted-on.", body: "Service Autopilot bolts on Deep Lawn for $499/mo extra. We bundled it." },
    { date: "2026-02-22", who: "—RG", title: "Outbound voice via Twilio with AI transcription.", body: "Quote Intercept sub-60s callback wired end to end." },
    { date: "2026-02-08", who: "—JY", title: "Settings → Billing now shows what you replaced.", body: "Crossed-out logos for RealGreen, Hatch, SiteRecon, OptimoRoute. Total saved $1,799/mo." },
    { date: "2026-01-22", who: "—RG", title: "GladiusBDC live — 60-second AI callback.", body: "Plugs into any tier. $499/mo add-on." },
    { date: "2026-01-04", who: "—JY", title: "Cmd-K spine across the app.", body: "Every action reachable in one keystroke. <120ms open." },
    { date: "2025-12-12", who: "—RG", title: "Routes engine — auto-optimize.", body: "Saves average 47 min/day across 6 crews. $34/day in fuel." },
    { date: "2025-12-01", who: "—RG", title: "Founding cohort live — 12 crews.", body: "Day-one heroes. 0 churned in 90 days. $1.4M+ recovered in pilot." },
  ];
  return {
    title: "Changelog",
    subtitle: "Public-style ship log. Dated, signed by Ricardo or Joshua.",
    kpis: [
      { label: "Ships · 90 days", value: String(rows.length) },
      { label: "Median PRs / week", value: "8.2" },
      { label: "Engines live", value: "33 / 33", trend: "up" },
      { label: "Days since last ship", value: "0", trend: "flat" },
    ],
    rows,
    columns: [
      { key: "d", header: "Date", cell: (r: any) => (r as (typeof rows)[number]).date, mono: true },
      { key: "t", header: "Title", cell: (r: any) => (r as (typeof rows)[number]).title },
      { key: "b", header: "Detail", cell: (r: any) => (r as (typeof rows)[number]).body, className: "text-g-text-muted truncate max-w-[420px]" },
      { key: "w", header: "By", cell: (r: any) => (r as (typeof rows)[number]).who, align: "center" },
    ] as unknown as Column<unknown>[],
  };
}

function settingsSpec(): EngineSpec {
  return {
    title: "Settings",
    subtitle: "Company · Team · Billing.",
    kpis: [
      { label: "Plan", value: "Professional", delta: "$997 / yr", trend: "flat" },
      { label: "Seats", value: "12", delta: "Unlimited", trend: "flat" },
      { label: "Replaced tools", value: "5", delta: "−$1,799/mo", trend: "down" },
      { label: "Last bill", value: "Apr 12", delta: "Paid", trend: "flat" },
    ],
    rows: [
      { tab: "Company", item: "Cypress Lawn & Landscape", value: "Tampa, FL · 6 crews · 247 customers" },
      { tab: "Company", item: "Brand colors", value: "Forest green + champagne" },
      { tab: "Company", item: "Service area radius", value: "30 mi from 33606" },
      { tab: "Team", item: "Marcus Cypress", value: "Owner · admin@gladiuscrm.com" },
      { tab: "Team", item: "Joshua Pyorke", value: "Sales · joshua@cypresslawn.com" },
      { tab: "Team", item: "All techs (12)", value: "Read-only access" },
      { tab: "Billing", item: "Plan", value: "Professional · $997/yr · annual prepay" },
      { tab: "Billing", item: "What you replaced", value: "RealGreen $1,200/mo · Hatch $1,200/mo · SiteRecon $200/mo · OptimoRoute $150/mo · CRM $249/mo" },
      { tab: "Billing", item: "Saved this month", value: "$1,799" },
      { tab: "Billing", item: "Next bill", value: "May 12, 2026" },
    ],
    columns: [
      { key: "t", header: "Tab", cell: (r: any) => (r as { tab: string }).tab, align: "center" },
      { key: "i", header: "Item", cell: (r: any) => (r as { item: string }).item },
      { key: "v", header: "Value", cell: (r: any) => (r as { value: string }).value, className: "text-g-text-muted" },
    ] as unknown as Column<unknown>[],
  };
}

// ---- registry ----

const SPECS: Record<string, () => EngineSpec> = {
  customers: customersSpec,
  quotes: quotesSpec,
  "quotes/new": quotesNewSpec,
  reviews: reviewsSpec,
  referrals: referralsSpec,
  campaigns: campaignsSpec,
  pricing: pricingSpec,
  schedule: scheduleSpec,
  jobs: jobsSpec,
  routes: routesSpec,
  territory: territorySpec,
  crew: crewSpec,
  equipment: equipmentSpec,
  chemicals: chemicalsSpec,
  invoices: invoicesSpec,
  timesheets: timesheetsSpec,
  payroll: payrollSpec,
  inbox: inboxSpec,
  reports: reportsSpec,
  analytics: analyticsSpec,
  automations: automationsSpec,
  "ask-gladius": askGladiusSpec,
  integrations: integrationsSpec,
  api: apiSpec,
  changelog: changelogSpec,
  settings: settingsSpec,
};

export function specFor(slug: string): EngineSpec | null {
  const fn = SPECS[slug];
  return fn ? fn() : null;
}

// ---- helpers ----

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function blurbForNps(nps: number, name: string): string {
  if (nps >= 9) return `Crew showed up early, gave great recs. Best lawn service we've used. — ${name}`;
  if (nps >= 7) return `Yard always looks clean. Communication is solid. — ${name}`;
  return `Decent service, occasional miss on edges. — ${name}`;
}
