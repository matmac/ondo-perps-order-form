// Display formatting, en-US. Components render what these return; null renders "–".
import type { Market, Side } from "./markets.ts";
import { ceilTo, floorTo } from "./math.ts";

export const EMPTY = "–";

const fixed = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** "0.0500 BTC": sizePrecision decimals, trailing zeros kept, rounded down. */
export const formatSize = (market: Market, size: number | null, withUnit = true) =>
  size === null ? EMPTY : `${fixed(floorTo(size, market.sizePrecision), market.sizePrecision)}${withUnit ? ` ${market.baseAsset}` : ""}`;

/** "$68,420.5": pricePrecision decimals. */
export const formatPrice = (market: Market, price: number | null) =>
  price === null ? EMPTY : `$${fixed(price, market.pricePrecision)}`;

/** Liquidation rounds toward the mark: up for a long (it sits below mark), down for a short. */
export const formatLiquidation = (market: Market, side: Side, price: number | null) =>
  price === null
    ? EMPTY
    : formatPrice(market, side === "long" ? ceilTo(price, market.pricePrecision) : floorTo(price, market.pricePrecision));

/** "$2,500.00": balance, order value, margin, fee. */
export const formatQuote = (amount: number | null) => (amount === null ? EMPTY : `$${fixed(amount, 2)}`);

export const formatLeverage = (leverage: number) => `${Math.round(leverage)}x`;

/** "0.0158%" for the fee label. */
export const formatRate = (rate: number) => `${Number((rate * 100).toFixed(4))}%`;

export const formatPercent = (percent: number) => `${Math.round(percent)}%`;
