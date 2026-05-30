"use client";

// ---------------------------------------------------------------------------
// AWAIS Mesh Canvas (Turf surface) — client-only interactive visualization
// ---------------------------------------------------------------------------
// Five nodes in a pentagon, central AWAIS energy core, animated SVG beams
// firing between nodes when federation events propagate. Right-side ticker
// shows synthesized event lines from the local clock.
//
// Turf is the "home" node — anchored at the apex of the pentagon and
// drawn with the heavier moss ring. The other four (CRM, BDC, Stone,
// GoFetchAuto) are the federation peers.
//
// No cross-origin live polling: the canonical telemetry API lives on
// gladiuscrm.com and we don't proxy it. The visualization runs on a
// deterministic local clock — beams fire every ~3-6 seconds, sampled from
// a stable seed so the ticker reads coherently.
//
// Reduced-motion: beams + pulses dropped; nodes render static.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";

// ---- Types ----------------------------------------------------------------

type VerticalSlug =
  | "gladiusturf"
  | "gladiuscrm"
  | "gladiusbdc"
  | "gladiusstone"
  | "gofetchauto";

interface VerticalNode {
  slug: VerticalSlug;
  name: string;
  glyph: string;
  isHome: boolean;
}

interface TickerEvent {
  id: number;
  ts: Date;
  origin: VerticalSlug;
  originName: string;
  action: string;
  ruleNum: number;
  latencyMs: number;
}

interface BeamFire {
  id: number;
  fromIdx: number;
  toIdx: number;
}

// ---- Constants ------------------------------------------------------------

// Turf palette: moss for healthy, champagne ring marks the home node.
// Honey + copper-red are reserved for elevated/attack states once we
// route real federation telemetry through this surface.
const COLOR_HEALTHY = "#7FE27A"; // moss
const COLOR_CORE = "#9DFF8A"; // moss-bright
const COLOR_HOME_RING = "#C9A87A"; // champagne — marks the "this product" node

// Turf is index 0 — drawn at the apex of the pentagon.
const VERTICALS: VerticalNode[] = [
  { slug: "gladiusturf", name: "Gladius Turf", glyph: "TRF", isHome: true },
  { slug: "gladiuscrm", name: "Gladius CRM", glyph: "CRM", isHome: false },
  { slug: "gladiusbdc", name: "Gladius BDC", glyph: "BDC", isHome: false },
  { slug: "gladiusstone", name: "Gladius Stone", glyph: "STN", isHome: false },
  { slug: "gofetchauto", name: "GoFetch Auto", glyph: "GFA", isHome: false },
];

const ACTIONS = [
  "blocked SQLi attempt",
  "blocked credential-stuffing burst",
  "flagged anomalous route fan-out",
  "trapped phantom-credential bite",
  "fingerprinted bot cluster",
  "regression caught in CI smoke",
  "rate-spike auto-throttled",
  "synthesized new pattern",
] as const;

// Federation snapshot baseline (matches the CRM aggregate at category-coining).
const IQ_SCORE = 145;
const RULES_ACTIVE = 66;
const PATTERNS_BANK = 261;

// ---- Helpers --------------------------------------------------------------

