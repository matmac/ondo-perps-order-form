// Derived values (formulas from the brief). One stored quantity, size in the base asset; everything else comes from it.
import type { Market, Side } from "./markets.ts";

/** Rounds down to `decimals` without float drift (0.07 * 100 style errors). */
export const floorTo = (n: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.floor(Number((n * f).toFixed(6))) / f;
};
export const ceilTo = (n: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.ceil(Number((n * f).toFixed(6))) / f;
};

export const clampLeverage = (market: Market, leverage: number) =>
  Math.min(market.leverage.max, Math.max(market.leverage.min, Math.round(leverage)));

export const orderValue = (market: Market, size: number) => size * market.markPrice;
export const marginRequired = (market: Market, size: number, leverage: number) => orderValue(market, size) / leverage;
export const fee = (market: Market, size: number) => orderValue(market, size) * market.feeRate;
export const liquidationPrice = (market: Market, side: Side, leverage: number) =>
  market.markPrice * (side === "long" ? 1 - 1 / leverage : 1 + 1 / leverage);

export const buyingPower = (availableBalance: number, leverage: number) => availableBalance * leverage;

/** Size as % of buying power. Drives the slider and the % field; above 100 means not enough margin. */
export const sizePercent = (market: Market, size: number, availableBalance: number, leverage: number) => {
  const bp = buyingPower(availableBalance, leverage);
  return bp > 0 ? (orderValue(market, size) / bp) * 100 : 0;
};

/** Size for a % of buying power, rounded down so it never exceeds what the account can carry. */
export const sizeFromPercent = (market: Market, percent: number, availableBalance: number, leverage: number) =>
  floorTo((buyingPower(availableBalance, leverage) * percent) / 100 / market.markPrice, market.sizePrecision);

export const maxSize = (market: Market, availableBalance: number, leverage: number) =>
  Math.min(market.maxOrderSize, sizeFromPercent(market, 100, availableBalance, leverage));

/** Quote amount (USD) typed in the input → base size. Rounds down so a unit switch never drifts up. */
export const quoteToBase = (market: Market, quote: number) => floorTo(quote / market.markPrice, market.sizePrecision);
export const baseToQuote = (market: Market, size: number) => floorTo(size * market.markPrice, 2);
