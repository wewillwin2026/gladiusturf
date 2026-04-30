"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { KPICard } from "./ui/KPICard";
import { StatusPill } from "./ui/StatusPill";
import type { Customer, Invoice, Job, Quote } from "@/lib/shared/types";
import { money, num, pct } from "@/lib/shared/format";

const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--g-surface)",
  border: "1px solid var(--g-border)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 11,
  color: "var(--g-text)",
};

export function ReportsBrowser({
  customers,
  jobs,
  quotes,
  invoices,
}: {
  customers: Customer[];
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
}) {
  // Revenue by month from completed jobs.
  const revenueData = React.useMemo(() => {
    const buckets = new Map<string, number>();
    for (const j of jobs) {
      if (j.status !== "Complete") continue;
      const d = new Date(j.scheduledAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, (buckets.get(key) ?? 0) + j.priceCents);
    }
    const sorted = [...buckets.entries()].sort();
    const recent = sorted.slice(-12);
    return recent.map(([key, v]) => ({
      label: MONTHS[Number(key.split("-")[1]) - 1] ?? key,
      revenue: Math.round(v / 100),
    }));
  }, [jobs]);

  // Margin by route (simulated: revenue × variable margin).
  const marginData = React.useMemo(() => {
    const routes = new Map<string, number>();
    for (const c of customers) {
      const cjobs = jobs.filter(
        (j) => j.customerId === c.id && j.status === "Complete",
      );
      const rev = cjobs.reduce((s, j) => s + j.priceCents, 0);
      routes.set(c.routeId, (routes.get(c.routeId) ?? 0) + rev);
    }
    return [...routes.entries()].map(([route, revenue]) => {
      const seed = route.charCodeAt(2) ?? 65;
      const margin = 38 + ((seed * 7) % 14); // 38-52%
      return {
        route: route.replace("R-", ""),
        revenue: Math.round(revenue / 100),
        margin,
      };
    });
  }, [customers, jobs]);

  // Churn by month — derive from cancelled customers' last visit.
  const churnData = React.useMemo(() => {
    const buckets = new Map<string, number>();
    const totals = new Map<string, number>();
    const now = Date.now();
    for (let m = 11; m >= 0; m--) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, 0);
      totals.set(key, 200 + Math.floor((11 - m) * 4));
    }
    for (const c of customers) {
      if (c.status !== "Cancelled" && c.status !== "Lapsed") continue;
      const d = new Date(c.lastVisit);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }
    void now;
    return [...buckets.entries()].map(([key, churned]) => {
      const total = totals.get(key) ?? 200;
      return {
        label: MONTHS[Number(key.split("-")[1]) - 1] ?? key,
        churned,
        rate: Number(((churned / total) * 100).toFixed(2)),
      };
    });
  }, [customers]);

  // NPS distribution.
  const npsDist = React.useMemo(() => {
    const reviewed = customers.filter((c) => typeof c.npsScore === "number");
    const buckets = [0, 0, 0]; // detractor, passive, promoter
    for (const c of reviewed) {
      const s = c.npsScore!;
      if (s >= 9) buckets[2]!++;
      else if (s >= 7) buckets[1]!++;
      else buckets[0]!++;
    }
    return [
      { label: "Detractor (0-6)", count: buckets[0], color: "var(--g-danger)" },
      { label: "Passive (7-8)", count: buckets[1], color: "var(--g-warning)" },
      { label: "Promoter (9-10)", count: buckets[2], color: "var(--g-accent)" },
    ];
  }, [customers]);

  const npsScore = React.useMemo(() => {
    const n = customers.filter((c) => typeof c.npsScore === "number");
    if (!n.length) return 0;
    const promoters = n.filter((c) => c.npsScore! >= 9).length;
    const detractors = n.filter((c) => c.npsScore! <= 6).length;
    return Math.round(((promoters - detractors) / n.length) * 100);
  }, [customers]);

  // Routes — visits + revenue per route.
  const routesData = React.useMemo(() => {
    const r = new Map<string, { visits: number; revenue: number }>();
    for (const j of jobs) {
      if (j.status !== "Complete") continue;
      const customer = customers.find((c) => c.id === j.customerId);
      if (!customer) continue;
      const cur = r.get(customer.routeId) ?? { visits: 0, revenue: 0 };
      cur.visits++;
      cur.revenue += j.priceCents;
      r.set(customer.routeId, cur);
    }
    return [...r.entries()].map(([route, v]) => ({
      route: route.replace("R-", ""),
      visits: v.visits,
      revenue: Math.round(v.revenue / 100),
    }));
  }, [customers, jobs]);

  // Top 10 customers + churn risk.
  const topCustomers = React.useMemo(() => {
    return [...customers]
      .sort((a, b) => b.ltvCents - a.ltvCents)
      .slice(0, 10)
      .map((c) => {
        let risk: "Low" | "Medium" | "High" = "Low";
        if (c.status === "Lapsed") risk = "High";
        else if (c.status === "Cancelled") risk = "High";
        else if (c.npsScore != null && c.npsScore < 7) risk = "Medium";
        else if (
          c.lastVisit &&
          Date.now() - new Date(c.lastVisit).getTime() > 30 * 86400_000
        ) {
          risk = "Medium";
        }
        return { customer: c, risk };
      });
  }, [customers]);

  // Top-line KPIs — vary slightly per tab to feel like real dashboard.
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalInvoiced = invoices.reduce((s, i) => s + i.amountCents, 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;
  void totalInvoiced;
  void overdueCount;

  return (
    <Tabs defaultValue="revenue" className="flex flex-col gap-4">
      <TabsList className="overflow-x-auto">
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="margin">Margin</TabsTrigger>
        <TabsTrigger value="churn">Churn</TabsTrigger>
        <TabsTrigger value="nps">NPS</TabsTrigger>
        <TabsTrigger value="routes">Routes</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue" className="flex flex-col gap-4">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Revenue · TTM"
            value={money(totalRevenue * 100)}
            delta="+22.4%"
            trend="up"
          />
          <KPICard label="Best month" value={money(Math.max(...revenueData.map((d) => d.revenue)) * 100)} delta="this period" trend="up" />
          <KPICard label="Avg / month" value={money(Math.round((totalRevenue / Math.max(1, revenueData.length)) * 100))} delta="vs prior 12mo" trend="up" />
          <KPICard label="MoM growth" value="+5.1%" delta="trailing avg" trend="up" />
        </section>
        <ChartCard title="Revenue · last 12 months" subtitle="Sum of completed-job pricing per month">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid stroke="var(--g-border-subtle)" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`$${num(Number(v))}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--g-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--g-accent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <TopCustomersTable rows={topCustomers} />
      </TabsContent>

      <TabsContent value="margin" className="flex flex-col gap-4">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="Gross margin" value="48.6%" delta="+2.1 pts" trend="up" />
          <KPICard label="Best route" value="Bayshore · 51%" delta="" trend="up" />
          <KPICard label="Worst route" value="Tampa East · 39%" delta="labor util" trend="down" />
          <KPICard label="$ / labor hour" value="$87" delta="+$6" trend="up" />
        </section>
        <ChartCard title="Margin by route" subtitle="Gross margin % (left) vs revenue $ (right)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marginData}>
              <CartesianGrid stroke="var(--g-border-subtle)" strokeDasharray="3 3" />
              <XAxis dataKey="route" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="margin" fill="var(--g-accent)" name="Margin %" />
              <Bar yAxisId="right" dataKey="revenue" fill="var(--g-info)" name="Revenue $" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </TabsContent>

      <TabsContent value="churn" className="flex flex-col gap-4">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="Churn · TTM" value="5.8%" delta="−1.2 pts" trend="down" />
          <KPICard label="Lapsed customers" value={String(customers.filter((c) => c.status === "Lapsed").length)} delta="action queue" trend="flat" />
          <KPICard label="Cancelled · 90d" value={String(customers.filter((c) => c.status === "Cancelled").length)} delta="−4 vs prior" trend="down" />
          <KPICard label="Save Play wins" value="14" delta="this quarter" trend="up" />
        </section>
        <ChartCard title="Churn rate · last 12 months" subtitle="Lapsed + Cancelled customers as % of base">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={churnData}>
              <CartesianGrid stroke="var(--g-border-subtle)" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v)}%`, "Churn rate"]} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--g-warning)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </TabsContent>

      <TabsContent value="nps" className="flex flex-col gap-4">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="NPS" value={String(npsScore)} delta="+8" trend="up" />
          <KPICard label="Promoters" value={pct((npsDist[2]?.count ?? 0) / Math.max(1, npsDist.reduce((s, d) => s + (d.count ?? 0), 0)) * 100, 0)} delta="+3 pts" trend="up" />
          <KPICard label="Detractors" value={pct((npsDist[0]?.count ?? 0) / Math.max(1, npsDist.reduce((s, d) => s + (d.count ?? 0), 0)) * 100, 0)} delta="−2 pts" trend="down" />
          <KPICard label="Reviews · 30d" value="23" delta="+8" trend="up" />
        </section>
        <ChartCard title="NPS distribution" subtitle="Customers segmented by score">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={npsDist} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid stroke="var(--g-border-subtle)" strokeDasharray="3 3" />
              <XAxis type="number" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count">
                {npsDist.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </TabsContent>

      <TabsContent value="routes" className="flex flex-col gap-4">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="Routes" value={String(routesData.length)} delta="all active" trend="flat" />
          <KPICard label="Best $/visit" value="$182" delta="Bayshore" trend="up" />
          <KPICard label="Worst $/visit" value="$94" delta="Tampa East" trend="down" />
          <KPICard label="Drive-time savings" value="47 min/day" delta="auto-optimize" trend="down" />
        </section>
        <ChartCard title="Visits + revenue by route" subtitle="Completed visits TTM">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routesData}>
              <CartesianGrid stroke="var(--g-border-subtle)" strokeDasharray="3 3" />
              <XAxis dataKey="route" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--g-text-faint)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="visits" fill="var(--g-accent)" name="Visits" />
              <Bar yAxisId="right" dataKey="revenue" fill="var(--g-info)" name="Revenue $" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </TabsContent>
    </Tabs>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="g-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2>{title}</h2>
        {subtitle && (
          <span className="text-[11px] text-g-text-faint">{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function TopCustomersTable({
  rows,
}: {
  rows: { customer: Customer; risk: "Low" | "Medium" | "High" }[];
}) {
  return (
    <div className="g-card overflow-hidden">
      <div className="px-4 py-3 border-b border-g-border-subtle">
        <h2>Top 10 customers · LTV</h2>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-g-border-subtle">
            <th className="text-left px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-g-text-faint font-medium">
              Customer
            </th>
            <th className="text-center px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-g-text-faint font-medium">
              Tier
            </th>
            <th className="text-right px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-g-text-faint font-medium">
              LTV
            </th>
            <th className="text-center px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-g-text-faint font-medium">
              NPS
            </th>
            <th className="text-center px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-g-text-faint font-medium">
              Churn risk
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ customer: c, risk }) => (
            <tr key={c.id} className="border-b border-g-border-subtle last:border-b-0">
              <td className="px-4 py-2.5 text-g-text">{c.name}</td>
              <td className="px-4 py-2.5 text-center">
                <StatusPill tone={c.tier === "Enterprise" ? "accent" : c.tier === "Pro" ? "info" : "neutral"}>
                  {c.tier}
                </StatusPill>
              </td>
              <td className="px-4 py-2.5 text-right font-geist-mono tabular-nums">
                {money(c.ltvCents)}
              </td>
              <td className="px-4 py-2.5 text-center font-geist-mono">
                {c.npsScore ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-center">
                <StatusPill tone={risk === "Low" ? "accent" : risk === "Medium" ? "warning" : "danger"}>
                  {risk === "Low" ? <ArrowDown className="h-2.5 w-2.5" /> : risk === "Medium" ? <Minus className="h-2.5 w-2.5" /> : <ArrowUp className="h-2.5 w-2.5" />}
                  {risk}
                </StatusPill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
