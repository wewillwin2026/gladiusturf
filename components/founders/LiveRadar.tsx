"use client";

import * as React from "react";
import { Radar, MapPin, ArrowUpRight, Flame, Repeat2 } from "lucide-react";
import type {
  LiveRadar as LiveRadarData,
  RadarBlip,
  RadarStatus,
} from "@/lib/tracking/queries";
import { cn } from "@/lib/cn";

const POLL_MS = 5000;
const FRESH_MS = 6000;

const STATUS_META: Record<
  RadarStatus,
  { label: string; dot: string; text: string; ring: string }
> = {
  converting: {
    label: "Converting",
    dot: "bg-g-accent",
    text: "text-g-accent",
    ring: "ring-g-accent/40",
  },
  live: {
    label: "Live now",
    dot: "bg-g-success",
    text: "text-g-success",
    ring: "ring-g-success/40",
  },
  warm: {
    label: "Warm",
    dot: "bg-g-accent/60",
    text: "text-g-accent/80",
    ring: "ring-g-accent/20",
  },
  cooling: {
    label: "Cooling",
    dot: "bg-g-text-faint",
    text: "text-g-text-faint",
    ring: "ring-g-border",
  },
};

function relMinutes(min: number): string {
  if (min <= 0) return "just now";
  if (min === 1) return "1 min ago";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return h === 1 ? "1 hr ago" : `${h} hr ago`;
}

export function LiveRadar({ initial }: { initial: LiveRadarData }) {
  const [data, setData] = React.useState<LiveRadarData>(initial);
  const [updatedAt, setUpdatedAt] = React.useState<number>(Date.now());
  const [tick, setTick] = React.useState(0);
  const [error, setError] = React.useState(false);
  const seenRef = React.useRef<Map<string, number>>(new Map());

  // Seed the "seen" map from the initial server payload so nothing
  // flashes "fresh" on first paint.
  React.useEffect(() => {
    const m = seenRef.current;
    const t = Date.now() - FRESH_MS - 1;
    for (const b of initial.blips) if (!m.has(b.sessionId)) m.set(b.sessionId, t);
  }, [initial.blips]);

  React.useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/founders/radar", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(String(res.status));
        const next = (await res.json()) as LiveRadarData;
        if (cancelled) return;
        const m = seenRef.current;
        const nowT = Date.now();
        for (const b of next.blips) if (!m.has(b.sessionId)) m.set(b.sessionId, nowT);
        setData(next);
        setUpdatedAt(nowT);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    const id = window.setInterval(poll, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVis);
    // A 1s heartbeat just re-renders relative timestamps.
    const beat = window.setInterval(() => setTick((t) => t + 1), 1000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearInterval(beat);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const secondsAgo = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
  void tick; // tick forces the re-render that recomputes secondsAgo

  const { totals, blips } = data;

  return (
    <div className="flex flex-col gap-4">
      {/* Status strip */}
      <section className="g-card flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                error ? "bg-g-danger" : "bg-g-success animate-ping",
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                error ? "bg-g-danger" : "bg-g-success",
              )}
            />
          </span>
          <span className="text-[12px] text-g-text">
            {error ? "Reconnecting…" : "Live"}
          </span>
          <span className="text-[11px] text-g-text-faint font-mono">
            · refreshed {secondsAgo}s ago
          </span>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <Counter label="Converting" n={totals.converting} cls="text-g-accent" />
          <Counter label="Live" n={totals.live} cls="text-g-success" />
          <Counter label="Warm" n={totals.warm} cls="text-g-accent/80" />
          <Counter label="Cooling" n={totals.cooling} cls="text-g-text-faint" />
        </div>
        <span className="ml-auto text-[11px] text-g-text-faint">
          {blips.length} on the radar · founder traffic excluded
        </span>
      </section>

      {blips.length === 0 ? (
        <section className="g-card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Radar className="h-7 w-7 text-g-text-faint" />
          <p className="text-[13px] text-g-text">
            {data.schemaMissing
              ? "Tracking schema not live yet"
              : "No one on gladiusturf.com right now"}
          </p>
          <p className="text-[11px] text-g-text-faint max-w-sm">
            {data.schemaMissing
              ? "Run the tracking migration, then this lights up."
              : "Blips appear the moment a real visitor lands. Polls every 5s; your own traffic never shows here."}
          </p>
        </section>
      ) : (
        <section className="grid gap-2 sm:grid-cols-2">
          {blips.map((b) => (
            <BlipCard
              key={b.sessionId}
              b={b}
              fresh={Date.now() - (seenRef.current.get(b.sessionId) ?? 0) < FRESH_MS}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function Counter({ label, n, cls }: { label: string; n: number; cls: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className={cn("font-mono text-[15px]", cls)}>{n}</span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-g-text-faint">
        {label}
      </span>
    </span>
  );
}

function BlipCard({ b, fresh }: { b: RadarBlip; fresh: boolean }) {
  const s = STATUS_META[b.status];
  const geo =
    [b.city, b.region, b.country].filter(Boolean).join(", ") || "Unknown";
  return (
    <div
      className={cn(
        "g-card px-4 py-3 flex flex-col gap-2 transition-all",
        fresh && "ring-2 ring-g-accent/60 animate-pulse",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-2 w-2 rounded-full shrink-0",
            s.dot,
            (b.status === "live" || b.status === "converting") && "animate-pulse",
          )}
        />
        <span className={cn("text-[11px] uppercase tracking-[0.12em]", s.text)}>
          {s.label}
        </span>
        {b.demoIntent && (
          <span className="inline-flex items-center gap-1 text-[10px] text-g-accent">
            <Flame className="h-3 w-3" /> demo intent
          </span>
        )}
        {b.returning && (
          <span className="inline-flex items-center gap-1 text-[10px] text-g-text-muted">
            <Repeat2 className="h-3 w-3" /> returning
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-[11px] font-mono text-g-text-faint">
          <Flame className="h-3 w-3" />
          {b.heatScore}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[13px] text-g-text min-w-0">
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-g-text-faint" />
        <span className="font-mono truncate">{b.currentPath || "/"}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-g-text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3 text-g-text-faint" />
          {geo}
        </span>
        <span className="text-g-text-faint">
          {b.pageviews} page{b.pageviews === 1 ? "" : "s"}
        </span>
        <span className="text-g-text-faint">{relMinutes(b.minutesIdle)}</span>
        <span className="text-g-text-faint">
          src: {b.utmSource || (b.referrer ? "referral" : "direct")}
        </span>
        {b.product && b.product !== "marketing" && (
          <span className="text-g-text-faint">· {b.product}</span>
        )}
        <span className="ml-auto font-mono text-g-text-faint">
          {b.visitorHash.slice(0, 8)}…
        </span>
      </div>
    </div>
  );
}
