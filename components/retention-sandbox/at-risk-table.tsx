"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Clock,
  Inbox,
  Leaf,
  MessageSquare,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  AT_RISK_CUSTOMERS,
  type AtRiskCustomer,
  type RiskBucket,
  type SaveSignalKey,
  SIGNAL_LABEL,
} from "@/content/retention-demo-data";
import { SavePlayCard } from "./save-play-card";

const ICON: Record<SaveSignalKey, LucideIcon> = {
  "payment-lag": Clock,
  "reply-lag": MessageSquare,
  "revenue-down": TrendingDown,
  complaints: AlertCircle,
  "seasonal-lapse": Leaf,
  "slow-inbound": Inbox,
};

type Filter = "all" | RiskBucket;
type SortKey = "risk" | "spend" | "lastService" | "confidence" | "name";

const FILTER_LABEL: Record<Filter, string> = {
  all: "All",
  critical: "Critical (≥75)",
  high: "High (50-74)",
  watch: "Watch (25-49)",
};

const STORAGE_KEY = "gt:save-play-demo:saved-v1";

export function AtRiskTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  // Hydrate saved set from localStorage (sandbox state, never sent anywhere)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) setSavedIds(new Set(arr));
      }
    } catch {
      // ignore — sandbox is best-effort
    }
  }, []);

  const persistSaved = (next: Set<string>) => {
    setSavedIds(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // ignore
    }
  };

  const handleMarkSaved = (id: string) => {
    const next = new Set(savedIds);
    next.add(id);
    persistSaved(next);
  };

  const triggerToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const filtered = useMemo(() => {
    const rows = AT_RISK_CUSTOMERS.filter((c) =>
      filter === "all" ? true : c.bucket === filter,
    );

    const sign = sortDir === "asc" ? 1 : -1;
    const cmp = (a: AtRiskCustomer, b: AtRiskCustomer): number => {
      switch (sortKey) {
        case "risk":
          return (a.riskScore - b.riskScore) * sign;
        case "spend":
          return (a.monthlySpend - b.monthlySpend) * sign;
        case "confidence":
          return (a.confidence - b.confidence) * sign;
        case "name":
          return a.name.localeCompare(b.name) * sign;
        case "lastService":
          // sort by string is fine for the demo (Apr/Mar dates)
          return a.lastService.localeCompare(b.lastService) * sign;
        default:
          return 0;
      }
    };
    return [...rows].sort(cmp);
  }, [filter, sortKey, sortDir]);

  const open = openId
    ? AT_RISK_CUSTOMERS.find((c) => c.id === openId) ?? null
    : null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "lastService" ? "asc" : "desc");
    }
  };

  const counts = useMemo(() => {
    const totals: Record<Filter, number> = {
      all: AT_RISK_CUSTOMERS.length,
      critical: 0,
      high: 0,
      watch: 0,
    };
    for (const c of AT_RISK_CUSTOMERS) totals[c.bucket]++;
    return totals;
  }, []);

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
              filter === f
                ? "border-champagne/50 bg-champagne/15 text-champagne-bright"
                : "border-bone/15 bg-bone/[0.03] text-bone/65 hover:border-bone/25 hover:text-bone",
            )}
          >
            {FILTER_LABEL[f]}
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[10px]",
                filter === f
                  ? "bg-champagne/25 text-champagne-bright"
                  : "bg-bone/[0.06] text-bone/55",
              )}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-bone/10 bg-obsidian/60 shadow-pop">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-bone/10 text-[10px] uppercase tracking-[0.18em] text-bone/45">
                <ThSort
                  active={sortKey === "name"}
                  dir={sortDir}
                  onClick={() => toggleSort("name")}
                  className="px-5 py-3"
                >
                  Customer
                </ThSort>
                <ThSort
                  active={sortKey === "risk"}
                  dir={sortDir}
                  onClick={() => toggleSort("risk")}
                  className="px-3 py-3"
                >
                  Risk score
                </ThSort>
                <th scope="col" className="px-3 py-3 font-medium">
                  Signals
                </th>
                <ThSort
                  active={sortKey === "lastService"}
                  dir={sortDir}
                  onClick={() => toggleSort("lastService")}
                  className="px-3 py-3"
                >
                  Last service
                </ThSort>
                <ThSort
                  active={sortKey === "spend"}
                  dir={sortDir}
                  onClick={() => toggleSort("spend")}
                  className="px-3 py-3 text-right"
                  align="right"
                >
                  Spend / mo
                </ThSort>
                <ThSort
                  active={sortKey === "confidence"}
                  dir={sortDir}
                  onClick={() => toggleSort("confidence")}
                  className="px-3 py-3 text-right"
                  align="right"
                >
                  Walk confidence
                </ThSort>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-bone/[0.06] transition-colors last:border-b-0 hover:bg-bone/[0.02]"
                >
                  {/* Customer */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-[15px] font-semibold text-bone">
                        {c.name}
                      </span>
                      {savedIds.has(c.id) ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-moss/30 bg-moss/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.18em] text-moss-bright"
                          title="Marked as saved in this sandbox"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          saved
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-[11px] text-bone/45">
                      {c.segment}
                    </div>
                  </td>

                  {/* Risk score */}
                  <td className="px-3 py-4">
                    <RiskCell score={c.riskScore} bucket={c.bucket} />
                  </td>

                  {/* Signals */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5">
                      {c.signals.map((s) => {
                        const Icon = ICON[s.key];
                        return (
                          <span
                            key={s.key}
                            title={SIGNAL_LABEL[s.key]}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-champagne/25 bg-champagne/[0.06] text-champagne-bright"
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Last service */}
                  <td className="px-3 py-4 font-mono text-[12px] text-bone/75">
                    {c.lastService}
                  </td>

                  {/* Spend */}
                  <td className="px-3 py-4 text-right font-mono text-[13px] text-bone">
                    ${c.monthlySpend.toLocaleString()}
                  </td>

                  {/* Confidence */}
                  <td className="px-3 py-4 text-right font-mono text-[13px] text-bone/85">
                    {c.confidence}%
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenId(c.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-champagne-bright/40 bg-champagne/[0.05] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-champagne-bright transition-colors hover:border-champagne-bright hover:bg-champagne/15"
                    >
                      Open save play
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-[13px] text-bone/55"
                  >
                    No customers in this bucket. Filter another tier above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {open ? (
        <SavePlayCard
          customer={open}
          onClose={() => setOpenId(null)}
          onMarkSaved={handleMarkSaved}
          onToast={triggerToast}
        />
      ) : null}

      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 transform rounded-full border border-moss/40 bg-slate-deep px-4 py-2 text-sm text-moss-bright shadow-pop"
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </span>
        </div>
      ) : null}
    </>
  );
}

function ThSort({
  children,
  active,
  dir,
  onClick,
  className,
  align,
}: {
  children: React.ReactNode;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
  align?: "right";
}) {
  return (
    <th scope="col" className={cn("font-medium", className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors hover:text-bone",
          active ? "text-champagne-bright" : "text-bone/45",
          align === "right" ? "ml-auto" : "",
        )}
      >
        {children}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-60" />
        )}
      </button>
    </th>
  );
}

function RiskCell({ score, bucket }: { score: number; bucket: RiskBucket }) {
  const palette =
    bucket === "critical"
      ? {
          bar: "bg-honey-bright",
          pill: "border-honey/40 bg-honey/15 text-honey-bright",
          track: "bg-honey/10",
        }
      : bucket === "high"
        ? {
            bar: "bg-champagne-bright",
            pill: "border-champagne/40 bg-champagne/15 text-champagne-bright",
            track: "bg-champagne/10",
          }
        : {
            bar: "bg-bone/60",
            pill: "border-bone/20 bg-bone/[0.06] text-bone/85",
            track: "bg-bone/[0.06]",
          };

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "inline-flex min-w-[42px] justify-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold",
          palette.pill,
        )}
      >
        {score}
      </span>
      <div className={cn("h-1.5 w-20 overflow-hidden rounded-full", palette.track)}>
        <div
          className={cn("h-full rounded-full", palette.bar)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
