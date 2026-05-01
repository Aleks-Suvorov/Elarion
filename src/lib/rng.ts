// ─── Mulberry32 PRNG ─────────────────────────────────────────
// Fast, seedable, deterministic PRNG. Statistical quality is
// excellent for game use. Passes PractRand at 32 GB.

export interface RNG {
  /** Returns float in [0, 1) */
  next(): number;
  /** Returns integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;
  /** Returns 1–10 */
  nextD10(): number;
  /** Current internal state (can be used to capture seed at any point) */
  state(): number;
  /** Clone this RNG at its current state */
  clone(): RNG;
  /** Pick one element at random */
  pick<T>(arr: readonly T[]): T;
  /** Shuffle array in place using Fisher-Yates */
  shuffle<T>(arr: T[]): T[];
}

export function createRNG(seed: number): RNG {
  // Ensure integer seed
  let s = (seed | 0) >>> 0;

  function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }

  function nextInt(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function nextD10(): number {
    return nextInt(1, 10);
  }

  function state(): number {
    return s;
  }

  function clone(): RNG {
    return createRNG(s);
  }

  function pick<T>(arr: readonly T[]): T {
    return arr[nextInt(0, arr.length - 1)];
  }

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return { next, nextInt, nextD10, state, clone, pick, shuffle };
}

/** Generate a random integer seed from browser entropy */
export function randomSeed(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  }
  return Math.floor(Math.random() * 0xffffffff);
}

/** Convert a string to a deterministic integer seed */
export function seedFromString(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (Math.imul(hash, 0x01000193)) >>> 0;
  }
  return hash;
}
