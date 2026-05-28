// ---------------------------------------------------------------------------
// GladiusDefense — Red Team Simulator (mechanism #34)
// ---------------------------------------------------------------------------
// Monte Carlo Tree Search adversary that searches the space of compound
// attack-step sequences and rates the "most-likely-to-bypass" sequences
// against the current rule snapshot.
//
// Tree node: a partial attack sequence (state).
// Children: candidate next steps (drawn from observed attack steps + a
//           small bag of common bypass primitives).
// Value(node):
//   - +1 per step that the rule snapshot does NOT match (bypass)
//   - −1 per step caught (each catch terminates the rollout)
//   - depth bonus: deeper unblocked sequences score higher
// UCT score:
//   UCT(node) = Q/N + c·sqrt(ln(N_parent)/N),   c = sqrt(2)
//
// Output: top-K bypass paths + the snapshot rule coverage they expose.
//
// Pure function. Default 10k simulations (capped if event budget tight).
//
// Example:
//   const out = runRedTeam({
//     events, windowMs: 24*3600*1000,
//     ruleSnapshot: [{ id:"r1", pattern:/wp-login\.php/ }, ...],
//     simulations: 10000,
//   });
//   out.findings[0].payload → {
//     bypassSequence: ["/", "/robots.txt", "/.git/HEAD", "/api/users"],
//     visits: 412, value: 9.8, avgValue: 0.84,
//     ruleSnapshotSize: 23,
//   }
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import type { DefenseEvent } from "./types";

export interface RedTeamRule {
  id: string;
  pattern: RegExp | string;
}

export interface RedTeamInput {
  events: DefenseEvent[];
  windowMs: number;
  ruleSnapshot: RedTeamRule[];
  /** Total simulations. Default 10000 (capped if too few candidate steps). */
  simulations?: number;
  /** Max rollout depth. Default 6. */
  maxDepth?: number;
  /** Exploration constant c. Default √2 ≈ 1.414. */
  explorationC?: number;
  /** Top-K bypass paths to return. Default 8. */
  topK?: number;
  /** Deterministic RNG seed. */
  rngSeed?: number;
}

export interface RedTeamFinding {
  kind: "red_team_bypass";
  severity: number;
  payload: {
    bypassSequence: string[];
    visits: number;
    value: number;
    avgValue: number;
    ruleSnapshotSize: number;
    catchPoints: Array<{ step: string; ruleId: string }>; // empty = fully bypassed
    rank: number;
  };
}

export interface RedTeamOutput {
  findings: RedTeamFinding[];
  meta: {
    processedCount: number;
    durationMs: number;
    simulations: number;
    candidateSteps: number;
  };
}

const DEFAULT_SIMS = 10_000;
const DEFAULT_DEPTH = 6;
const DEFAULT_TOPK = 8;
const DEFAULT_C = Math.SQRT2;

// Common bypass primitives — small library of attacker-favorite paths
// that exist independently of the observed event corpus.
const BYPASS_PRIMITIVES = [
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/.env",
  "/.git/HEAD",
  "/.git/config",
  "/admin",
  "/wp-admin",
  "/wp-login.php",
  "/api/users",
  "/api/health",
  "/server-status",
  "/.aws/credentials",
  "/phpmyadmin/",
  "/console",
];

// ─── Deterministic RNG ─────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(events: DefenseEvent[], rules: RedTeamRule[]): number {
  const h = createHash("sha1")
    .update(events.length.toString())
    .update(rules.length.toString())
    .digest();
  return h.readUInt32BE(0);
}

function compile(pattern: RegExp | string): RegExp {
  if (pattern instanceof RegExp) return pattern;
  try {
    return new RegExp(pattern);
  } catch {
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }
}

function findMatchingRule(
  step: string,
  rules: RedTeamRule[],
): RedTeamRule | null {
  for (const r of rules) {
    if (compile(r.pattern).test(step)) return r;
  }
  return null;
}

// ─── MCTS node ─────────────────────────────────────────────────────────────

interface Node {
  parent: Node | null;
  // The step that led to this node from the parent ("" for root)
  step: string;
  sequence: string[];
  visits: number;
  value: number;
  children: Map<string, Node>;
  untriedSteps: string[];
  terminal: boolean;
}

function makeNode(parent: Node | null, step: string, candidateSteps: string[]): Node {
  const sequence = parent ? [...parent.sequence, step] : [];
  return {
    parent,
    step,
    sequence,
    visits: 0,
    value: 0,
    children: new Map(),
    untriedSteps: [...candidateSteps],
    terminal: false,
  };
}

function uctSelectChild(node: Node, c: number): Node {
  let best: Node | null = null;
  let bestScore = -Infinity;
  for (const child of node.children.values()) {
    const exploit = child.visits > 0 ? child.value / child.visits : 0;
    const explore =
      child.visits > 0
        ? c * Math.sqrt(Math.log(Math.max(1, node.visits)) / child.visits)
        : Infinity;
    const score = exploit + explore;
    if (score > bestScore) {
      bestScore = score;
      best = child;
    }
  }
  if (!best) {
    // Fallback to first child if nothing tested
    const it = node.children.values().next();
    if (!it.done && it.value) return it.value;
    return node;
  }
  return best;
}

