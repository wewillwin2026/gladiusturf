// ---------------------------------------------------------------------------
// GladiusDefense — Swarm Topology Analyzer (mechanism #33)
// ---------------------------------------------------------------------------
// Louvain community detection on a graph where:
//   - Nodes are IPs that produced events in the window
//   - Edges are weighted by coordinated request timing:
//     weight(u,v) = number of (u_event, v_event) pairs with
//                   |t_u - t_v| < coordWindowMs AND
//                   same path OR same fingerprint
//
// We maximize the modularity:
//   Q = (1/2m) * Σ_ij [ A_ij − k_i·k_j/(2m) ] · δ(c_i, c_j)
// using the standard Louvain two-phase algorithm (move + collapse).
//
// Output: communities of IPs (size ≥ 2) with their internal density,
// which the defense system uses to flag botnet swarms.
//
// Example:
//   const out = runSwarm({ events, windowMs:6*3600*1000, coordWindowMs: 500 });
//   out.findings[0].payload → {
//     communityId, members:["1.1.1.1","2.2.2.2","3.3.3.3"], size:3,
//     internalEdgeWeight: 42, density: 0.92, modularityContribution: 0.04
//   }
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import type { DefenseEvent } from "./types";

export interface SwarmInput {
  events: DefenseEvent[];
  windowMs: number;
  /** Max ms between events to count as coordinated. Default 500ms. */
  coordWindowMs?: number;
  /** Min weighted degree to count as a graph node. Default 1. */
  minDegree?: number;
}

export interface SwarmFinding {
  kind: "swarm_community";
  severity: number;
  payload: {
    communityId: string;
    members: string[];
    size: number;
    internalEdgeWeight: number;
    density: number;
    modularityContribution: number;
  };
}

export interface SwarmOutput {
  findings: SwarmFinding[];
  meta: {
    processedCount: number;
    durationMs: number;
    nodes: number;
    edges: number;
    modularity: number;
  };
}

const DEFAULT_COORD_WINDOW_MS = 500;
const DEFAULT_MIN_DEGREE = 1;

interface Edge {
  u: number;
  v: number;
  w: number;
}

function buildGraph(
  events: DefenseEvent[],
  coordWindowMs: number,
): {
  ips: string[];
  adjacency: Map<number, Map<number, number>>;
  totalWeight: number;
} {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const ipIndex = new Map<string, number>();
  const ips: string[] = [];

  function indexOf(ip: string): number {
    let idx = ipIndex.get(ip);
    if (idx === undefined) {
      idx = ips.length;
      ipIndex.set(ip, idx);
      ips.push(ip);
    }
    return idx;
  }

  // Sliding window: for each event, look back at events within coordWindowMs.
  const edges = new Map<string, Edge>();
  function addEdge(u: number, v: number, w: number) {
    if (u === v) return;
    const a = u < v ? u : v;
    const b = u < v ? v : u;
    const key = `${a}|${b}`;
    const existing = edges.get(key);
    if (existing) existing.w += w;
    else edges.set(key, { u: a, v: b, w });
  }

  let left = 0;
  for (let right = 0; right < sorted.length; right++) {
    const er = sorted[right];
    if (!er.ip) continue;
    const tr = new Date(er.timestamp).getTime();
    while (
      left < right &&
      tr - new Date(sorted[left].timestamp).getTime() > coordWindowMs
    ) {
      left++;
    }
    const ru = indexOf(er.ip);
    for (let k = left; k < right; k++) {
      const ek = sorted[k];
      if (!ek.ip || ek.ip === er.ip) continue;
      // Coordination signal: same path OR same fingerprint
      let w = 0;
      if (ek.path && ek.path === er.path) w += 1;
      if (ek.fingerprint && ek.fingerprint === er.fingerprint) w += 1;
      if (w === 0) continue;
      const lu = indexOf(ek.ip);
      addEdge(ru, lu, w);
    }
  }

  // Build adjacency map
  const adjacency = new Map<number, Map<number, number>>();
  let totalWeight = 0;
  for (const e of edges.values()) {
    totalWeight += e.w;
    let am = adjacency.get(e.u);
    if (!am) {
      am = new Map();
      adjacency.set(e.u, am);
    }
    am.set(e.v, e.w);
    let bm = adjacency.get(e.v);
    if (!bm) {
      bm = new Map();
      adjacency.set(e.v, bm);
    }
    bm.set(e.u, e.w);
  }

  return { ips, adjacency, totalWeight };
}

