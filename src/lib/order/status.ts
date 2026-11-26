// The order status model (GUIDELINES §5). Derived on every change, never stored.
import type { Account, Market, Side } from "./markets.ts";
import { formatQuote, formatSize } from "./format.ts";
import { marginRequired } from "./math.ts";

export type Status =
  | "signedOut"
  | "noFunds"
  | "empty"
  | "ready"
  | "belowMinimum"
  | "aboveMaximum"
  | "insufficientBalance"
  | "marketClosed"
  | "submitting";

export interface StatusInput {
  account: Pick<Account, "availableBalance"> | null;
  market: Market;
  size: number | null;
  leverage: number;
  marketOpen: boolean;
  submitting: boolean;
}

/** First match wins, in this order. */
export function deriveStatus({ account, market, size, leverage, marketOpen, submitting }: StatusInput): Status {
  if (!account) return "signedOut";
  if (account.availableBalance <= 0) return "noFunds";
  if (submitting) return "submitting";
  if (size === null || size <= 0) return "empty";
  if (size > market.maxOrderSize) return "aboveMaximum";
  if (size < market.minOrderSize) return "belowMinimum";
  if (marginRequired(market, size, leverage) > account.availableBalance) return "insufficientBalance";
  if (!marketOpen) return "marketClosed";
  return "ready";
}

/** Field error for the amount input. Says what to do, with numbers. */
export function amountError(status: Status, i: StatusInput): string | undefined {
  const { market, size, leverage, account } = i;
  switch (status) {
    case "belowMinimum":
      return `Minimum ${formatSize(market, market.minOrderSize)}`;
    case "aboveMaximum":
      return `Maximum ${formatSize(market, market.maxOrderSize)}`;
    case "insufficientBalance":
      return `Needs ${formatQuote(marginRequired(market, size ?? 0, leverage))} margin · ${formatQuote(account?.availableBalance ?? 0)} available`;
    default:
      return undefined;
  }
}

export interface Cta {
  label: string;
  tone: "neutral" | "success" | "danger";
  disabled: boolean;
  loading: boolean;
}

/** The trade button says what will happen. Validation states repeat the field error and stay disabled. */
export function deriveCta(status: Status, side: Side, i: StatusInput): Cta {
  const tone = side === "long" ? "success" : "danger";
  const trade = `${side === "long" ? "Long" : "Short"} ${formatSize(i.market, i.size ?? 0)}`;
  switch (status) {
    case "signedOut":
      return { label: "Sign in", tone: "neutral", disabled: false, loading: false };
    case "noFunds":
    case "insufficientBalance":
      return { label: `Deposit ${i.market.quoteAsset}`, tone: "neutral", disabled: false, loading: false };
    case "empty":
      return { label: "Enter an amount", tone, disabled: true, loading: false };
    case "belowMinimum":
    case "aboveMaximum":
      return { label: amountError(status, i)!, tone, disabled: true, loading: false };
    case "submitting":
      return { label: "Placing order…", tone, disabled: false, loading: true };
    case "marketClosed":
    case "ready":
      return { label: trade, tone, disabled: false, loading: false };
  }
}

export type TpSlField = "takeProfit" | "stopLoss";

/** TP sits above entry for a long and below for a short; SL the reverse. Entry = mark for a market order. */
export function tpSlErrors(side: Side, entry: number, tp: number | null, sl: number | null): Partial<Record<TpSlField, string>> {
  const errors: Partial<Record<TpSlField, string>> = {};
  const above = side === "long";
  if (tp !== null && (above ? tp <= entry : tp >= entry)) errors.takeProfit = `Take profit must be ${above ? "above" : "below"} entry`;
  if (sl !== null && (above ? sl >= entry : sl <= entry)) errors.stopLoss = `Stop loss must be ${above ? "below" : "above"} entry`;
  return errors;
}
