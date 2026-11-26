"use client";

import { rovingKeyDown } from "../internal/useRovingFocus";
import s from "./SegmentedControl.module.css";

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Exactly two options. The indicator slides between them. */
  options: readonly [SegmentedControlOption, SegmentedControlOption];
  value: string;
  onValueChange: (value: string) => void;
  /** Indicator colour per option, in the same order. Long/Short passes ["success", "danger"]. */
  tones?: readonly ["neutral" | "success" | "danger", "neutral" | "success" | "danger"];
  "aria-label": string;
  className?: string;
}

/** One choice out of two that changes the meaning of the whole form, for example Long or Short. */
export function SegmentedControl({ options, value, onValueChange, tones = ["neutral", "neutral"], className, ...aria }: SegmentedControlProps) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={className ? `${s.track} ${className}` : s.track}
      data-selected={index === 0 ? "first" : "second"}
      data-tone={tones[index]}
      onKeyDown={(e) => rovingKeyDown(e, options, value, onValueChange)}
    >
      <span className={s.indicator} aria-hidden />
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            data-value={o.value}
            aria-checked={checked}
            aria-disabled={o.disabled || undefined}
            tabIndex={checked ? 0 : -1}
            className={s.item}
            onClick={() => !o.disabled && onValueChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
