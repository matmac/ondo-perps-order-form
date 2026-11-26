import s from "./Divider.module.css";

export interface DividerProps {
  /** vertical: 1 × 12 separator between inline items. horizontal: full-width rule. */
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function Divider({ orientation = "vertical", className }: DividerProps) {
  return (
    <span
      role="separator"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={className ? `${s.divider} ${className}` : s.divider}
    />
  );
}
