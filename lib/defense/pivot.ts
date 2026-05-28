// ---------------------------------------------------------------------------
// GladiusDefense — Mid-Strike Pivot Engine (mechanism #29)
// ---------------------------------------------------------------------------
// Tabular Q-learning over the response-action space.
//
// State is a 4-tuple (discretized):
//   - attack_type ∈ {recon, credstuff, app_attack, apt, unknown}  (5)
//   - phase       ∈ {early, mid, late}                            (3)
//   - intensity   ∈ {low, medium, high}                           (3)
//   - confidence  ∈ {low, medium, high}                           (3)
// → 5 × 3 × 3 × 3 = 135 states.
//
// Actions (8):
//   0 observe        — do nothing, log
//   1 flag           — annotate; no effect on traffic
//   2 challenge      — request JS challenge
//   3 tarpit         — slow response
//   4 honeypot       — redirect to honeypot path
//   5 phantom        — phantom redirect with fake success
//   6 block          — hard 403
//   7 escalate       — alert ops
//
// Update rule (per training tuple):
//   Q(s,a) ← Q(s,a) + α·[R + γ·max_a' Q(s',a') − Q(s,a)]
//
// Reward function (the heart of the mechanism):
//   +1.0 if action blocked a bad event (threatScore > 0.5)
//   −0.5 if action blocked a good event (threatScore ≤ 0.5)
//   +0.2 if action observed a bad event (no harm done but missed escalation)
//   +0.0 otherwise
//
// We do one episode per IP — sweep their events chronologically, treating
// (state_t, action_taken, reward, state_{t+1}) as the SARSA tuple where
// "action_taken" comes from event.action when present, else inferred.
//
// Output: the learned Q-table (sparse), top-K state→action pairs, and per-
// IP recommended action right now.
//
// Pure function. Caller persists Q-table snapshot.
//
// Example:
//   const out = runPivot({ events, windowMs: 24*3600*1000, alpha:0.3, gamma:0.9 });
//   out.findings[0].payload → {
//     ip:"1.1.1.1", currentState:[3,1,2,1], recommended:"block",
//     qValues:{...}, exploration:false
//   }
// ---------------------------------------------------------------------------

import type { Archetype, DefenseAction, DefenseEvent } from "./types";

const ATTACK_TYPES = ["recon", "credstuff", "app_attack", "apt", "unknown"] as const;
const PHASES = ["early", "mid", "late"] as const;
const INTENSITIES = ["low", "medium", "high"] as const;
const CONFIDENCES = ["low", "medium", "high"] as const;

type AttackType = (typeof ATTACK_TYPES)[number];
type Phase = (typeof PHASES)[number];
type Intensity = (typeof INTENSITIES)[number];
type Confidence = (typeof CONFIDENCES)[number];

export const PIVOT_ACTIONS = [
  "observe",
  "flag",
  "challenge",
  "tarpit",
  "honeypot",
  "phantom",
  "block",
  "escalate",
] as const;
export type PivotAction = (typeof PIVOT_ACTIONS)[number];

export interface PivotInput {
  events: DefenseEvent[];
  windowMs: number;
  /** Learning rate. Default 0.3. */
  alpha?: number;
  /** Discount factor. Default 0.9. */
  gamma?: number;
  /** Optional warm-start Q-table from a previous run. */
  seedQ?: Record<string, number[]>;
}

export interface PivotFinding {
  kind: "pivot";
  severity: number;
  payload: {
    ip: string;
    archetype: Archetype | "unknown";
    state: [number, number, number, number]; // discretized
    stateLabel: {
      attackType: AttackType;
      phase: Phase;
      intensity: Intensity;
      confidence: Confidence;
    };
    recommended: PivotAction;
    expectedQ: number;
    qVector: number[];
    eventCount: number;
  };
}

export interface PivotOutput {
  findings: PivotFinding[];
  qTable: Record<string, number[]>; // stateKey -> Q vector
  meta: { processedCount: number; durationMs: number; statesVisited: number };
}

function discretizeIntensity(eventsPerMin: number): number {
  if (eventsPerMin < 2) return 0;
  if (eventsPerMin < 10) return 1;
  return 2;
}

function discretizeConfidence(meanScore: number): number {
  if (meanScore < 0.4) return 0;
  if (meanScore < 0.7) return 1;
  return 2;
}

function archetypeToType(archetype: Archetype | null): number {
  switch (archetype) {
    case "recon_operator":
      return 0;
    case "script_kiddie":
      return 0; // recon-like
    case "credential_stuffer":
      return 1;
    case "application_attacker":
      return 2;
    case "apt_simulator":
      return 3;
    default:
      return 4; // unknown
  }
}

function phaseFromProgress(progress: number): number {
  if (progress < 0.33) return 0;
  if (progress < 0.66) return 1;
  return 2;
}

function stateKey(state: [number, number, number, number]): string {
  return state.join(":");
}

function actionFromEvent(e: DefenseEvent): PivotAction {
  const a: DefenseAction = e.action;
  if (a === "block") return "block";
  if (a === "challenge") return "challenge";
  if (a === "tarpit") return "tarpit";
  if (a === "honeypot_redirect") return "honeypot";
  if (a === "phantom_redirect") return "phantom";
  if (a === "flag") return "flag";
  return "observe";
}

function actionIndex(a: PivotAction): number {
  return PIVOT_ACTIONS.indexOf(a);
}