function nodeDegree(adj: Map<number, number> | undefined): number {
  if (!adj) return 0;
  let sum = 0;
  for (const w of adj.values()) sum += w;
  return sum;
}

/**
 * One Louvain pass: optimize community assignment for the current graph.
 * Returns community labels per node + final modularity Q.
 */
function louvainPass(
  adjacency: Map<number, Map<number, number>>,
  totalWeight: number,
): { communities: number[]; modularity: number } {
  const n = adjacency.size === 0
    ? 0
    : Math.max(...Array.from(adjacency.keys())) + 1;
  // Initialize: each node is its own community
  const community = Array.from({ length: n }, (_, i) => i);
  const communityWeight = new Array(n).fill(0);
  const nodeWeight = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const w = nodeDegree(adjacency.get(i));
    nodeWeight[i] = w;
    communityWeight[i] = w;
  }
  const twoM = 2 * totalWeight;
  if (twoM === 0) {
    return { communities: community, modularity: 0 };
  }

  let improved = true;
  let iter = 0;
  while (improved && iter < 20) {
    improved = false;
    iter++;
    for (let i = 0; i < n; i++) {
      const adj = adjacency.get(i);
      if (!adj || adj.size === 0) continue;
      const ci = community[i];

      // weight from i to each neighboring community
      const toComm = new Map<number, number>();
      for (const [j, w] of adj) {
        const cj = community[j];
        toComm.set(cj, (toComm.get(cj) ?? 0) + w);
      }
      // Remove i from its current community
      const inCi = toComm.get(ci) ?? 0;
      communityWeight[ci] -= nodeWeight[i];

      // Find the best target community
      let bestComm = ci;
      let bestGain = 0;
      for (const [cj, kIcj] of toComm) {
        const sigmaTot = communityWeight[cj];
        // Modularity gain of moving i into cj:
        //   ΔQ = (kIcj/m) - (sigmaTot * k_i / (2m^2))
        const gain = kIcj / totalWeight - (sigmaTot * nodeWeight[i]) / (2 * totalWeight * totalWeight);
        if (gain > bestGain) {
          bestGain = gain;
          bestComm = cj;
        }
      }
      // Default: stay (if no positive gain elsewhere, returning to ci is free)
      if (bestComm === ci) {
        communityWeight[ci] += nodeWeight[i];
        continue;
      }
      // Move
      community[i] = bestComm;
      communityWeight[bestComm] += nodeWeight[i];
      improved = true;
      // (we already subtracted nodeWeight[i] from ci above)
      // Touch inCi to avoid unused-var warnings
      void inCi;
    }
  }

  // Compute modularity Q for the final partition
  let Q = 0;
  // Recompute community sums correctly
  const finalCommunityIn = new Map<number, number>();
  const finalCommunityTot = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const c = community[i];
    finalCommunityTot.set(c, (finalCommunityTot.get(c) ?? 0) + nodeWeight[i]);
  }
  const seenPair = new Set<string>();
  for (const [u, neighbors] of adjacency) {
    for (const [v, w] of neighbors) {
      const a = u < v ? u : v;
      const b = u < v ? v : u;
      const key = `${a}|${b}`;
      if (seenPair.has(key)) continue;
      seenPair.add(key);
      if (community[u] === community[v]) {
        const c = community[u];
        finalCommunityIn.set(c, (finalCommunityIn.get(c) ?? 0) + 2 * w);
      }
    }
  }
  for (const [c, inW] of finalCommunityIn) {
    const tot = finalCommunityTot.get(c) ?? 0;
    Q += inW / twoM - (tot / twoM) ** 2;
  }

  return { communities: community, modularity: Q };
}

