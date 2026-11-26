"use client";

import { useLayoutEffect, useRef } from "react";
import { rovingKeyDown } from "../internal/useRovingFocus";
import s from "./Tabs.module.css";

export interface TabsItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: readonly TabsItem[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
  /** Item stretches to fill the track (mobile order type bar). */
  stretch?: boolean;
  className?: string;
}

/** Switches between views of the same form, for example Market, Limit and Stop. One tab stop, arrows move. */
export function Tabs({ items, value, onValueChange, stretch = false, className, ...aria }: TabsProps) {
  const track = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);

  // The indicator follows the selected tab (motion: move + emphasized). Measured, so labels can differ in width.
  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const place = () => {
      const tab = el.querySelector<HTMLElement>('[aria-selected="true"]');
      const ind = indicator.current;
      if (!tab || !ind) return;
      ind.style.setProperty("--_x", `${tab.offsetLeft}px`);
      ind.style.setProperty("--_w", `${tab.offsetWidth}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, items]);

  return (
    <div
      ref={track}
      role="tablist"
      aria-label={aria["aria-label"]}
      className={className ? `${s.track} ${className}` : s.track}
      data-stretch={stretch || undefined}
      onKeyDown={(e) => rovingKeyDown(e, items, value, onValueChange)}
    >
      <span ref={indicator} className={s.indicator} aria-hidden />
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-value={item.value}
            aria-selected={selected}
            aria-disabled={item.disabled || undefined}
            tabIndex={selected ? 0 : -1}
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
