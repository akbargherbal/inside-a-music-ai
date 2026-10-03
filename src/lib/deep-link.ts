/** Clamps a step into [0, totalSteps - 1]. */
export function clampStep(step: number, totalSteps: number): number {
  return Math.max(0, Math.min(step, totalSteps - 1));
}

export interface HashTarget {
  section: string;
  /** Valid, non-negative step parsed from `?step=`; null when absent or invalid. */
  step: number | null;
}

/**
 * Parses a location hash such as `#attention?step=4`.
 * Returns null when there is no section. Invalid steps (negative, non-numeric,
 * out of range) are reported as `step: null` so callers can fall back gracefully.
 */
export function parseSectionHash(hash: string): HashTarget | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return null;
  const [section, query] = raw.split('?');
  if (!section) return null;

  let step: number | null = null;
  if (query) {
    const value = new URLSearchParams(query).get('step');
    if (value !== null && /^\d+$/.test(value)) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed >= 0) step = parsed;
    }
  }
  return { section, step };
}