/**
 * Detect coordinated swarms via Louvain community detection.
 *
 * Pure function. Returns one finding per community with size ≥ 2.
 */
export function runSwarm(input: SwarmInput): SwarmOutput {
  const startedAt = Date.now();
  const coordWindowMs = input.coordWindowMs ?? DEFAULT_COORD_WINDOW_MS;
  const minDegree = input.minDegree ?? DEFAULT_MIN_DEGREE;

  const { ips, adjacency, totalWeight } = buildGraph(input.events, coordWindowMs);
  // Prune low-degree nodes
  const keptIndices: number[] = [];
  for (let i = 0; i < ips.length; i++) {
    if (nodeDegree(adjacency.get(i)) >= minDegree) keptIndices.push(i);
  }
  if (keptIndices.length < 2 || totalWeight === 0) {
    return {
      findings: [],
      meta: {
        processedCount: input.events.length,
        durationMs: Date.now() - startedAt,
        nodes: ips.length,
        edges: 0,
        modularity: 0,
      },
    };
  }

  // Compactify indices for Louvain (so node IDs are contiguous)
  const oldToNew = new Map<number, number>();
  keptIndices.forEach((idx, i) => oldToNew.set(idx, i));
  const compactAdj = new Map<number, Map<number, number>>();
  let edgeCount = 0;
  for (const [u, neighbors] of adjacency) {
    const nu = oldToNew.get(u);
    if (nu === undefined) continue;
    for (const [v, w] of neighbors) {
      const nv = oldToNew.get(v);
      if (nv === undefined) continue;
      let m = compactAdj.get(nu);
      if (!m) {
        m = new Map();
        compactAdj.set(nu, m);
      }
      if (!m.has(nv)) edgeCount++;
      m.set(nv, w);
    }
  }
  edgeCount = edgeCount / 2; // undirected

  const { communities, modularity } = louvainPass(compactAdj, totalWeight);

  // Group nodes by community
  const byCommunity = new Map<number, number[]>();
  for (let i = 0; i < communities.length; i++) {
    const c = communities[i];
    const arr = byCommunity.get(c);
    if (arr) arr.push(i);
    else byCommunity.set(c, [i]);
  }

  const findings: SwarmFinding[] = [];
  for (const [, members] of byCommunity) {
    if (members.length < 2) continue;
    // Compute internal edge weight + density
    let internalW = 0;
    const memberSet = new Set(members);
    for (const m of members) {
      const adj = compactAdj.get(m);
      if (!adj) continue;
      for (const [v, w] of adj) {
        if (memberSet.has(v) && v > m) internalW += w;
      }
    }
    const maxPossible = (members.length * (members.length - 1)) / 2;
    const density = maxPossible > 0 ? internalW / maxPossible : 0;
    const memberIps = members.map((i) => ips[keptIndices[i]]).sort();
    const communityId = createHash("sha1")
      .update(memberIps.join("|"))
      .digest("hex")
      .slice(0, 12);
    findings.push({
      kind: "swarm_community",
      severity: Math.min(1, 0.3 + Math.min(0.5, density) + Math.min(0.2, members.length / 20)),
      payload: {
        communityId,
        members: memberIps,
        size: members.length,
        internalEdgeWeight: internalW,
        density,
        // Approximate single-community contribution:
        modularityContribution: modularity / Math.max(1, byCommunity.size),
      },
    });
  }

  return {
    findings,
    meta: {
      processedCount: input.events.length,
      durationMs: Date.now() - startedAt,
      nodes: keptIndices.length,
      edges: edgeCount,
      modularity,
    },
  };
}
