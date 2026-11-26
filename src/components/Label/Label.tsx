import type { HTMLAttributes, ReactNode } from "react";
import s from "./Label.module.css";

export interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "subdued" | "default" | "muted" | "success" | "danger";
  size?: "xs" | "sm";
  /** Numbers use the value/* styles: numeric font and tabular figures. */
  numeric?: boolean;
  /** Dotted underline that says "this explains something". Pair it with a tooltip. */
  trigger?: boolean;
  children: ReactNode;
}

/** Text atom for labels and values in rows, helpers and headers. */
export function Label({ tone = "subdued", size = "xs", numeric = false, trigger = false, className, children, ...rest }: LabelProps) {
  return (
    <span
      {...rest}
      className={className ? `${s.label} ${className}` : s.label}
      data-tone={tone}
      data-size={size}
      data-numeric={numeric || undefined}
      data-trigger={trigger || undefined}
    >
      {children}
    </span>
  );
}
