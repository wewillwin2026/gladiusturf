// ---------------------------------------------------------------------------
// GladiusDefense — Kill Chain Reconstruction (mechanism #20)
// ---------------------------------------------------------------------------
// When a campaign closes (no events from any of its IPs for `idleMs`), emit a
// structured timeline narrative. Maps each event to a Lockheed Martin Cyber
// Kill Chain stage (recon → weaponization → delivery → exploitation →
// installation → C2 → actions-on-objectives) by lightweight pattern rules
// over path + status code + ruleMatches.
//
// Output: per-campaign post-mortem with full timeline + stage summary.
//
// Example:
//   const out = runKillChain({ events, windowMs: 86400000, idleMs: 30*60_000 });
//   out.findings[0].payload → {
//     campaignId, archetype, ips: [...],
//     timeline: [
//       { t:"...", stage:"reconnaissance", path:"/robots.txt", ... },
//       ...
//     ],
//     stages: { reconnaissance: 4, exploitation: 2, ... },
//     duration: "12m 34s", peakRate: 8.4 (req/min)
//   }
// ---------------------------------------------------------------------------

import type { Archetype, DefenseEvent } from "./types";

export type KillChainStage =
  | "reconnaissance"
  | "weaponization"
  | "delivery"
  | "exploitation"
  | "installation"
  | "command_control"
  | "actions";

export interface KillChainInput {
  events: DefenseEvent[];
  windowMs: number;
  /** A campaign is "closed" if no IP from it has been active in this long. */
  idleMs?: number;
}

export interface KillChainFinding {
  kind: "kill_chain";
  severity: number;
  payload: {
    campaignKey: string;
    archetype: Archetype | "unknown";
    ips: string[];
    eventCount: number;
    startTime: string;
    endTime: string;
    durationSec: number;
    durationLabel: string;
    timeline: Array<{
      t: string;
      ip: string;
      stage: KillChainStage;
      path: string;
      score: number;
    }>;
    stages: Record<KillChainStage, number>;
    peakReqPerMin: number;
    narrative: string;
  };
}

export interface KillChainOutput {
  findings: KillChainFinding[];
  meta: { processedCount: number; durationMs: number };
}

const DEFAULT_IDLE_MS = 30 * 60 * 1000; // 30 minutes

// ─── Stage classifier ─────────────────────────────────────────────────────
// Order matters: first match wins. Keep specific → general.

interface StageRule {
  stage: KillChainStage;
  test: (e: DefenseEvent) => boolean;
}

const RECON_PATTERNS =
  /^\/(robots\.txt|sitemap(\.xml)?|\.well-known|favicon\.ico|crossdomain\.xml)$/i;
const WEAPONIZATION_PATTERNS = /(\.env|\.git|\.svn|\.htaccess|\.bak|backup|config\.php|database\.yml|wp-config\.php)/i;
const DELIVERY_PATTERNS =
  /(\/(login|wp-login|admin\/login|user\/login|signin)|\/api\/auth)/i;
const EXPLOITATION_PATTERNS =
  /(\?|&)(\w+=(\s|%20)*(select|union|drop|update|insert|delete)\s|<script|onerror=|javascript:|\.\.\/)/i;
