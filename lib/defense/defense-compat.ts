/**
 * Compatibility helpers for defense modules. Pure math, zero deps.
 */

/**
 * Compute Shannon entropy of a string (character-level).
 * Counts character frequencies, then computes -sum(p * log2(p)).
 */
export function stringEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const freq = new Map<string, number>();
  for (const ch of str) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  const len = str.length;
  let h = 0;
  for (const count of freq.values()) {
    const p = count / len;
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Single-value exponential moving average update.
 * Formula: alpha * newValue + (1 - alpha) * current
 */
export function emaScalar(current: number, newValue: number, alpha: number): number {
  return alpha * newValue + (1 - alpha) * current;
}

/**
 * Jaccard similarity between two sets: |A ∩ B| / |A ∪ B|.
 * Returns 0 for two empty sets.
 */
export function jaccardSimilarity<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Exponential decay: score * rate^elapsed. Floors at 0.
 */
export function decayScore(score: number, rate: number, elapsed: number): number {
  if (score <= 0 || elapsed <= 0) return score;
  return Math.max(0, score * Math.pow(rate, elapsed));
}

/**
 * 3-tier composite IP score: 0.5*short + 0.3*medium + 0.2*long.
 */
export function compositeIPScore(short: number, medium: number, long: number): number {
  return 0.5 * short + 0.3 * medium + 0.2 * long;
}
