// ---------------------------------------------------------------------------
// GladiusDefense -- Attack Chain Detection
// ---------------------------------------------------------------------------
// Sliding-window subsequence extraction with signature hashing and
// persistence to sentinel_learned_patterns via Supabase. Each unique chain
// signature is stored with patternKey `chain:<sig>` so repeated detections
// bump hit_count instead of duplicating rows.

import { upsertLearnedPattern } from "./store";
import { fnv1a } from "./fingerprint";

export interface DetectedChain {
  ip: string;
  paths: string[];
  signature: string;
  startTime: string;
  endTime: string;
  length: number;
  confidence: number;
}

interface ChainEvent {
  ip: string;
  path: string;
  created_at: string;
}

/** Hash a path sequence into a hex signature (16 hex chars, FNV-1a x2). */
export function hashChainSignature(paths: string[]): string {
  if (paths.length === 0) return "0000000000000000";
  const joined = paths.join("|");
  const h1 = fnv1a(joined).toString(16).padStart(8, "0");
  const h2 = fnv1a(joined + "\x00").toString(16).padStart(8, "0");
  return h1 + h2;
}

/**
 * Detect attack chains from a stream of events.
 *
 * Groups events by IP, sorts by timestamp, then extracts all contiguous
 * subsequences of length 3-5. Duplicate signatures per IP are collapsed.
 * Confidence: 3=0.5, 4=0.7, 5=0.9.
 */
export function detectChains(events: ChainEvent[]): DetectedChain[] {
  if (events.length < 3) return [];

  const byIp = new Map<string, ChainEvent[]>();
  for (const ev of events) {
    const list = byIp.get(ev.ip);
    if (list) list.push(ev);
    else byIp.set(ev.ip, [ev]);
  }

  const MAX_EVENTS_PER_IP = 50;
  const chains: DetectedChain[] = [];
  const seenSignatures = new Set<string>();

  for (const [ip, list] of byIp) {
    const ipEvents = list
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .slice(-MAX_EVENTS_PER_IP);

    const paths = ipEvents.map((e) => e.path);

    for (let windowSize = 3; windowSize <= 5; windowSize++) {
      if (paths.length < windowSize) continue;

      for (let i = 0; i <= paths.length - windowSize; i++) {
        const subPaths = paths.slice(i, i + windowSize);
        const signature = hashChainSignature(subPaths);
        const dedupKey = `${ip}:${signature}`;

        if (seenSignatures.has(dedupKey)) continue;
        seenSignatures.add(dedupKey);

        const confidenceByLength: Record<number, number> = {
          3: 0.5,
          4: 0.7,
          5: 0.9,
        };

        chains.push({
          ip,
          paths: subPaths,
          signature,
          startTime: ipEvents[i].created_at,
          endTime: ipEvents[i + windowSize - 1].created_at,
          length: windowSize,
          confidence: confidenceByLength[windowSize] ?? 0.5,
        });
      }
    }
  }

  return chains;
}

/**
 * Persist detected chains to sentinel_learned_patterns. Per-signature
 * dedupe: existing rows bump hit_count via the store adapter.
 */
export async function storeChains(chains: DetectedChain[]): Promise<number> {
  if (chains.length === 0) return 0;
  let inserted = 0;
  for (const c of chains) {
    const ok = await upsertLearnedPattern({
      patternKey: `chain:${c.signature}`,
      signature: {
        ip: c.ip,
        paths: c.paths,
        startTime: c.startTime,
        endTime: c.endTime,
        length: c.length,
        confidence: c.confidence,
      },
      accuracy: c.confidence,
    });
    if (ok) inserted += 1;
  }
  return inserted;
}

/** Detect chains and persist in one call. */
export async function detectAndStoreChains(
  events: ChainEvent[],
): Promise<DetectedChain[]> {
  const chains = detectChains(events);
  await storeChains(chains);
  return chains;
}
