/**
 * Mulberry32 is a 32-bit stateful pseudorandom number generator.
 * Produces deterministic, uniform floating-point numbers in [0, 1).
 */
export function createMulberry32(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PRNG = () => number;
