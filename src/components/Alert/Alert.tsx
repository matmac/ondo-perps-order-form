import type { ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import s from "./Alert.module.css";

export interface AlertProps {
  tone?: "warning" | "danger" | "info";
  children: ReactNode;
  /** Optional fix the person can take, for example "Deposit". */
  action?: { label: string; onClick: () => void };
  className?: string;
}

/** Inline message about the order. Announced politely when it appears (role=status). */
export function Alert({ tone = "warning", children, action, className }: AlertProps) {
  return (
    <div role="status" data-tone={tone} className={className ? `${s.alert} ${className}` : s.alert}>
      <Icon name={tone === "info" ? "info" : "alert-triangle"} size="sm" />
      <div className={s.body}>
        <p>{children}</p>
        {action && (
          <button type="button" className={s.action} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