/**
 * MCTS-based red-team search for bypass sequences.
 *
 * Pure function. Returns the top-K most successful bypass paths.
 */
export function runRedTeam(input: RedTeamInput): RedTeamOutput {
  const startedAt = Date.now();
  const sims = input.simulations ?? DEFAULT_SIMS;
  const maxDepth = input.maxDepth ?? DEFAULT_DEPTH;
  const c = input.explorationC ?? DEFAULT_C;
  const topK = input.topK ?? DEFAULT_TOPK;
  const rng = mulberry32(input.rngSeed ?? seedFrom(input.events, input.ruleSnapshot));

  // Candidate step library: observed paths + bypass primitives, deduped.
  const observed = new Set<string>();
  for (const e of input.events) {
    if (e.path) observed.add(e.path);
  }
  for (const p of BYPASS_PRIMITIVES) observed.add(p);
  const candidateSteps = Array.from(observed);
  if (candidateSteps.length < 2) {
    return {
      findings: [],
      meta: {
        processedCount: input.events.length,
        durationMs: Date.now() - startedAt,
        simulations: 0,
        candidateSteps: candidateSteps.length,
      },
    };
  }

  // Cap simulations by effective branching budget
  const cappedSims = Math.max(
    100,
    Math.min(sims, candidateSteps.length * maxDepth * 20),
  );

  const root = makeNode(null, "", candidateSteps);

  function expand(node: Node): Node {
    const u = node.untriedSteps;
    if (u.length === 0) return node;
    const idx = Math.floor(rng() * u.length);
    const step = u.splice(idx, 1)[0];
    // Remove step from untried in the new child to avoid loops
    const childCandidates = candidateSteps.filter((s) => !node.sequence.includes(s) && s !== step);
    const child = makeNode(node, step, childCandidates);
    node.children.set(step, child);
    return child;
  }

  function rollout(start: Node): number {
    let value = 0;
    let depth = start.sequence.length;
    let cursor = start;
    let avail = candidateSteps.filter((s) => !cursor.sequence.includes(s));
    while (depth < maxDepth && avail.length > 0) {
      const step = avail[Math.floor(rng() * avail.length)];
      const rule = findMatchingRule(step, input.ruleSnapshot);
      if (rule) {
        value -= 1;
        return value;
      }
      value += 1 + depth * 0.1;
      // No tree expansion in rollout — we just count
      cursor = { ...cursor, sequence: [...cursor.sequence, step] };
      avail = candidateSteps.filter((s) => !cursor.sequence.includes(s));
      depth++;
    }
    return value;
  }

  function backprop(node: Node, value: number): void {
    let cur: Node | null = node;
    while (cur) {
      cur.visits++;
      cur.value += value;
      cur = cur.parent;
    }
  }

  for (let i = 0; i < cappedSims; i++) {
    // Selection
    let node = root;
    while (
      node.untriedSteps.length === 0 &&
      node.children.size > 0 &&
      node.sequence.length < maxDepth
    ) {
      node = uctSelectChild(node, c);
    }
    // Expansion
    if (node.untriedSteps.length > 0 && node.sequence.length < maxDepth) {
      node = expand(node);
    }
    // Quick-check: if this step is caught, mark terminal and backprop -1
    if (node.parent && findMatchingRule(node.step, input.ruleSnapshot)) {
      node.terminal = true;
      backprop(node, -1);
      continue;
    }
    // Simulation
    const value = rollout(node);
    // Backprop
    backprop(node, value);
  }

  // Collect best paths: DFS the tree, return top-K sequences by avg value.
  type Candidate = {
    sequence: string[];
    visits: number;
    value: number;
    avgValue: number;
    catchPoints: Array<{ step: string; ruleId: string }>;
  };
  const candidates: Candidate[] = [];
  function dfs(node: Node): void {
    if (node.sequence.length > 0) {
      const catchPoints: Array<{ step: string; ruleId: string }> = [];
      for (const step of node.sequence) {
        const r = findMatchingRule(step, input.ruleSnapshot);
        if (r) catchPoints.push({ step, ruleId: r.id });
      }
      if (node.visits >= 5 && catchPoints.length === 0) {
        candidates.push({
          sequence: node.sequence,
          visits: node.visits,
          value: node.value,
          avgValue: node.value / Math.max(1, node.visits),
          catchPoints,
        });
      }
    }
    for (const child of node.children.values()) dfs(child);
  }
  dfs(root);

  candidates.sort((a, b) => b.avgValue - a.avgValue || b.visits - a.visits);
  const top = candidates.slice(0, topK);

  const findings: RedTeamFinding[] = top.map((c, rank) => ({
    kind: "red_team_bypass",
    severity: Math.min(1, 0.4 + c.avgValue / 10 + Math.min(0.2, c.sequence.length / 10)),
    payload: {
      bypassSequence: c.sequence,
      visits: c.visits,
      value: c.value,
      avgValue: c.avgValue,
      ruleSnapshotSize: input.ruleSnapshot.length,
      catchPoints: c.catchPoints,
      rank,
    },
  }));

  return {
    findings,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - startedAt,
      simulations: cappedSims,
      candidateSteps: candidateSteps.length,
    },
  };
}
