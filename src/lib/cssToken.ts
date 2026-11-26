/**
 * Reads a duration token at runtime, so JS timers follow the same tokens (and modes) as CSS.
 * Custom properties resolve their var() chain when computed, so this returns the active mode's value.
 */
export function durationMs(token: `--${string}`): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) throw new Error(`Token ${token} is not a duration (got "${raw}")`);
  return raw.endsWith("ms") ? n : n * 1000;
}