const SQLI_BODY_PATTERN = /(union\s+select|or\s+1=1|--\s|;--|sleep\(|benchmark\()/i;
const XSS_BODY_PATTERN = /(<script|<svg|onerror=|javascript:)/i;
const INSTALL_PATTERNS = /(shell\.php|c99|r57|cmd=|webshell|backdoor)/i;
const C2_PATTERNS = /(callback|beacon|heartbeat|telemetry)/i;
const ACTIONS_PATTERNS = /(\/api\/(users?|customers?|leads?|export)|\/admin\/users|\/dump)/i;

const STAGE_RULES: StageRule[] = [
  { stage: "installation", test: (e) => INSTALL_PATTERNS.test(e.path) || (e.body !== null && INSTALL_PATTERNS.test(e.body)) },
  {
    stage: "exploitation",
    test: (e) =>
      EXPLOITATION_PATTERNS.test(e.path) ||
      (e.body !== null && (SQLI_BODY_PATTERN.test(e.body) || XSS_BODY_PATTERN.test(e.body))),
  },
  { stage: "command_control", test: (e) => C2_PATTERNS.test(e.path) },
  { stage: "actions", test: (e) => ACTIONS_PATTERNS.test(e.path) && e.statusCode >= 200 && e.statusCode < 300 },
  { stage: "weaponization", test: (e) => WEAPONIZATION_PATTERNS.test(e.path) },
  { stage: "delivery", test: (e) => DELIVERY_PATTERNS.test(e.path) && e.method === "POST" },
  { stage: "reconnaissance", test: (e) => RECON_PATTERNS.test(e.path) || e.method === "OPTIONS" || (e.statusCode === 404 && e.method === "GET") },
];

function classifyStage(e: DefenseEvent): KillChainStage {
  for (const r of STAGE_RULES) {
    if (r.test(e)) return r.stage;
  }
  return "reconnaissance";
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

function peakRatePerMin(events: DefenseEvent[]): number {
  if (events.length < 2) return events.length;
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  let peak = 0;
  let left = 0;
  for (let right = 0; right < sorted.length; right++) {
    const rt = new Date(sorted[right].timestamp).getTime();
    while (
      left < right &&
      rt - new Date(sorted[left].timestamp).getTime() > 60_000
    ) {
      left++;
    }
    const count = right - left + 1;
    if (count > peak) peak = count;
  }
  return peak;
}

function buildNarrative(payload: {
  archetype: string;
  ips: string[];
  eventCount: number;
  durationLabel: string;
  stages: Record<KillChainStage, number>;
  peakReqPerMin: number;
}): string {
  const stageOrder: KillChainStage[] = [
    "reconnaissance",
    "weaponization",
    "delivery",
    "exploitation",
    "installation",
    "command_control",
    "actions",
  ];
  const stagesHit = stageOrder.filter((s) => payload.stages[s] > 0);
  const ipStr =
    payload.ips.length === 1
      ? `IP ${payload.ips[0]}`
      : `${payload.ips.length} IPs`;
  return (
    `[POST-MORTEM] ${payload.archetype} campaign from ${ipStr}: ` +
    `${payload.eventCount} events over ${payload.durationLabel}, peak ${payload.peakReqPerMin} req/min. ` +
    `Stages: ${stagesHit.join(" → ")}. ` +
    `${payload.stages.exploitation + payload.stages.installation + payload.stages.actions > 0 ? "ESCALATION OBSERVED — exploitation or beyond." : "Limited to recon/probe."}`
  );
}

/**
 * Reconstruct kill chains for campaigns that have idled out.
 *
 * Groups by archetype + IP cluster; emits one finding per closed campaign.
 * Pure function — caller persists.
 */
export function runKillChain(input: KillChainInput): KillChainOutput {
  const startedAt = Date.now();
  const idleMs = input.idleMs ?? DEFAULT_IDLE_MS;
  const findings: KillChainFinding[] = [];

  // Group by (archetype, ip-cluster). For simplicity, cluster = single IP.
  // Multi-IP campaigns are picked up by campaigns.ts; here we focus on
  // reconstructing the per-IP kill chain.
  type Bucket = { ip: string; archetype: Archetype | "unknown"; events: DefenseEvent[] };
  const buckets = new Map<string, Bucket>();
  for (const ev of input.events) {
    if (!ev.ip) continue;
    const arch: Archetype | "unknown" = ev.archetype ?? "unknown";
    const key = `${arch}|${ev.ip}`;
    let b = buckets.get(key);
    if (!b) {
      b = { ip: ev.ip, archetype: arch, events: [] };
      buckets.set(key, b);
    }
    b.events.push(ev);
  }

  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.events.length < 2) continue;
    const sorted = bucket.events.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const lastTs = new Date(sorted[sorted.length - 1].timestamp).getTime();
    if (now - lastTs < idleMs) continue; // still active, skip

    const stages: Record<KillChainStage, number> = {
      reconnaissance: 0,
      weaponization: 0,
      delivery: 0,
      exploitation: 0,
      installation: 0,
      command_control: 0,
      actions: 0,
    };
    const timeline = sorted.map((e) => {
      const stage = classifyStage(e);
      stages[stage]++;
      return {
        t: e.timestamp,
        ip: e.ip,
        stage,
        path: e.path,
        score: e.threatScore,
      };
    });

    const startTime = sorted[0].timestamp;
    const endTime = sorted[sorted.length - 1].timestamp;
    const durationSec = Math.max(
      0,
      Math.round(
        (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000,
      ),
    );
    const durationLabel = formatDuration(durationSec);
    const peak = peakRatePerMin(sorted);

    const escalation =
      stages.exploitation + stages.installation + stages.actions;
    const severity = Math.min(
      1,
      0.2 +
        Math.min(0.4, escalation / 5) +
        Math.min(0.2, sorted.length / 50) +
        Math.min(0.2, peak / 30),
    );

    findings.push({
      kind: "kill_chain",
      severity,
      payload: {
        campaignKey: key,
        archetype: bucket.archetype,
        ips: [bucket.ip],
        eventCount: sorted.length,
        startTime,
        endTime,
        durationSec,
        durationLabel,
        timeline,
        stages,
        peakReqPerMin: peak,
        narrative: buildNarrative({
          archetype: bucket.archetype,
          ips: [bucket.ip],
          eventCount: sorted.length,
          durationLabel,
          stages,
          peakReqPerMin: peak,
        }),
      },
    });
  }

  return {
    findings,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - startedAt,
    },
  };
}
