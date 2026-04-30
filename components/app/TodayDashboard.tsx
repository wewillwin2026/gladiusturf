import * as React from "react";
import {
  ArrowRight,
  Cloud,
  DollarSign,
  Inbox,
  Star,
  Timer,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { KPICard } from "./ui/KPICard";
import { Avatar } from "./ui/Avatar";
import { StatusPill } from "./ui/StatusPill";
import { PageHeader } from "./PageHeader";
import { type ProductKind } from "./engines";
import { money, relTime } from "@/lib/shared/format";
import type { ActivityEvent, Crew, KPI } from "@/lib/shared/types";

export type TodayProps = {
  product: ProductKind;
  greeting: string;
  subtitle: string;
  kpis: KPI[];
  crews: { crew: Crew; status: "Dispatched" | "OnSite" | "Returning" | "Off"; jobsToday: number; revenueTodayCents: number }[];
  activity: ActivityEvent[];
  funnel: { sent: number; viewed: number; won: number; scheduled: number };
};

const KPI_ICONS = [DollarSign, Inbox, Truck, Users] as const;

export function TodayDashboard({
  greeting,
  subtitle,
  kpis,
  crews,
  activity,
  funnel,
  product,
}: TodayProps) {
  const base = product === "demo" ? "/app" : "/founders/war-room";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={
          product === "founders" ? "War Room · Real" : "Demo · Cypress Lawn"
        }
        title={greeting}
        subtitle={subtitle}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((k, i) => {
          const Icon = KPI_ICONS[i % KPI_ICONS.length]!;
          return (
            <KPICard
              key={k.label}
              label={k.label}
              value={k.value}
              delta={k.delta}
              trend={k.trend}
              spark={k.spark}
              hint={
                <span className="inline-flex items-center gap-1">
                  <Icon className="h-3 w-3 text-g-text-faint" />
                  <span className="text-g-text-faint">{describeIcon(i)}</span>
                </span>
              }
            />
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 g-card p-5">
          <div className="flex items-baseline justify-between">
            <h2>Crew status</h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
              {crews.length} crews · live
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {crews.map(({ crew, status, jobsToday, revenueTodayCents }) => (
              <div
                key={crew.id}
                className="border border-g-border rounded-lg p-3 bg-g-surface-2/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-g-text">
                    {crew.name}
                  </span>
                  <StatusPill tone={statusTone(status)}>{status}</StatusPill>
                </div>
                <div className="mt-2 flex -space-x-1.5">
                  {crew.members.map((m) => (
                    <Avatar
                      key={m.name}
                      name={m.name}
                      size="sm"
                      className="ring-2 ring-g-surface-2"
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[12px]">
                  <span className="text-g-text-muted">
                    {jobsToday} visits today
                  </span>
                  <span className="font-geist-mono text-g-accent">
                    {money(revenueTodayCents)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 g-card p-5">
          <div className="flex items-baseline justify-between">
            <h2>Live activity</h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
              Engines firing
            </span>
          </div>
          {activity.length === 0 ? (
            <p className="mt-6 text-[13px] text-g-text-muted">
              First engine fire will appear here.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {activity.slice(0, 12).map((e) => {
                const Icon = activityIcon(e.kind);
                return (
                  <li
                    key={e.id}
                    className="flex items-start gap-3 text-[13px]"
                  >
                    <div className="h-7 w-7 shrink-0 rounded-md bg-g-surface-2 border border-g-border-subtle inline-flex items-center justify-center text-g-text-muted">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-g-text truncate">{e.text}</p>
                      <p className="text-[11px] text-g-text-faint mt-0.5">
                        {relTime(e.ts)}
                      </p>
                    </div>
                    {typeof e.amountCents === "number" && (
                      <span className="font-geist-mono text-[12px] text-g-accent shrink-0">
                        {money(e.amountCents)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="g-card p-5">
        <div className="flex items-baseline justify-between">
          <h2>Quote funnel · 30 days</h2>
          <Link
            href={`${base}/quotes`}
            prefetch
            className="text-[12px] text-g-accent hover:underline inline-flex items-center gap-1"
          >
            Open pipeline <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <FunnelStep label="Sent" n={funnel.sent} pct={1} />
          <FunnelStep label="Viewed" n={funnel.viewed} pct={funnel.viewed / Math.max(1, funnel.sent)} />
          <FunnelStep label="Won" n={funnel.won} pct={funnel.won / Math.max(1, funnel.sent)} />
          <FunnelStep label="Scheduled" n={funnel.scheduled} pct={funnel.scheduled / Math.max(1, funnel.sent)} />
        </div>
      </section>
    </div>
  );
}

function FunnelStep({ label, n, pct }: { label: string; n: number; pct: number }) {
  return (
    <div className="g-surface-2 rounded-md p-3 border border-g-border-subtle">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          {label}
        </span>
        <span className="font-geist-mono text-[18px] text-g-text">{n}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-g-bg overflow-hidden">
        <div
          className="h-full bg-g-accent rounded-full transition-all"
          style={{ width: `${Math.max(8, pct * 100)}%` }}
        />
      </div>
    </div>
  );
}

function statusTone(status: TodayProps["crews"][number]["status"]) {
  if (status === "OnSite") return "accent" as const;
  if (status === "Dispatched") return "info" as const;
  if (status === "Returning") return "warning" as const;
  return "neutral" as const;
}

function activityIcon(kind: ActivityEvent["kind"]) {
  switch (kind) {
    case "job_completed":
      return Truck;
    case "invoice_paid":
      return DollarSign;
    case "quote_won":
      return TrendingUp;
    case "quote_sent":
    case "quote_viewed":
      return Inbox;
    case "review_received":
      return Star;
    case "message_received":
      return Inbox;
    case "customer_added":
      return Users;
  }
  return Cloud;
}

function describeIcon(i: number): string {
  return ["this month", "this week", "today", "vs Q1"][i % 4]!;
}

void Timer; // eslint silencer
