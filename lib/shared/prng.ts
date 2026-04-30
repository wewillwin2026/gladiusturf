// mulberry32 PRNG — deterministic seeded RNG so demo data is stable across builds.
// All seed-* files in lib/demo/* call rng(1337) so reloads always produce the same dataset.

export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rng(seed = 1337) {
  const r = mulberry32(seed);
  return {
    float: (min = 0, max = 1) => min + (max - min) * r(),
    int: (min: number, max: number) => Math.floor(min + (max - min + 1) * r()),
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(r() * arr.length)]!,
    bool: (p = 0.5) => r() < p,
    next: r,
  };
}

export type Rng = ReturnType<typeof rng>;
