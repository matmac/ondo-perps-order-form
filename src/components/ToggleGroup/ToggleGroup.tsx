"use client";

import { rovingKeyDown } from "../internal/useRovingFocus";
import s from "./ToggleGroup.module.css";

export interface ToggleGroupItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ToggleGroupProps {
  items: readonly ToggleGroupItem[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
  className?: string;
}

/** Small pill switch that changes a unit, not the view. Sits inside an Input, for example BTC / USD. */
export function ToggleGroup({ items, value, onValueChange, className, ...aria }: ToggleGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={className ? `${s.track} ${className}` : s.track}
      onKeyDown={(e) => rovingKeyDown(e, items, value, onValueChange)}
    >
      {items.map((item) => {
        const checked = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            data-value={item.value}
            aria-checked={checked}
            aria-disabled={item.disabled || undefined}
            tabIndex={checked ? 0 : -1}
            className={s.item}
            onClick={() => !item.disabled && onValueChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
