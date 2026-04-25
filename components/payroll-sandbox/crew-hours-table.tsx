"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import { CREW_ROWS, type CrewRow } from "@/content/payroll-demo-data";
import { cn } from "@/lib/cn";

type FilterKey = "all" | "w2" | "1099" | "pending";
type SortKey = "name" | "hours" | "ot" | "gross";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "w2", label: "W-2" },
  { key: "1099", label: "1099" },
  { key: "pending", label: "Pending" },
];

function applyFilter(rows: CrewRow[], f: FilterKey): CrewRow[] {
  if (f === "all") return rows;
  if (f === "w2") return rows.filter((r) => r.type === "w2");
  if (f === "1099") return rows.filter((r) => r.type === "1099");
  return rows.filter((r) => r.status === "pending-tin");
}

function applySort(rows: CrewRow[], key: SortKey, dir: "asc" | "desc"): CrewRow[] {
  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    if (key === "name") {
      cmp = `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`
      );
    } else if (key === "hours") {
      cmp = a.hours - b.hours;
    } else if (key === "ot") {
      cmp = a.ot - b.ot;
    } else {
      cmp = a.gross - b.gross;
    }
    return dir === "asc" ? cmp : -cmp;
  });
  return sorted;
}

function fmtMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtHours(n: number): string {
  return n % 1 === 0 ? `${n}.0` : n.toFixed(1);
}

export function CrewHoursTable() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const visible = useMemo(
    () => applySort(applyFilter(CREW_ROWS, filter), sortKey, sortDir),
    [filter, sortKey, sortDir]
  );

  const totals = useMemo(() => {
    return visible.reduce(
      (acc, r) => ({
        hours: acc.hours + r.hours,
        ot: acc.ot + r.ot,
        gross: acc.gross + r.gross,
        count: acc.count + 1,
      }),
      { hours: 0, ot: 0, gross: 0, count: 0 }
    );
  }, [visible]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02] shadow-pop-champagne">
      <div className="flex flex-col gap-3 border-b border-bone/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45">
            Crew · Pay period
          </div>
          <h2 className="mt-1 font-serif text-xl font-semibold tracking-[-0.01em] text-bone">
            12 crew · GPS-verified hours
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                  active
                    ? "bg-champagne text-pitch"
                    : "border border-bone/15 bg-bone/[0.03] text-bone/65 hover:bg-bone/[0.07] hover:text-bone"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead className="border-b border-bone/10 font-mono text-[10px] uppercase tracking-[0.16em] text-bone/45">
            <tr>
              <SortableTh
                label="Crew member"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggleSort("name")}
              />
              <th className="px-3 py-3 font-semibold">Role</th>
              <SortableTh
                label="Hours"
                active={sortKey === "hours"}
                dir={sortDir}
                onClick={() => toggleSort("hours")}
                align="right"
              />
              <SortableTh
                label="OT"
                active={sortKey === "ot"}
                dir={sortDir}
                onClick={() => toggleSort("ot")}
                align="right"
              />
              <th className="px-3 py-3 font-semibold">State</th>
              <SortableTh
                label="Gross"
                active={sortKey === "gross"}
                dir={sortDir}
                onClick={() => toggleSort("gross")}
                align="right"
              />
              <th className="px-3 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-bone/85">
            {visible.map((r) => (
              <CrewRowEl key={r.id} row={r} />
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-bone/45"
                >
                  No crew matches this filter
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t border-bone/10 bg-bone/[0.02] font-mono text-[11px] text-bone/70">
            <tr>
              <td className="px-5 py-3 font-semibold uppercase tracking-[0.16em] text-bone/55 md:px-6">
                Totals · {totals.count} crew
              </td>
              <td className="px-3 py-3" />
              <td className="px-3 py-3 text-right text-bone">
                {fmtHours(totals.hours)} hrs
              </td>
              <td
                className={cn(
                  "px-3 py-3 text-right",
                  totals.ot > 0 ? "text-champagne-bright" : "text-bone/40"
                )}
              >
                {fmtHours(totals.ot)} hrs
              </td>
              <td className="px-3 py-3" />
              <td className="px-3 py-3 text-right text-bone">
                {fmtMoney(totals.gross)}
              </td>
              <td className="px-3 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function CrewRowEl({ row }: { row: CrewRow }) {
  const rolePill = roleClasses(row.role);
  return (
    <tr className="border-b border-bone/[0.06] last:border-b-0 hover:bg-bone/[0.02]">
      <td className="px-5 py-3.5 md:px-6">
        <div className="font-serif text-[14px] font-semibold tracking-[-0.005em] text-bone">
          {row.firstName} {row.lastName}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/45">
          {row.type === "w2" ? "W-2" : "1099-NEC"} · ${row.rate}/hr
        </div>
      </td>
      <td className="px-3 py-3.5">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
            rolePill
          )}
        >
          {row.role}
        </span>
      </td>
      <td className="px-3 py-3.5 text-right font-mono text-[12.5px] text-bone">
        <span className="inline-flex items-center gap-1">
          {fmtHours(row.hours)}
          <CheckCircle2
            aria-label="GPS verified"
            className="h-3 w-3 text-moss-bright"
          />
        </span>
      </td>
      <td
        className={cn(
          "px-3 py-3.5 text-right font-mono text-[12.5px]",
          row.ot > 0 ? "text-champagne-bright" : "text-bone/30"
        )}
      >
        {fmtHours(row.ot)} {row.ot > 0 ? "OT" : "—"}
      </td>
      <td className="px-3 py-3.5">
        <span className="rounded-full border border-bone/15 bg-bone/[0.03] px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-bone/70">
          {row.state}
        </span>
      </td>
      <td className="px-3 py-3.5 text-right font-mono text-[12.5px] text-bone">
        {fmtMoney(row.gross)}
      </td>
      <td className="px-3 py-3.5">
        {row.status === "ready" ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-moss-bright">
            <CheckCircle2 className="h-3 w-3" />
            Ready
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-champagne/40 bg-champagne/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-champagne-bright">
            <AlertTriangle className="h-3 w-3" />
            Pending TIN
          </span>
        )}
      </td>
    </tr>
  );
}

function roleClasses(role: CrewRow["role"]): string {
  switch (role) {
    case "Crew Chief":
      return "border border-moss/30 bg-moss/10 text-moss-bright";
    case "Field Tech":
      return "border border-champagne/30 bg-champagne/10 text-champagne-bright";
    case "Subcontractor":
      return "border border-bone/20 bg-transparent text-bone/75";
  }
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={cn(
        "px-3 py-3 font-semibold first:px-5 first:md:px-6",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          align === "right" && "ml-auto",
          active ? "text-champagne-bright" : "text-bone/45 hover:text-bone/70"
        )}
      >
        <span>{label}</span>
        <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}
