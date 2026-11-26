import type { ReactNode } from "react";
import { Button } from "../Button/Button";
import { Divider } from "../Divider/Divider";
import type { IconName } from "../Icon/Icon";
import { Label } from "../Label/Label";
import s from "./LabelValueRow.module.css";

export interface LabelValueRowProps {
  label: string;
  /** null renders "–" in the muted tone. */
  value: ReactNode | null;
  /** xs for the details list, sm (bigger value) for account rows. */
  size?: "xs" | "sm";
  /**
   * Value colour. muted for an empty value ("–"); success and danger for a side or a warning.
   * Figma names the side variants long and short: they map to success and danger here.
   */
  tone?: "default" | "muted" | "success" | "danger";
  /** Dotted underline on the label: it explains the row and opens a 2nd-layer modal. */
  onLabelClick?: () => void;
  /** Slot after the label, for example a discount Badge or an Icon. */
  labelAddon?: ReactNode;
  /** Subdued text before the value, split by a Divider, for example "Est. 0.5%". */
  secondary?: string;
  /** Naked icon Button at the end, for example edit slippage. */
  action?: { icon: IconName; label: string; onClick?: () => void };
  className?: string;
}

/**
 * One line of a definition list: term on the left, value on the right.
 * Renders <dt>/<dd>, so place it inside a <dl> (DetailsList, or an account list).
 */
export function LabelValueRow({ label, value, size = "xs", tone = "default", onLabelClick, labelAddon, secondary, action, className }: LabelValueRowProps) {
  return (
    <div className={className ? `${s.row} ${className}` : s.row}>
      <dt className={s.term}>
        {onLabelClick ? (
          <button type="button" className={s.trigger} onClick={onLabelClick}>
            <Label trigger>{label}</Label>
          </button>
        ) : (
          <Label>{label}</Label>
        )}
        {labelAddon}
      </dt>
      <dd className={s.value}>
        {secondary && (
          <>
            <Label>{secondary}</Label>
            <Divider />
          </>
        )}
        <Label tone={value === null ? "muted" : tone} size={size} numeric>
          {value ?? "–"}
        </Label>
        {action && <Button variant="tertiary" size="xs" iconStart={action.icon} aria-label={action.label} onClick={action.onClick} />}
      </dd>
    </div>
  );
}
