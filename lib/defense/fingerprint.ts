// ---------------------------------------------------------------------------
// GladiusDefense -- FNV-1a Behavioral Fingerprinting
// ---------------------------------------------------------------------------
// Pure math -- zero external dependencies.

/** FNV-1a 32-bit constants. */
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/**
 * Compute the 32-bit FNV-1a hash of a string.
 *
 * FNV-1a is a non-cryptographic hash with excellent distribution
 * characteristics and minimal collision rates for short strings.
 */
export function fnv1a(str: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

/** Hash an ordered sequence of paths into a single hex fingerprint. */
export function hashPathSequence(paths: string[]): string {
  if (paths.length === 0) return "00000000";
  const window = paths.length > 8 ? paths.slice(-8) : paths;
  const combined = window.join("\0");
  const hash = fnv1a(combined);
  return hash.toString(16).padStart(8, "0");
}

/** Compute first-order Markov transition probabilities. */
export function computeMarkovTransitions(
  paths: string[],
): Map<string, Map<string, number>> {
  const counts = new Map<string, Map<string, number>>();
  for (let i = 0; i < paths.length - 1; i++) {
    const from = paths[i];
    const to = paths[i + 1];
    let fromMap = counts.get(from);
    if (!fromMap) {
      fromMap = new Map<string, number>();
      counts.set(from, fromMap);
    }
    fromMap.set(to, (fromMap.get(to) ?? 0) + 1);
  }
  const probabilities = new Map<string, Map<string, number>>();
  for (const [from, transitions] of counts) {
    let total = 0;
    for (const count of transitions.values()) total += count;
    const probMap = new Map<string, number>();
    for (const [to, count] of transitions) {
      probMap.set(to, count / total);
    }
    probabilities.set(from, probMap);
  }
  return probabilities;
}

/** Shannon entropy of a Markov transition matrix (in bits). */
export function markovEntropy(
  transitions: Map<string, Map<string, number>>,
): number {
  let totalTransitions = 0;
  let weightedEntropy = 0;
  for (const probMap of transitions.values()) {
    let stateTransitions = 0;
    let stateEntropy = 0;
    for (const p of probMap.values()) {
      stateTransitions++;
      if (p > 0) stateEntropy -= p * Math.log2(p);
    }
    totalTransitions += stateTransitions;
    weightedEntropy += stateEntropy * stateTransitions;
  }
  if (totalTransitions === 0) return 0;
  return weightedEntropy / totalTransitions;
}

/** Cosine similarity between transition-probability vectors of two path sequences. */
export function behavioralSimilarity(
  pathsA: string[],
  pathsB: string[],
): number {
  const transA = computeMarkovTransitions(pathsA);
  const transB = computeMarkovTransitions(pathsB);
  const allKeys = new Set<string>();
  for (const [from, toMap] of transA) {
    for (const to of toMap.keys()) allKeys.add(`${from}\0${to}`);
  }
  for (const [from, toMap] of transB) {
    for (const to of toMap.keys()) allKeys.add(`${from}\0${to}`);
  }
  if (allKeys.size === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (const key of allKeys) {
    const [from, to] = key.split("\0");
    const a = transA.get(from)?.get(to) ?? 0;
    const b = transB.get(from)?.get(to) ?? 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}
