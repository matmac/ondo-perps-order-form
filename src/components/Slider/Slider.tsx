"use client";

import type { CSSProperties } from "react";
import s from "./Slider.module.css";

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Ramp colour: success for Long, danger for Short. */
  tone?: "success" | "danger";
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** What a screen reader says for the value, for example "25% of available margin". */
  "aria-valuetext"?: string;
  className?: string;
}

/**
 * Ticked ramp with a thumb, drawn to match Figma. A native range input sits on top,
 * so dragging, keyboard steps and screen readers work without custom handling.
 */
export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, tone = "success", disabled = false, className, ...aria }: SliderProps) {
  const pct = max === min ? 0 : (Math.min(max, Math.max(min, value)) - min) / (max - min);
  return (
    <div
      className={className ? `${s.root} ${className}` : s.root}
      data-tone={tone}
      data-disabled={disabled || undefined}
      style={{ "--_pct": pct } as CSSProperties}
    >
      <span className={s.ramp} aria-hidden />
      <input
        {...aria}
        type="range"
        className={s.input}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(Number(e.target.value))}
      />
      <span className={s.thumb} aria-hidden>
        <span className={s.grip} />
      </span>
    </div>
  );
}
