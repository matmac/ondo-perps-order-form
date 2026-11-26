import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import s from "./Button.module.css";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  /** primary: the one main action (44, full width). secondary: small inline action. tertiary: quiet, usually icon only. */
  variant?: "primary" | "secondary" | "tertiary";
  /** Only primary has tones. Long uses success and Short uses danger (see GUIDELINES.md). */
  tone?: "neutral" | "success" | "danger";
  /** lg for primary, sm for secondary and tertiary, xs for the 20px tertiary icon button. */
  size?: "lg" | "sm" | "xs";
  iconStart?: IconName;
  iconEnd?: IconName;
  /** Stays focusable and announced (aria-disabled), so people can still reach it and read why. */
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

const DEFAULT_SIZE = { primary: "lg", secondary: "sm", tertiary: "sm" } as const;

export function Button({
  variant = "primary",
  tone = "neutral",
  size = DEFAULT_SIZE[variant],
  iconStart,
  iconEnd,
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  className,
  children,
  ...rest
}: ButtonProps) {
  const inert = disabled || loading;
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (inert) e.preventDefault();
    else onClick?.(e);
  };
  const iconOnly = !children;

  return (
    <button
      {...rest}
      type={type}
      className={className ? `${s.button} ${className}` : s.button}
      data-variant={variant}
      data-tone={variant === "primary" ? tone : undefined}
      data-size={size}
      data-icon-only={iconOnly || undefined}
      data-loading={loading || undefined}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading && <span className={s.spinner} aria-hidden />}
      <span className={s.content}>
        {iconStart && <Icon name={iconStart} size="sm" />}
        {children}
        {iconEnd && <Icon name={iconEnd} size="sm" />}
      </span>
    </button>
  );
}