function reward(action: PivotAction, e: DefenseEvent): number {
  const isBad = e.threatScore > 0.5;
  const isHardAction =
    action === "block" || action === "tarpit" || action === "challenge";
  const isSoftAction =
    action === "flag" || action === "honeypot" || action === "phantom";
  const isObserve = action === "observe";
  const isEscalate = action === "escalate";
  if (isHardAction) return isBad ? 1.0 : -0.5;
  if (isSoftAction) return isBad ? 0.4 : -0.1;
  if (isEscalate) return isBad ? 0.7 : -0.2;
  if (isObserve) return isBad ? 0.2 : 0.0;
  return 0;
}

function eventsPerMinute(events: DefenseEvent[]): number {
  if (events.length < 2) return events.length;
  const first = new Date(events[0].timestamp).getTime();
  const last = new Date(events[events.length - 1].timestamp).getTime();
  const minutes = Math.max(1 / 60, (last - first) / 60_000);
  return events.length / minutes;
}

/**
 * Run a Q-learning sweep on each IP's event stream.
 *
 * Pure function. Returns the updated Q-table + per-IP recommended action.
 */
export function runPivot(input: PivotInput): PivotOutput {
  const startedAt = Date.now();
  const alpha = input.alpha ?? 0.3;
  const gamma = input.gamma ?? 0.9;
  const Q: Record<string, number[]> = { ...(input.seedQ ?? {}) };

  function getQ(key: string): number[] {
    let v = Q[key];
    if (!v) {
      v = new Array(PIVOT_ACTIONS.length).fill(0);
      Q[key] = v;
    }
    return v;
  }

  // Group by IP
  const byIp = new Map<string, DefenseEvent[]>();
  for (const ev of input.events) {
    if (!ev.ip) continue;
    const l = byIp.get(ev.ip);
    if (l) l.push(ev);
    else byIp.set(ev.ip, [ev]);
  }

  const statesVisited = new Set<string>();

  for (const ipEvents of byIp.values()) {
    const sorted = ipEvents.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    if (sorted.length < 2) continue;

    const totalSpan = Math.max(
      1,
      new Date(sorted[sorted.length - 1].timestamp).getTime() -
        new Date(sorted[0].timestamp).getTime(),
    );

    // Build state for each step
    const states: Array<[number, number, number, number]> = [];
    for (let i = 0; i < sorted.length; i++) {
      const subset = sorted.slice(Math.max(0, i - 4), i + 1);
      const epm = eventsPerMinute(subset);
      const meanScore =
        subset.reduce((a, b) => a + b.threatScore, 0) / subset.length;
      const archetype = archetypeToType(sorted[i].archetype);
      const t0 = new Date(sorted[0].timestamp).getTime();
      const ti = new Date(sorted[i].timestamp).getTime();
      const phase = phaseFromProgress((ti - t0) / totalSpan);
      const intensity = discretizeIntensity(epm);
      const confidence = discretizeConfidence(meanScore);
      states.push([archetype, phase, intensity, confidence]);
    }

    // SARSA-style updates over the chain
    for (let t = 0; t < sorted.length - 1; t++) {
      const s = stateKey(states[t]);
      const sNext = stateKey(states[t + 1]);
      statesVisited.add(s);
      const a = actionFromEvent(sorted[t]);
      const aIdx = actionIndex(a);
      if (aIdx < 0) continue;
      const r = reward(a, sorted[t]);
      const qs = getQ(s);
      const qNext = getQ(sNext);
      const maxNext = Math.max(...qNext);
      qs[aIdx] = qs[aIdx] + alpha * (r + gamma * maxNext - qs[aIdx]);
    }
  }

  // Build per-IP recommendation using the last state
  const findings: PivotFinding[] = [];
  for (const [ip, ipEvents] of byIp) {
    const sorted = ipEvents.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    if (sorted.length < 2) continue;
    const totalSpan = Math.max(
      1,
      new Date(sorted[sorted.length - 1].timestamp).getTime() -
        new Date(sorted[0].timestamp).getTime(),
    );
    const last = sorted[sorted.length - 1];
    const subset = sorted.slice(-5);
    const epm = eventsPerMinute(subset);
    const meanScore =
      subset.reduce((a, b) => a + b.threatScore, 0) / subset.length;
    const archetype = archetypeToType(last.archetype);
    const t0 = new Date(sorted[0].timestamp).getTime();
    const ti = new Date(last.timestamp).getTime();
    const phase = phaseFromProgress((ti - t0) / totalSpan);
    const intensity = discretizeIntensity(epm);
    const confidence = discretizeConfidence(meanScore);
    const state: [number, number, number, number] = [archetype, phase, intensity, confidence];
    const key = stateKey(state);
    const qVec = getQ(key);
    let bestIdx = 0;
    for (let i = 1; i < qVec.length; i++) if (qVec[i] > qVec[bestIdx]) bestIdx = i;
    const allZero = qVec.every((v) => v === 0);
    const recommended: PivotAction = allZero
      ? meanScore > 0.7
        ? "challenge"
        : "observe"
      : PIVOT_ACTIONS[bestIdx];
    findings.push({
      kind: "pivot",
      severity: Math.min(1, 0.3 + meanScore * 0.6 + Math.min(0.1, sorted.length / 100)),
      payload: {
        ip,
        archetype: last.archetype ?? "unknown",
        state,
        stateLabel: {
          attackType: ATTACK_TYPES[state[0]],
          phase: PHASES[state[1]],
          intensity: INTENSITIES[state[2]],
          confidence: CONFIDENCES[state[3]],
        },
        recommended,
        expectedQ: qVec[bestIdx] ?? 0,
        qVector: [...qVec],
        eventCount: sorted.length,
      },
    });
  }

  return {
    findings,
    qTable: Q,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - startedAt,
      statesVisited: statesVisited.size,
    },
  };
}
