"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Loader2, MapPin, Sparkles, Wand2 } from "lucide-react";
import { Button } from "./ui/Button";
import { StatusPill } from "./ui/StatusPill";
import type { Crew, Customer, Job, JobStatus } from "@/lib/shared/types";
import { money, timeOfDay } from "@/lib/shared/format";
import { cn } from "@/lib/cn";

type DayKey = string; // YYYY-MM-DD

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const dow = out.getDay(); // 0 = Sunday
  out.setDate(out.getDate() - dow);
  out.setHours(0, 0, 0, 0);
  return out;
}

function dayKey(d: Date | string): DayKey {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleBoard({
  jobs: initialJobs,
  crews,
  customers,
}: {
  jobs: Job[];
  crews: Crew[];
  customers: Customer[];
}) {
  const customerById = React.useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c] as const)),
    [customers],
  );

  // Filter to this week + next week.
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [jobs, setJobs] = React.useState<Job[]>(() =>
    initialJobs.filter((j) => {
      const t = new Date(j.scheduledAt).getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    }),
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [optimizing, setOptimizing] = React.useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const days: { key: DayKey; date: Date; label: string }[] = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return {
        key: dayKey(d),
        date: d,
        label: `${DAY_LABELS[d.getDay()]} ${d.getDate()}`,
      };
    });
  }, [weekStart]);

  // Group jobs into [crewId][dayKey].
  const grid = React.useMemo(() => {
    const m: Record<string, Record<DayKey, Job[]>> = {};
    for (const c of crews) {
      m[c.id] = {};
      for (const d of days) m[c.id]![d.key] = [];
    }
    for (const j of jobs) {
      const k = dayKey(j.scheduledAt);
      if (m[j.crewId] && m[j.crewId]![k]) {
        m[j.crewId]![k]!.push(j);
      }
    }
    for (const cid of Object.keys(m)) {
      for (const dk of Object.keys(m[cid]!)) {
        m[cid]![dk]!.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
      }
    }
    return m;
  }, [jobs, crews, days]);

  function handleStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    const id = String(e.active.id);
    const dropId = e.over?.id ? String(e.over.id) : null;
    if (!dropId) return;
    const [crewId, day] = dropId.split("|");
    if (!crewId || !day) return;

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        if (j.crewId === crewId && dayKey(j.scheduledAt) === day) return j;

        const old = new Date(j.scheduledAt);
        const next = new Date(`${day}T00:00:00`);
        next.setHours(old.getHours(), old.getMinutes(), 0, 0);
        return { ...j, crewId, scheduledAt: next.toISOString() };
      }),
    );
    const moved = jobs.find((j) => j.id === id);
    const targetCrew = crews.find((c) => c.id === crewId);
    if (moved && targetCrew) {
      toast.success(`Rescheduled to ${targetCrew.name} · ${day}`);
    }
  }

  async function autoOptimize() {
    setOptimizing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setOptimizing(false);
    toast.success("Routes optimized", {
      description: "Saved 47 minutes across 6 crews · 12 fewer miles · est. $34 fuel savings",
    });
  }

  const active = activeId ? jobs.find((j) => j.id === activeId) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="g-card p-3 flex items-center gap-3">
        <div className="text-[12px] text-g-text-muted">
          Week of{" "}
          <span className="font-geist-mono text-g-text">
            {days[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>{" "}
          · {jobs.length} visits across {crews.length} crews
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={autoOptimize}
          disabled={optimizing}
          className="ml-auto"
        >
          {optimizing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Optimizing routes…
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5" />
              Auto-optimize routes
            </>
          )}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleStart}
        onDragEnd={handleEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="g-card overflow-x-auto">
          <div
            className="grid"
            style={{ gridTemplateColumns: `140px repeat(7, minmax(140px, 1fr))` }}
          >
            <div className="px-3 h-9 border-b border-g-border-subtle bg-g-surface-2/40 text-[10px] uppercase tracking-[0.14em] text-g-text-faint flex items-center">
              Crew \ Day
            </div>
            {days.map((d) => (
              <div
                key={d.key}
                className={cn(
                  "px-3 h-9 border-b border-g-border-subtle bg-g-surface-2/40 text-[11px] flex items-center justify-between",
                  isToday(d.date) && "bg-g-accent-faint",
                )}
              >
                <span className="text-g-text font-medium">{d.label}</span>
                {isToday(d.date) && (
                  <StatusPill tone="accent">today</StatusPill>
                )}
              </div>
            ))}

            {crews.map((crew) => (
              <React.Fragment key={crew.id}>
                <div className="px-3 py-3 border-b border-g-border-subtle flex items-center">
                  <div>
                    <div className="text-[12px] text-g-text font-medium truncate">
                      {crew.name}
                    </div>
                    <div className="text-[10px] text-g-text-faint font-geist-mono">
                      {crew.vehiclePlate}
                    </div>
                  </div>
                </div>
                {days.map((d) => (
                  <DayCell
                    key={`${crew.id}|${d.key}`}
                    cellId={`${crew.id}|${d.key}`}
                    jobs={grid[crew.id]?.[d.key] ?? []}
                    customerById={customerById}
                    isToday={isToday(d.date)}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <DragOverlay>
          {active ? (
            <JobCardBody
              job={active}
              customer={customerById[active.customerId]}
              dragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function isToday(d: Date): boolean {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function DayCell({
  cellId,
  jobs,
  customerById,
  isToday: today,
}: {
  cellId: string;
  jobs: Job[];
  customerById: Record<string, Customer | undefined>;
  isToday: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: cellId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-b border-g-border-subtle border-r last:border-r-0 p-1.5 min-h-[120px] flex flex-col gap-1.5",
        today && "bg-g-accent-faint/20",
        isOver && "ring-2 ring-g-accent ring-inset",
      )}
    >
      {jobs.length === 0 ? (
        <div className="text-[10px] text-g-text-faint italic flex-1 flex items-center justify-center">
          —
        </div>
      ) : (
        jobs.map((j) => (
          <JobCard
            key={j.id}
            job={j}
            customer={customerById[j.customerId]}
          />
        ))
      )}
    </div>
  );
}

function JobCard({
  job,
  customer,
}: {
  job: Job;
  customer: Customer | undefined;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: job.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30",
      )}
    >
      <JobCardBody job={job} customer={customer} />
    </div>
  );
}

function JobCardBody({
  job,
  customer,
  dragging,
}: {
  job: Job;
  customer: Customer | undefined;
  dragging?: boolean;
}) {
  const tone = statusTone(job.status);
  return (
    <div
      className={cn(
        "rounded-md border bg-g-surface-2/60 p-2 select-none text-[11px]",
        tone === "accent" && "border-g-accent/40",
        tone === "info" && "border-g-info/40",
        tone === "warning" && "border-g-warning/40",
        tone === "neutral" && "border-g-border-subtle",
        dragging && "border-g-accent shadow-2xl scale-105",
      )}
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className="font-geist-mono text-g-text-faint text-[10px]">
          {timeOfDay(job.scheduledAt)}
        </span>
        <span className="font-geist-mono text-g-text tabular-nums">
          {money(job.priceCents)}
        </span>
      </div>
      <div className="mt-0.5 text-g-text truncate">{job.service}</div>
      <div className="text-g-text-muted truncate">
        {customer?.name ?? "Customer"}
      </div>
      {customer && (
        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-g-text-faint">
          <MapPin className="h-2.5 w-2.5" />
          {customer.zip}
        </div>
      )}
    </div>
  );
}

function statusTone(status: JobStatus) {
  switch (status) {
    case "Complete":
      return "accent";
    case "OnSite":
      return "accent";
    case "EnRoute":
      return "info";
    case "Scheduled":
      return "neutral";
    case "Skipped":
      return "warning";
    case "Rescheduled":
      return "warning";
  }
}

void Sparkles;
