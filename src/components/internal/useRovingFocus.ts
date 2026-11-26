import type { KeyboardEvent } from "react";

/**
 * Arrow keys, Home and End for a group with one tab stop (tablist, radiogroup).
 * Moves focus and selection together, skipping disabled items, as the ARIA APG patterns describe.
 */
export function rovingKeyDown<T extends { value: string; disabled?: boolean }>(
  e: KeyboardEvent<HTMLElement>,
  items: readonly T[],
  current: string,
  select: (value: string) => void,
) {
  const enabled = items.filter((i) => !i.disabled);
  const at = enabled.findIndex((i) => i.value === current);
  const next = {
    ArrowRight: at + 1,
    ArrowDown: at + 1,
    ArrowLeft: at - 1,
    ArrowUp: at - 1,
    Home: 0,
    End: enabled.length - 1,
  }[e.key];
  if (next === undefined || enabled.length === 0) return;
  e.preventDefault();
  const target = enabled[(next + enabled.length) % enabled.length];
  select(target.value);
  const group = e.currentTarget;
  requestAnimationFrame(() => group.querySelector<HTMLElement>(`[data-value="${CSS.escape(target.value)}"]`)?.focus());
}
