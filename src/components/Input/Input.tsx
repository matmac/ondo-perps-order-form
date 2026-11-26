"use client";

import { useId, useRef, type ChangeEvent, type ReactNode } from "react";
import s from "./Input.module.css";

export interface InputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Unit after the value, for example USD or BTC. */
  unit?: string;
  /** lg 44 for the main amount, md 36 for prices. */
  size?: "md" | "lg";
  placeholder?: string;
  /** Helper below the field. Replaced by the error when there is one. */
  helper?: ReactNode;
  /** Error message. Shows the danger border and is read with the field. */
  error?: string;
  disabled?: boolean;
  /** Slot at the end of the field: a tertiary Button or a ToggleGroup. */
  trailing?: ReactNode;
  id?: string;
  name?: string;
  className?: string;
}

/** Number field. The label sits inside on the left, the value on the right, like the Ondo Perps form. */
export function Input({
  label,
  value,
  onValueChange,
  unit,
  size = "lg",
  placeholder = "0.00",
  helper,
  error,
  disabled = false,
  trailing,
  id,
  name,
  className,
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? helper;
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={className ? `${s.root} ${className}` : s.root}>
      <div
        className={s.field}
        data-size={size}
        data-error={error ? true : undefined}
        data-disabled={disabled || undefined}
        // The whole row is the hit area; the trailing slot keeps its own clicks.
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            ref.current?.focus();
          }
        }}
      >
        <label htmlFor={inputId} className={s.label}>
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
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value)}
        />
        {unit && (
          <span className={s.unit} aria-hidden>
            {unit}
          </span>
        )}
        {trailing}
      </div>
      {message && (
        <p id={messageId} className={s.message} data-error={error ? true : undefined} aria-live={error ? "polite" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}
