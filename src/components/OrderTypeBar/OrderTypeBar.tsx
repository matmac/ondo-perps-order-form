"use client";

import { Button } from "../Button/Button";
import { Tabs, type TabsItem } from "../Tabs/Tabs";
import s from "./OrderTypeBar.module.css";

export interface OrderTypeBarProps {
  /** Order types the market supports (market.orderTypes), in display order. */
  orderTypes: readonly TabsItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Margin mode and leverage share one Button, for example "Cross 20x". */
  marginMode: string;
  leverage: number;
  /** Opens the margin and leverage modal (2nd layer, out of scope for this build). */
  onMarginClick?: () => void;
  className?: string;
}

/** Top row of the form: order type Tabs on the left, the margin and leverage Button on the right. */
export function OrderTypeBar({ orderTypes, value, onValueChange, marginMode, leverage, onMarginClick, className }: OrderTypeBarProps) {
  return (
    <div className={className ? `${s.bar} ${className}` : s.bar}>
      <Tabs aria-label="Order type" items={orderTypes} value={value} onValueChange={onValueChange} />
      <Button
        variant="secondary"
        iconEnd="adjust"
        aria-haspopup="dialog"
        onClick={onMarginClick}
      >
        {marginMode} {leverage}x
      </Button>
    </div>
  );
}
