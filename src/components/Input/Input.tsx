"use client";

import { useId, useRef, useState, type ChangeEvent, type FocusEvent, type ReactNode } from "react";
import s from "./Input.module.css";

export interface InputProps {
  label: string;
  /** Keeps the label for screen readers only, for example the % field next to the slider. */
  hideLabel?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /** Unit after the value, for example USD or %. */
  unit?: string;
  /** lg 44 for the main amount, md 36 for prices and %. */
  size?: "md" | "lg";
  /** error: danger border, and the helper is read as the error message. */
  status?: "default" | "error";
  placeholder?: string;
  /** Text below the field: a hint, or the error message when status is error. */
  helper?: ReactNode;
  disabled?: boolean;
  /** Shows the value but blocks edits, for example while the order is submitting. */
  readOnly?: boolean;
  /** Adds thousands separators while the field is not focused ("71841.5" shows as "71,841.5"). */
  groupDigits?: boolean;
  /** Slot at the end of the field: a tertiary Button or a ToggleGroup. */
  trailing?: ReactNode;
  id?: string;
  name?: string;
  className?: string;
}

/** Number field. The label sits inside on the left, the value on the right, like the Ondo Perps form. */
export function Input({
  label,
  hideLabel = false,
  value,
  onValueChange,
  onBlur,
  unit,
  size = "lg",
  status = "default",
  placeholder = "0.00",
  helper,
  disabled = false,
  readOnly = false,
  groupDigits = false,
  trailing,
  id,
  name,
  className,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const error = status === "error";
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={className ? `${s.root} ${className}` : s.root}>
      <div
        className={s.field}
        data-size={size}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        // The whole row is the hit area; the trailing slot keeps its own clicks.
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            ref.current?.focus();
          }
        }}
      >
        <label htmlFor={inputId} className={hideLabel ? "sr-only" : s.label}>
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={s.input}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={groupDigits && !focused ? group(value) : value}
          onFocus={() => setFocused(true)}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={error || undefined}
          aria-describedby={helper ? helperId : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {unit && (
          <span className={s.unit} aria-hidden>
            {unit}
          </span>
        )}
        {trailing}
      </div>
      {helper && (
        <p id={helperId} className={s.message} data-error={error || undefined} aria-live={error ? "polite" : undefined}>
          {helper}
        </p>
      )}
    </div>
  );
}

/** "1234567.50" → "1,234,567.50". Leaves the decimals exactly as typed. */
const group = (v: string) => {
  const [int, dec] = v.split(".");
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (dec !== undefined ? `.${dec}` : "");
};
