"use client";

import * as React from "react";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Truck,
} from "lucide-react";
import { StatusPill } from "./ui/StatusPill";
import type { Crew, Customer, Job, JobStatus } from "@/lib/shared/types";
import { money, timeOfDay } from "@/lib/shared/format";
import { cn } from "@/lib/cn";

const STATUS_TONE: Record<
  JobStatus,
  "accent" | "info" | "warning" | "neutral" | "danger"
> = {
  Complete: "accent",
  OnSite: "accent",
  EnRoute: "info",
  Scheduled: "neutral",
  Skipped: "warning",
  Rescheduled: "warning",
};

export function JobsBoard({
  jobs,
  customers,
  crews,
}: {
  jobs: Job[];
  customers: Customer[];
  crews: Crew[];
}) {
  const customerById = React.useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c] as const)),
    [customers],
  );

  // Today only.
  const todayJobs = React.useMemo(() => {
    const t = new Date();
    return jobs
      .filter((j) => {
        const d = new Date(j.scheduledAt);
        return (
          d.getFullYear() === t.getFullYear() &&
          d.getMonth() === t.getMonth() &&
          d.getDate() === t.getDate()
        );
      })
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [jobs]);

  // Group by crew.
  const byCrew = React.useMemo(() => {
    const m = new Map<string, Job[]>();
    for (const c of crews) m.set(c.id, []);
    for (const j of todayJobs) {
      m.get(j.crewId)?.push(j);
    }
    return m;
  }, [crews, todayJobs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {crews.map((crew) => {
        const list = byCrew.get(crew.id) ?? [];
        const completed = list.filter((j) => j.status === "Complete").length;
        const onsite = list.filter((j) => j.status === "OnSite").length;
        const revenue = list.reduce((s, j) => s + j.priceCents, 0);
        return (
          <div key={crew.id} className="g-card overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-g-border-subtle bg-g-surface-2/40">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-medium text-g-text">
                  {crew.name}
                </span>
                <span className="font-geist-mono text-[10px] text-g-text-faint tabular-nums">
                  {crew.vehiclePlate}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-g-text-muted">
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  {list.length} stops
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-g-accent" />
                  {completed} done
                </span>
                {onsite > 0 && (
                  <span className="inline-flex items-center gap-1 text-g-accent">
                    <Circle className="h-2 w-2 fill-current animate-pulse" />
                    {onsite} on site
                  </span>
                )}
                <span className="ml-auto font-geist-mono text-g-accent tabular-nums">
                  {money(revenue)}
                </span>
              </div>
            </div>
            <ul className="flex-1 divide-y divide-g-border-subtle">
              {list.length === 0 ? (
                <li className="px-4 py-6 text-center text-[12px] text-g-text-faint italic">
                  No jobs scheduled today
                </li>
              ) : (
                list.map((j) => {
                  const customer = customerById[j.customerId];
                  return (
                    <li key={j.id}>
                      <Link
                        href={`/app/jobs/${j.id}`}
                        prefetch
                        className="block px-4 py-3 hover:bg-g-surface-2 transition-colors"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-geist-mono text-[11px] text-g-text-faint tabular-nums">
                            {timeOfDay(j.scheduledAt)}
                          </span>
                          <StatusPill tone={STATUS_TONE[j.status]}>{j.status}</StatusPill>
                        </div>
                        <div className="mt-1 text-[13px] text-g-text">
                          {j.service}
                        </div>
                        <div className="text-[11px] text-g-text-muted truncate">
                          {customer?.name ?? "—"}
                        </div>
                        {customer && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-g-text-faint">
                            <MapPin className="h-2.5 w-2.5" />
                            {customer.address}, {customer.zip}
                          </div>
                        )}
                        <div className="mt-1.5 flex items-center justify-between text-[10px]">
                          <span className="inline-flex items-center gap-1 text-g-text-faint">
                            <Clock className="h-2.5 w-2.5" />
                            {j.durationMin}m est
                          </span>
                          {j.status === "Complete" && (
                            <span className="inline-flex items-center gap-1 text-g-accent">
                              <Camera className="h-2.5 w-2.5" />
                              photos
                            </span>
                          )}
                          <span className="font-geist-mono text-g-text tabular-nums">
                            {money(j.priceCents)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

void cn;
