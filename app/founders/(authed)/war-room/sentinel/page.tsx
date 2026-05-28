// ---------------------------------------------------------------------------
// Founders Portal → Sentinel
// ---------------------------------------------------------------------------
// Live read-only dashboard for the local AWAIS / Sentinel stack:
//   * Current IQ score + 30-day trend
//   * Active learned patterns (most recent 50)
//   * Federation backlog vs. central HQ
//   * Recent Sentinel events (CRITICAL_FLOW_FAILED, SCHEMA_DRIFT_DETECTED,
//     TENANT_ISOLATION_BREACH, REMEDIATION_*, kill_chain, etc.)
//   * Locked-surface count
// ---------------------------------------------------------------------------

import { Shield, Activity, Zap, AlertTriangle, GitBranch } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import {
  latestIqScore,
  listRecentPatterns,
  listRecentEvents,
  countFederationBacklog,
  recentIqScores,
} from "@/lib/defense/store";
import { LOCKED_PATHS } from "@/lib/defense/locked-surface-guard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sentinel · GladiusTurf",
  robots: { index: false, follow: false },
};

function severityColor(severity: string): string {
  const s = severity.toUpperCase();
  if (s === "CRITICAL") return "bg-red-50 text-red-800 border-red-300";
  if (s === "WARN" || s === "WARNING")
    return "bg-amber-50 text-amber-800 border-amber-300";
  if (s === "INFO") return "bg-sky-50 text-sky-800 border-sky-300";
  return "bg-stone-50 text-stone-700 border-stone-300";
}

