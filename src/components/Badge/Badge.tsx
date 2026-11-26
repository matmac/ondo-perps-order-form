import type { ReactNode } from "react";
import s from "./Badge.module.css";

export interface BadgeProps {
  tone?: "neutral" | "discovery";
  children: ReactNode;
  className?: string;
}

/** Short status tag, for example the leverage or "New". Not interactive. */
export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span data-tone={tone} className={className ? `${s.badge} ${className}` : s.badge}>
      {children}
    </span>
  );
}
