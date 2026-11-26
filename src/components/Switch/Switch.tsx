"use client";

import s from "./Switch.module.css";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Visible text is usually a Label next to it: point at it with aria-labelledby, or pass aria-label. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  id?: string;
  className?: string;
}

/** On or off, applied right away (Reduce only, TP/SL). Track 36 × 20 inside a 24 target. */
export function Switch({ checked, onCheckedChange, disabled = false, className, ...aria }: SwitchProps) {
  return (
    <button
      {...aria}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      className={className ? `${s.root} ${className}` : s.root}
      onClick={() => !disabled && onCheckedChange(!checked)}
    >
      <span className={s.track}>
        <span className={s.thumb} />
      </span>
    </button>
  );
}
