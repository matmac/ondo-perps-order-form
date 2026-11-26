import { icons, type IconName } from "./icons";
import s from "./Icon.module.css";

export type { IconName };

export interface IconProps {
  name: IconName;
  /** xs 12, sm 16 (inside controls), md 20. */
  size?: "xs" | "sm" | "md";
  /** Only for icons that carry meaning on their own. Decorative icons stay hidden from screen readers. */
  label?: string;
  className?: string;
}

/** In-house icon set from Figma. Fills with currentColor, so the parent sets the colour. */
export function Icon({ name, size = "md", label, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className ? `${s.icon} ${className}` : s.icon}
      data-size={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}
