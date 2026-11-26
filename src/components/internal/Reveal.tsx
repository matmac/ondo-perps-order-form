import type { ReactNode } from "react";
import s from "./Reveal.module.css";

/**
 * Height reveal for content that appears inside a stack (TP/SL fields, notices).
 * Animates grid rows 0fr → 1fr: reveal + enter in, state + exit out. Content stays mounted, so typed
 * values survive a toggle, and it is inert while closed. `gap` adds the stack gap above the content,
 * so a closed Reveal takes no space (place it in a container with no gap).
 */
export function Reveal({ open, gap, children }: { open: boolean; gap?: string; children: ReactNode }) {
  return (
    <div className={s.reveal} data-open={open || undefined} inert={!open} aria-hidden={!open || undefined}>
      <div className={s.inner}>
        <div style={gap ? { paddingTop: gap } : undefined}>{children}</div>
      </div>
    </div>
  );
}
