"use client";

import * as React from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowRight,
  CheckSquare,
  List,
  Map as MapIcon,
  Mail,
  MessageSquare,
  Search,
  Square,
  X,
} from "lucide-react";
import { Button } from "./ui/Button";
import { IconButton } from "./ui/IconButton";
import { Input } from "./ui/Input";
import { StatusPill } from "./ui/StatusPill";
import { CustomersMap } from "./CustomersMap";
import type { Customer, CustomerStatus, Tier } from "@/lib/shared/types";
import { money, relTime } from "@/lib/shared/format";
import { cn } from "@/lib/cn";

const STATUSES: CustomerStatus[] = ["Active", "Lapsed", "Cancelled", "Lead"];
const TIERS: Tier[] = ["Independent", "Pro", "Enterprise"];

export function CustomersBrowser({
  customers,
  routes,
  mapboxToken,
}: {
  customers: Customer[];
  routes: string[];
  mapboxToken: string | null;
}) {
  const [view, setView] = React.useState<"list" | "map">("list");
  const [q, setQ] = React.useState("");
  const [statuses, setStatuses] = React.useState<Set<CustomerStatus>>(
    new Set(["Active"]),
  );
  const [tiers, setTiers] = React.useState<Set<Tier>>(new Set());
  const [routeIds, setRouteIds] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return customers.filter((c) => {
      if (statuses.size > 0 && !statuses.has(c.status)) return false;
      if (tiers.size > 0 && !tiers.has(c.tier)) return false;
      if (routeIds.size > 0 && !routeIds.has(c.routeId)) return false;
      if (
        ql &&
        !c.name.toLowerCase().includes(ql) &&
        !c.address.toLowerCase().includes(ql) &&
        !c.zip.includes(ql)
      ) {
        return false;
      }
      return true;
    });
  }, [customers, q, statuses, tiers, routeIds]);

  const allSelected =
    filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  function toggleAll() {
    if (allSelected) {
      const next = new Set(selected);
      for (const c of filtered) next.delete(c.id);
      setSelected(next);
    } else {
      const next = new Set(selected);
      for (const c of filtered) next.add(c.id);
      setSelected(next);
    }
  }

  function clearFilters() {
    setQ("");
    setStatuses(new Set(["Active"]));
    setTiers(new Set());
    setRouteIds(new Set());
  }

  const hasFilters =
    q.trim() ||
    statuses.size > 1 ||
    !statuses.has("Active") ||
    tiers.size > 0 ||
    routeIds.size > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="g-card p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g-text-faint" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, address, zip…"
              className="pl-8"
            />
          </div>
          <FilterPills
            label="Status"
            options={STATUSES}
            selected={statuses}
            onToggle={(v) => {
              const next = new Set(statuses);
              if (next.has(v)) next.delete(v);
              else next.add(v);
              setStatuses(next);
            }}
          />
          <FilterPills
            label="Tier"
            options={TIERS}
            selected={tiers}
            onToggle={(v) => {
              const next = new Set(tiers);
              if (next.has(v)) next.delete(v);
              else next.add(v);
              setTiers(next);
            }}
          />
          <FilterPills
            label="Route"
            options={routes}
            selected={routeIds}
            onToggle={(v) => {
              const next = new Set(routeIds);
              if (next.has(v)) next.delete(v);
              else next.add(v);
              setRouteIds(next);
            }}
          />
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] uppercase tracking-[0.14em] text-g-text-muted hover:text-g-text inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          <div className="ml-auto inline-flex items-center rounded-md border border-g-border overflow-hidden">
            <ViewToggleButton
              active={view === "list"}
              onClick={() => setView("list")}
              icon={<List className="h-3.5 w-3.5" />}
              label="List"
            />
            <ViewToggleButton
              active={view === "map"}
              onClick={() => setView("map")}
              icon={<MapIcon className="h-3.5 w-3.5" />}
              label="Map"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-[11px] text-g-text-faint">
          <span>
            <span className="font-geist-mono text-g-text-muted">
              {filtered.length}
            </span>{" "}
            of {customers.length} matched
          </span>
          {selected.size > 0 && (
            <span className="inline-flex items-center gap-3">
              <span className="text-g-accent">{selected.size} selected</span>
              <span className="text-g-text-faint">·</span>
              <button className="hover:text-g-text inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </button>
              <button className="hover:text-g-text inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Text
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="hover:text-g-text inline-flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            </span>
          )}
        </div>
      </div>

      {view === "list" ? (
        <VirtualList
          rows={filtered}
          selected={selected}
          onToggle={(id) =>
            setSelected((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          allSelected={allSelected}
          onToggleAll={toggleAll}
        />
      ) : (
        <CustomersMap
          customers={filtered}
          mapboxToken={mapboxToken}
          selected={selected}
        />
      )}
    </div>
  );
}

function FilterPills<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: T[];
  selected: Set<T>;
  onToggle: (v: T) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-g-border-subtle bg-g-surface-2/40">
      <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint mr-1">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onToggle(o)}
          className={cn(
            "h-6 px-2 rounded text-[11px] transition-colors",
            selected.has(o)
              ? "bg-g-accent-faint text-g-accent border border-g-accent/40"
              : "text-g-text-muted hover:text-g-text border border-transparent",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 h-7 text-[12px] transition-colors",
        active
          ? "bg-g-accent-faint text-g-accent"
          : "text-g-text-muted hover:text-g-text hover:bg-g-surface-2",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function VirtualList({
  rows,
  selected,
  onToggle,
  allSelected,
  onToggleAll,
}: {
  rows: Customer[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  allSelected: boolean;
  onToggleAll: () => void;
}) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 12,
  });

  if (rows.length === 0) {
    return (
      <div className="g-card p-12 flex items-center justify-center text-g-text-muted text-[13px]">
        No matches. Loosen the filters above.
      </div>
    );
  }

  return (
    <div className="g-card overflow-hidden">
      <div className="grid grid-cols-[40px_1.4fr_1fr_120px_120px_120px_100px_120px] gap-2 px-4 h-9 items-center border-b border-g-border-subtle text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
        <button
          type="button"
          onClick={onToggleAll}
          className="text-g-text-muted hover:text-g-text"
          aria-label={allSelected ? "Deselect all" : "Select all"}
        >
          {allSelected ? (
            <CheckSquare className="h-3.5 w-3.5 text-g-accent" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
        </button>
        <span>Customer</span>
        <span>Address</span>
        <span className="text-center">Tier</span>
        <span className="text-right">LTV</span>
        <span className="text-right">Next visit</span>
        <span className="text-center">Route</span>
        <span className="text-center">Status</span>
      </div>
      <div
        ref={parentRef}
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 280px)", minHeight: 480 }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((vi) => {
            const c = rows[vi.index]!;
            const isSelected = selected.has(c.id);
            return (
              <div
                key={c.id}
                className={cn(
                  "absolute left-0 right-0 grid grid-cols-[40px_1.4fr_1fr_120px_120px_120px_100px_120px] gap-2 px-4 items-center border-b border-g-border-subtle text-[13px] transition-colors hover:bg-g-surface-2",
                  isSelected && "bg-g-accent-faint",
                )}
                style={{
                  height: `${vi.size}px`,
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                <button
                  type="button"
                  onClick={() => onToggle(c.id)}
                  className="text-g-text-muted hover:text-g-text"
                  aria-label={isSelected ? "Deselect" : "Select"}
                >
                  {isSelected ? (
                    <CheckSquare className="h-3.5 w-3.5 text-g-accent" />
                  ) : (
                    <Square className="h-3.5 w-3.5" />
                  )}
                </button>
                <Link
                  href={`/app/customers/${c.id}`}
                  prefetch
                  className="text-g-text hover:text-g-accent truncate"
                >
                  {c.name}
                </Link>
                <span className="text-g-text-muted truncate">
                  {c.address}, {c.zip}
                </span>
                <span className="text-center">
                  <StatusPill
                    tone={
                      c.tier === "Enterprise"
                        ? "accent"
                        : c.tier === "Pro"
                          ? "info"
                          : "neutral"
                    }
                  >
                    {c.tier}
                  </StatusPill>
                </span>
                <span className="text-right font-geist-mono tabular-nums text-g-text">
                  {money(c.ltvCents)}
                </span>
                <span className="text-right font-geist-mono text-g-text-muted text-[12px]">
                  {c.nextVisit ? relTime(c.nextVisit) : "—"}
                </span>
                <span className="text-center text-g-text-faint font-geist-mono text-[11px]">
                  {c.routeId.replace("R-", "")}
                </span>
                <span className="text-center">
                  <StatusPill
                    tone={
                      c.status === "Active"
                        ? "accent"
                        : c.status === "Lapsed"
                          ? "warning"
                          : c.status === "Cancelled"
                            ? "danger"
                            : "info"
                    }
                  >
                    {c.status}
                  </StatusPill>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-4 h-9 flex items-center justify-between border-t border-g-border-subtle text-[11px] text-g-text-muted">
        <span className="font-geist-mono">{rows.length} customers</span>
        <Link
          href="/app/customers"
          prefetch
          className="text-g-accent hover:underline inline-flex items-center gap-1"
        >
          New customer <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