function formatTs(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function trendArrow(scores: { score: number }[]): string {
  if (scores.length < 2) return "→";
  const a = scores[0].score;
  const b = scores[1].score;
  if (a > b) return "↑";
  if (a < b) return "↓";
  return "→";
}

export default async function SentinelPage() {
  const [iq, history, patterns, events, backlog] = await Promise.all([
    latestIqScore(),
    recentIqScores(30),
    listRecentPatterns(50),
    listRecentEvents(50),
    countFederationBacklog(),
  ]);

  const score = iq?.score ?? 100;
  const arrow = trendArrow(history);
  const lockedCount = LOCKED_PATHS.length;
  const lockedWithSmokes = LOCKED_PATHS.filter(
    (l) => typeof l.smokeTest === "string" && l.smokeTest.length > 0,
  ).length;
  const breakdown = iq?.componentBreakdown ?? {};

  const minScore = history.length
    ? Math.min(...history.map((h) => h.score))
    : 100;
  const maxScore = history.length
    ? Math.max(...history.map((h) => h.score))
    : 100;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Sentinel"
        subtitle="Local AWAIS Sentinel — its own IQ, learning bank, and cross-fire to central HQ."
      />

      {/* Headline tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-stone-500">
            <Shield className="h-3.5 w-3.5" /> Sentinel IQ
          </div>
          <div className="text-3xl font-semibold tabular-nums text-stone-900">
            {score} <span className="text-base text-stone-400">{arrow}</span>
          </div>
          <div className="mt-1 text-xs text-stone-500">
            {iq ? `Last computed ${formatTs(iq.computedAt)}` : "Initial (day-0)"}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-stone-500">
            <Activity className="h-3.5 w-3.5" /> Learned Patterns
          </div>
          <div className="text-3xl font-semibold tabular-nums text-stone-900">
            {patterns.length}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            active in last 50
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-stone-500">
            <Zap className="h-3.5 w-3.5" /> Federation
          </div>
          <div className="text-3xl font-semibold tabular-nums text-stone-900">
            {backlog}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            events pending to HQ
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-stone-500">
            <GitBranch className="h-3.5 w-3.5" /> Locked Surfaces
          </div>
          <div className="text-3xl font-semibold tabular-nums text-stone-900">
            {lockedCount}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            {lockedWithSmokes} with active smoke tests
          </div>
        </div>
      </div>

      {/* IQ breakdown */}
      <section className="rounded-lg border border-stone-200 bg-white">
        <header className="border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-stone-900">
            IQ Component Breakdown
          </h2>
          <p className="text-xs text-stone-500">
            Each component 0–40. Total caps at 200.
          </p>
        </header>
        <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-5">
          {(
            [
              ["Corpus Depth", "corpusDepth"],
              ["Recency", "recency"],
              ["Federation Health", "federationHealth"],
              ["Critical Flows", "criticalFlows"],
              ["Module Density", "moduleDensity"],
            ] as const
          ).map(([label, key]) => {
            const v = (breakdown as Record<string, unknown>)[key];
            const n = typeof v === "number" ? v : 0;
            const pct = Math.min(100, Math.round((n / 40) * 100));
            return (
              <div key={key}>
                <div className="mb-1 text-xs text-stone-600">{label}</div>
                <div className="text-lg font-semibold tabular-nums text-stone-900">
                  {n}
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {history.length > 0 ? (
          <div className="border-t border-stone-100 px-4 py-3">
            <div className="mb-2 text-xs font-medium text-stone-600">
              30-day trend ({history.length} points · {minScore}–{maxScore})
            </div>
            <div className="flex h-16 items-end gap-0.5">
              {[...history].reverse().map((h, i) => {
                const range = Math.max(1, maxScore - minScore);
                const pct = Math.max(
                  8,
                  Math.round(((h.score - minScore) / range) * 100),
                );
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-emerald-400/70"
                    style={{ height: `${pct}%` }}
                    title={`${formatTs(h.computedAt)}: ${h.score}`}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {/* Patterns + events two-column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-stone-200 bg-white">
          <header className="border-b border-stone-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-900">
              Recent Learned Patterns
            </h2>
            <p className="text-xs text-stone-500">
              Long-lived attack signatures + IP memory rows. Sorted by most
              recently seen.
            </p>
          </header>
          <ul className="divide-y divide-stone-100">
            {patterns.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-stone-500">
                No learned patterns yet. As Sentinel observes traffic, IP
                memory rows and attack chains will appear here.
              </li>
            ) : (
              patterns.slice(0, 20).map((p) => (
                <li
                  key={p.patternKey}
                  className="flex items-center justify-between px-4 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-xs text-stone-900">
                      {p.patternKey}
                    </div>
                    <div className="text-xs text-stone-500">
                      hits: {p.hitCount} · accuracy:{" "}
                      {(p.accuracy * 100).toFixed(0)}% · last:{" "}
                      {formatTs(p.lastSeenAt)}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white">
          <header className="border-b border-stone-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-900">
              Recent Sentinel Events
            </h2>
            <p className="text-xs text-stone-500">
              Detections, remediations, drift, breaches. Cross-fired hourly
              to central HQ.
            </p>
          </header>
          <ul className="divide-y divide-stone-100">
            {events.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-stone-500">
                <AlertTriangle className="mx-auto mb-2 h-4 w-4 text-stone-400" />
                No Sentinel events yet. Critical-flow + schema + tenant scans
                will populate this feed once their crons run.
              </li>
            ) : (
              events.slice(0, 20).map((e) => (
                <li key={e.id} className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${severityColor(
                        e.severity,
                      )}`}
                    >
                      {e.severity}
                    </span>
                    <span className="truncate text-xs font-semibold text-stone-900">
                      {e.kind}
                    </span>
                    <span className="ml-auto whitespace-nowrap text-[10px] text-stone-500">
                      {formatTs(e.ts)}
                    </span>
                    <span
                      className={`rounded px-1 py-0.5 text-[10px] ${
                        e.federated
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {e.federated ? "HQ" : "queued"}
                    </span>
                  </div>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[11px] text-stone-500 hover:text-stone-700">
                      payload
                    </summary>
                    <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded bg-stone-50 p-2 text-[10px] text-stone-700">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  </details>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* Locked surfaces table */}
      <section className="rounded-lg border border-stone-200 bg-white">
        <header className="border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-stone-900">
            Locked Surfaces
          </h2>
          <p className="text-xs text-stone-500">
            Frozen paths. Modifications require the matching UNLOCK-* token
            in the commit body.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Label</th>
                <th className="px-3 py-2 text-left font-medium">Glob</th>
                <th className="px-3 py-2 text-left font-medium">
                  Unlock Token
                </th>
                <th className="px-3 py-2 text-left font-medium">Smoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {LOCKED_PATHS.map((l) => (
                <tr key={l.label}>
                  <td className="px-3 py-1.5 font-medium text-stone-900">
                    {l.label}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-stone-700">
                    {l.glob}
                  </td>
                  <td className="px-3 py-1.5">
                    <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">
                      {l.unlockToken}
                    </code>
                  </td>
                  <td className="px-3 py-1.5 text-stone-500">
                    {l.smokeTest ? "yes" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