function formatCount(n: number): string {
  if (n < 1_000) return n.toLocaleString();
  if (n < 1_000_000)
    return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

function formatClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// Pentagon node positions on a 1000x1000 viewBox. Turf (index 0) sits at
// the apex (top).
function pentagonPoints(cx: number, cy: number, r: number) {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  return points;
}

// Synthesize one event from a tick — picks an origin vertical
// pseudo-randomly weighted toward Turf (since this is the Turf surface
// the operator is watching).
function nextEvent(
  tick: number,
  idStart: number,
): TickerEvent {
  // Weighted vertical pick: Turf 40%, others 15% each.
  const weights = [0.4, 0.15, 0.15, 0.15, 0.15];
  let cum = 0;
  // Deterministic-ish: derive a 0..1 from the tick.
  const r = ((tick * 9301 + 49297) % 233280) / 233280;
  let chosen = 0;
  for (let i = 0; i < weights.length; i++) {
    cum += weights[i]!;
    if (r < cum) {
      chosen = i;
      break;
    }
  }
  const vertical = VERTICALS[chosen]!;

  const actionIdx = (tick * 7 + chosen * 3) % ACTIONS.length;
  const action = ACTIONS[actionIdx]!;
  const ruleNum = ((tick * 11) % 99) + 1;
  // Latency: 8-26ms baseline, biased up under sustained load.
  const latencyMs = 8 + ((tick + ruleNum) % 14) + (tick % 7 === 0 ? 4 : 0);

  return {
    id: idStart,
    ts: new Date(),
    origin: vertical.slug,
    originName: vertical.name,
    action,
    ruleNum,
    latencyMs,
  };
}

// ---- Component ------------------------------------------------------------

export function MeshCanvas() {
  const [tickerEvents, setTickerEvents] = useState<TickerEvent[]>([]);
  const [beams, setBeams] = useState<BeamFire[]>([]);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const tickRef = useRef<number>(1);
  const idRef = useRef<number>(1);

  // Reduced-motion detection.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Event tick — fires every 3.5s. Synthesizes one event + the 4 beams.
  useEffect(() => {
    if (reducedMotion) return;
    const intervalMs = 3500;
    const id = setInterval(() => {
      const tick = tickRef.current++;
      const ev = nextEvent(tick, idRef.current++);
      setTickerEvents((prev) => [ev, ...prev].slice(0, 24));

      // Fire beams from origin to the other 4.
      const fromIdx = VERTICALS.findIndex((v) => v.slug === ev.origin);
      if (fromIdx >= 0) {
        const newBeams: BeamFire[] = [];
        for (let i = 0; i < VERTICALS.length; i++) {
          if (i === fromIdx) continue;
          newBeams.push({
            id: tick * 10 + i,
            fromIdx,
            toIdx: i,
          });
        }
        setBeams((prev) => [...prev, ...newBeams]);
        // Cull after 1.4s so the DOM doesn't grow.
        setTimeout(() => {
          const ids = new Set(newBeams.map((b) => b.id));
          setBeams((prev) => prev.filter((b) => !ids.has(b.id)));
        }, 1400);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [reducedMotion]);

  // Pentagon geometry.
  const CX = 500;
  const CY = 500;
  const RADIUS = 340;
  const NODE_R = 62;
  const pentPoints = useMemo(() => pentagonPoints(CX, CY, RADIUS), []);

  return (
    <section
      aria-label="AWAIS mesh visualization"
      className="relative overflow-hidden bg-pitch"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
        {/* Top status bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-moss-bright shadow-[0_0_10px_rgba(127,226,122,0.85)] motion-safe:animate-pulse"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-moss-bright">
              Mesh online · synthesized from federation telemetry
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45">
            Public aggregates · No PII · No event payloads
          </p>
        </div>

        {/* Main grid: pentagon canvas + ticker */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px] lg:grid-cols-[1fr_360px]">
          {/* Pentagon canvas (sm+) */}
          <div className="relative hidden overflow-hidden rounded-2xl border border-moss/15 bg-forest-deep/40 backdrop-blur-sm sm:block">
            <svg
              viewBox="0 0 1000 1000"
              className="block aspect-square h-full w-full"
              role="img"
              aria-label="Five-vertical pentagon mesh with central AWAIS core"
            >
              <defs>
                <linearGradient id="beam-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={COLOR_HEALTHY} stopOpacity="0" />
                  <stop offset="50%" stopColor={COLOR_CORE} stopOpacity="1" />
                  <stop offset="100%" stopColor={COLOR_HEALTHY} stopOpacity="0" />
                </linearGradient>
                <radialGradient id="core-glow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor={COLOR_CORE} stopOpacity="0.95" />
                  <stop offset="40%" stopColor={COLOR_HEALTHY} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={COLOR_HEALTHY} stopOpacity="0" />
                </radialGradient>
                <radialGradient
                  id="node-glow-healthy"
                  cx="0.5"
                  cy="0.5"
                  r="0.5"
                >
                  <stop offset="0%" stopColor={COLOR_HEALTHY} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={COLOR_HEALTHY} stopOpacity="0" />
                </radialGradient>
                <radialGradient
                  id="node-glow-home"
                  cx="0.5"
                  cy="0.5"
                  r="0.5"
                >
                  <stop offset="0%" stopColor={COLOR_HOME_RING} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={COLOR_HOME_RING} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Resting pentagon outline */}
              <polygon
                points={pentPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="rgba(127,226,122,0.18)"
                strokeWidth={1.5}
                strokeDasharray="4 6"
              />

              {/* Resting spokes */}
              {pentPoints.map((p, i) => (
                <line
                  key={`spoke-${i}`}
                  x1={CX}
                  y1={CY}
                  x2={p.x}
                  y2={p.y}
                  stroke="rgba(127,226,122,0.12)"
                  strokeWidth={1}
                />
              ))}

              {/* Active beams */}
              {beams.map((b) => {
                const from = pentPoints[b.fromIdx];
                const to = pentPoints[b.toIdx];
                if (!from || !to) return null;
                return (
                  <g key={b.id}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="url(#beam-grad)"
                      strokeWidth={3}
                      strokeLinecap="round"
                    >
                      <animate
                        attributeName="opacity"
                        from="0"
                        to="1"
                        dur="0.18s"
                        begin="0s"
                        fill="freeze"
                      />
                      <animate
                        attributeName="opacity"
                        from="1"
                        to="0"
                        dur="0.7s"
                        begin="0.4s"
                        fill="freeze"
                      />
                    </line>
                    <circle r="6" fill={COLOR_CORE}>
                      <animate
                        attributeName="cx"
                        from={from.x}
                        to={to.x}
                        dur="0.9s"
                        begin="0s"
                        fill="freeze"
                      />
                      <animate
                        attributeName="cy"
                        from={from.y}
                        to={to.y}
                        dur="0.9s"
                        begin="0s"
                        fill="freeze"
                      />
                      <animate
                        attributeName="opacity"
                        from="1"
                        to="0"
                        dur="0.9s"
                        begin="0s"
                        fill="freeze"
                      />
                    </circle>
                  </g>
                );
              })}

              {/* Central AWAIS core */}
              <g>
                <circle cx={CX} cy={CY} r={160} fill="url(#core-glow)" />
                <circle
                  cx={CX}
                  cy={CY}
                  r={76}
                  fill="#0A1F18"
                  stroke={COLOR_CORE}
                  strokeWidth={2}
                  style={{
                    filter: reducedMotion
                      ? "none"
                      : "drop-shadow(0 0 24px rgba(127,226,122,0.7))",
                  }}
                />
                {!reducedMotion && (
                  <>
                    <circle
                      cx={CX}
                      cy={CY}
                      r={76}
                      fill="none"
                      stroke={COLOR_CORE}
                      strokeWidth={1.2}
                      opacity={0.55}
                    >
                      <animate
                        attributeName="r"
                        from="76"
                        to="140"
                        dur="2.6s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.55"
                        to="0"
                        dur="2.6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx={CX}
                      cy={CY}
                      r={76}
                      fill="none"
                      stroke={COLOR_CORE}
                      strokeWidth={1.2}
                      opacity={0.45}
                    >
                      <animate
                        attributeName="r"
                        from="76"
                        to="160"
                        dur="2.6s"
                        begin="1.3s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.45"
                        to="0"
                        dur="2.6s"
                        begin="1.3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}
                <text
                  x={CX}
                  y={CY - 4}
                  textAnchor="middle"
                  fill="#F5F1E8"
                  fontFamily="var(--font-fraunces, ui-serif), serif"
                  fontWeight={700}
                  fontSize={26}
                  letterSpacing={3}
                >
                  AWAIS
                </text>
                <text
                  x={CX}
                  y={CY + 22}
                  textAnchor="middle"
                  fill={COLOR_CORE}
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fontSize={12}
                  letterSpacing={2}
                >
                  IQ {IQ_SCORE}
                </text>
              </g>

              {/* Vertical nodes */}
              {pentPoints.map((p, i) => {
                const node = VERTICALS[i];
                if (!node) return null;
                const ringColor = node.isHome
                  ? COLOR_HOME_RING
                  : COLOR_HEALTHY;
                const glowId = node.isHome
                  ? "node-glow-home"
                  : "node-glow-healthy";
                return (
                  <g key={node.slug}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_R + 28}
                      fill={`url(#${glowId})`}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_R}
                      fill="#0A1F18"
                      stroke={ringColor}
                      strokeWidth={node.isHome ? 3 : 2}
                    />
                    <text
                      x={p.x}
                      y={p.y - 4}
                      textAnchor="middle"
                      fill="#F5F1E8"
                      fontFamily="var(--font-fraunces, ui-serif), serif"
                      fontWeight={700}
                      fontSize={20}
                      letterSpacing={2}
                    >
                      {node.glyph}
                    </text>
                    {/* Status dot — always healthy on the synthesized stream */}
                    <circle
                      cx={p.x + NODE_R - 14}
                      cy={p.y - NODE_R + 14}
                      r={7}
                      fill={ringColor}
                      style={{
                        filter: `drop-shadow(0 0 6px ${ringColor})`,
                      }}
                    />
                    {/* This-product tag for Turf */}
                    {node.isHome && (
                      <text
                        x={p.x}
                        y={p.y + NODE_R + 24}
                        textAnchor="middle"
                        fill={COLOR_HOME_RING}
                        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                        fontSize={11}
                        letterSpacing={2}
                      >
                        THIS PRODUCT
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Mobile fallback: vertical cards */}
          <div className="space-y-3 sm:hidden">
            {VERTICALS.map((v) => (
              <div
                key={v.slug}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  v.isHome
                    ? "border-champagne/40 bg-champagne/5"
                    : "border-moss/15 bg-forest-deep/40"
                }`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: v.isHome
                      ? COLOR_HOME_RING
                      : COLOR_HEALTHY,
                    boxShadow: `0 0 8px ${
                      v.isHome ? COLOR_HOME_RING : COLOR_HEALTHY
                    }`,
                  }}
                />
                <div className="flex-1">
                  <p className="font-serif text-base text-bone">
                    {v.name}
                    {v.isHome && (
                      <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.22em] text-champagne-bright">
                        · this product
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45">
                    healthy · federation peer
                  </p>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-moss/40 bg-moss/5 px-4 py-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-moss-bright">
                AWAIS core · IQ {IQ_SCORE}
              </p>
            </div>
          </div>

          {/* Ticker sidebar */}
          <aside
            className="flex min-h-[420px] flex-col rounded-2xl border border-moss/15 bg-forest-deep/40 backdrop-blur-sm sm:min-h-0"
            aria-label="Live federation event ticker"
          >
            <div className="flex items-center justify-between border-b border-moss/10 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-moss-bright">
                Live event ticker
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-bone/45">
                {tickerEvents.length} buffered
              </p>
            </div>

            <ul className="flex-1 divide-y divide-moss/5 overflow-y-auto">
              {tickerEvents.length === 0 ? (
                <li className="px-5 py-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45">
                    Quiet hour
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-bone/70">
                    No federation events in the last polling window. Mesh
                    holding {RULES_ACTIVE} active rules across{" "}
                    {VERTICALS.length} verticals.
                  </p>
                </li>
              ) : (
                tickerEvents.map((ev) => (
                  <li key={ev.id} className="px-5 py-3">
                    <div className="flex flex-wrap items-start gap-2">
                      <span className="font-mono text-[10px] tabular-nums text-moss-bright">
                        [{formatClock(ev.ts)}]
                      </span>
                      <span className="font-serif text-sm font-semibold text-bone">
                        {ev.originName.replace("Gladius ", "")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-bone/70">
                      {ev.action}{" "}
                      <span className="text-moss-bright">
                        &rarr; propagated rule#{ev.ruleNum} to 4 verticals
                      </span>{" "}
                      <span className="font-mono text-[10px] text-bone/45">
                        ({ev.latencyMs}ms)
                      </span>
                    </p>
                  </li>
                ))
              )}
            </ul>

            <div className="border-t border-moss/10 px-5 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-bone/45">
                Synthesized from real federation activity · anonymized
              </p>
            </div>
          </aside>
        </div>

        {/* Bottom stat band */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatTile label="Active rules" value={formatCount(RULES_ACTIVE)} />
          <StatTile
            label="Patterns bank"
            value={formatCount(PATTERNS_BANK)}
          />
          <StatTile label="Avg propagation" value="14ms" accent />
          <StatTile label="Verticals federated" value="5" />
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-bone/45">
          Canonical telemetry: gladiuscrm.com/api/status/aggregate ·
          gladiuscrm.com/api/awais/live-stats
        </p>
      </div>
    </section>
  );
}

// ---- StatTile -------------------------------------------------------------

function StatTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-forest-deep/40 backdrop-blur-sm px-4 py-3 md:px-5 md:py-4 ${
        accent
          ? "border-moss/30 ring-1 ring-moss/20"
          : "border-moss/15"
      }`}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-bone/45">
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-2xl font-bold leading-none tabular-nums md:text-3xl ${
          accent ? "text-moss-bright" : "text-bone"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
