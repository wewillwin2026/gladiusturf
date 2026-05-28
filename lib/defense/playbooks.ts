// ---------------------------------------------------------------------------
// GladiusDefense — Attack Playbook Builder (mechanism #17)
// ---------------------------------------------------------------------------
// Builds a first-order Markov chain on path sequences, grouped by archetype.
//
// For each archetype, we:
//   1. Group events by IP and sort by timestamp
//   2. Build a transition matrix:  P(path_{t+1} | path_t)
//   3. Extract the top-K starting paths (highest unconditional frequency)
//   4. Greedy-walk the chain to surface the most-likely k-step playbook
//   5. Auto-generate counter-strategies — pre-deployed honeypot paths that
//      match the playbook's predicted next-hops.
//
// Honeypot strategy: for each likely next-hop p in the playbook, recommend
// installing a honeypot at p with a slightly different response signature
// (e.g. "/admin" + "/admin.bak", "/wp-login.php" + "/wp-login.old.php").
//
// Example:
//   const out = runPlaybooks({ events, windowMs: 86400000 });
//   out.findings[0] → {
//     kind: "playbook",
//     payload: {
//       archetype: "recon_operator",
//       playbook: ["/", "/robots.txt", "/sitemap.xml", "/admin", "/wp-login.php"],
//       likelihood: 0.62,
//       counterStrategy: ["/admin.bak", "/wp-login.old.php", "/admin.php.bak"]
//     }
//   }
// ---------------------------------------------------------------------------

import type { Archetype, DefenseEvent } from "./types";

export interface PlaybooksInput {
  events: DefenseEvent[];
  windowMs: number;
  /** Playbook depth — how many hops to walk. */
  depth?: number;
  /** Honeypot suffixes to try per hot path. */
  honeypotSuffixes?: string[];
}

export interface PlaybookFinding {
  kind: "playbook";
  severity: number;
  payload: {
    archetype: Archetype;
    playbook: string[];
    likelihood: number;
    transitions: Array<{ from: string; to: string; prob: number }>;
    counterStrategy: string[];
    sampleSize: number;
  };
}

export interface PlaybooksOutput {
  findings: PlaybookFinding[];
  meta: { processedCount: number; durationMs: number };
}

const DEFAULT_DEPTH = 5;
const DEFAULT_HONEYPOT_SUFFIXES = [
  ".bak",
  ".old",
  "~",
  ".php.bak",
  "_backup",
];

const ARCHETYPES: Archetype[] = [
  "script_kiddie",
  "recon_operator",
  "credential_stuffer",
  "application_attacker",
  "apt_simulator",
];

function buildTransitionMatrix(
  sequences: string[][],
): Map<string, Map<string, number>> {
  const counts = new Map<string, Map<string, number>>();
  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 1; i++) {
      const from = seq[i];
      const to = seq[i + 1];
      let m = counts.get(from);
      if (!m) {
        m = new Map();
        counts.set(from, m);
      }
      m.set(to, (m.get(to) ?? 0) + 1);
    }
  }
  const probs = new Map<string, Map<string, number>>();
  for (const [from, toMap] of counts) {
    let total = 0;
    for (const c of toMap.values()) total += c;
    const p = new Map<string, number>();
    for (const [to, c] of toMap) p.set(to, c / total);
    probs.set(from, p);
  }
  return probs;
}

function pickStart(sequences: string[][]): string | null {
  const counts = new Map<string, number>();
  for (const seq of sequences) {
    if (seq.length === 0) continue;
    counts.set(seq[0], (counts.get(seq[0]) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [path, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = path;
    }
  }
  return best;
}

function greedyWalk(
  start: string,
  transitions: Map<string, Map<string, number>>,
  depth: number,
): { walk: string[]; logLikelihood: number; edges: Array<{ from: string; to: string; prob: number }> } {
  const walk: string[] = [start];
  const edges: Array<{ from: string; to: string; prob: number }> = [];
  let logLikelihood = 0;
  let cursor = start;
  const visited = new Set<string>([start]);
  for (let i = 0; i < depth - 1; i++) {
    const next = transitions.get(cursor);
    if (!next || next.size === 0) break;
    // Pick highest probability that we haven't already taken
    let bestTo: string | null = null;
    let bestProb = 0;
    for (const [to, prob] of next) {
      if (visited.has(to)) continue;
      if (prob > bestProb) {
        bestProb = prob;
        bestTo = to;
      }
    }
    // If only self-loops remain, accept the best including visited (but don't recurse)
    if (!bestTo) {
      for (const [to, prob] of next) {
        if (prob > bestProb) {
          bestProb = prob;
          bestTo = to;
        }
      }
    }
    if (!bestTo) break;
    walk.push(bestTo);
    edges.push({ from: cursor, to: bestTo, prob: bestProb });
    logLikelihood += Math.log(Math.max(bestProb, 1e-9));
    if (!visited.has(bestTo)) visited.add(bestTo);
    else break; // stop at loop
    cursor = bestTo;
  }
  return { walk, logLikelihood, edges };
}

function counterStrategy(
  playbook: string[],
  suffixes: string[],
): string[] {
  const out = new Set<string>();
  for (const p of playbook) {
    for (const suf of suffixes) {
      // Skip suffixes that don't apply cleanly to query-ish or root paths
      if (p === "/" || p.includes("?")) continue;
      out.add(p + suf);
    }
  }
  return Array.from(out).slice(0, 12);
}

/**
 * Build attack playbooks per archetype.
 *
 * Pure function — no I/O. Caller persists findings.
 */
export function runPlaybooks(input: PlaybooksInput): PlaybooksOutput {
  const start = Date.now();
  const findings: PlaybookFinding[] = [];
  const depth = input.depth ?? DEFAULT_DEPTH;
  const suffixes = input.honeypotSuffixes ?? DEFAULT_HONEYPOT_SUFFIXES;

  // Group events by archetype → by IP → sorted sequence of paths
  for (const archetype of ARCHETYPES) {
    const archEvents = input.events.filter((e) => e.archetype === archetype);
    if (archEvents.length < 5) continue;

    const byIp = new Map<string, DefenseEvent[]>();
    for (const ev of archEvents) {
      if (!ev.ip || !ev.path) continue;
      const l = byIp.get(ev.ip);
      if (l) l.push(ev);
      else byIp.set(ev.ip, [ev]);
    }

    const sequences: string[][] = [];
    for (const ipEvents of byIp.values()) {
      const sorted = ipEvents.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      if (sorted.length >= 2) sequences.push(sorted.map((e) => e.path));
    }
    if (sequences.length < 2) continue;

    const transitions = buildTransitionMatrix(sequences);
    if (transitions.size === 0) continue;

    const startPath = pickStart(sequences);
    if (!startPath) continue;

    const { walk, logLikelihood, edges } = greedyWalk(startPath, transitions, depth);
    if (walk.length < 2) continue;

    // Normalize to [0,1] via exp of average log-prob
    const avgLogLik =
      edges.length > 0 ? logLikelihood / edges.length : -1;
    const likelihood = Math.exp(avgLogLik);

    findings.push({
      kind: "playbook",
      severity: Math.min(1, likelihood * Math.min(1, sequences.length / 5)),
      payload: {
        archetype,
        playbook: walk,
        likelihood,
        transitions: edges,
        counterStrategy: counterStrategy(walk, suffixes),
        sampleSize: sequences.length,
      },
    });
  }

  return {
    findings,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - start,
    },
  };
}
