// node --test: the brief's fixtures, the formulas, formatting and input rules.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  account,
  amountError,
  deriveCta,
  deriveStatus,
  exampleOrders,
  fee,
  formatLiquidation,
  formatPrice,
  formatQuote,
  formatRate,
  formatSize,
  liquidationPrice,
  marginRequired,
  marketBySymbol,
  maxSize,
  orderValue,
  quoteToBase,
  sanitizeDecimal,
  sizeFromPercent,
  sizePercent,
  tpSlErrors,
  type StatusInput,
} from "./index.ts";

const BTC = marketBySymbol("BTC-PERP");
const input = (over: Partial<StatusInput> = {}): StatusInput => ({
  account,
  market: BTC,
  size: 0.05,
  leverage: 20,
  marketOpen: true,
  submitting: false,
  ...over,
});

test("every exampleOrder lands on its expected status", () => {
  for (const o of exampleOrders) {
    const market = marketBySymbol(o.market);
    const status = deriveStatus(input({ market, size: o.size, leverage: o.leverage }));
    assert.equal(status, o.expect === "valid" ? "ready" : o.expect, `${o.market} ${o.size}`);
    if (o.takeProfit !== undefined) {
      assert.deepEqual(tpSlErrors(o.side, market.markPrice, o.takeProfit, o.stopLoss ?? null), {}, "fixture TP/SL is valid");
    }
  }
});

test("status priority: first match wins", () => {
  assert.equal(deriveStatus(input({ account: null })), "signedOut");
  assert.equal(deriveStatus(input({ account: { availableBalance: 0 } })), "noFunds");
  assert.equal(deriveStatus(input({ submitting: true, size: 0.0005 })), "submitting");
  assert.equal(deriveStatus(input({ size: null })), "empty");
  assert.equal(deriveStatus(input({ size: 60 })), "aboveMaximum");
  assert.equal(deriveStatus(input({ marketOpen: false, size: 2 })), "insufficientBalance");
  assert.equal(deriveStatus(input({ marketOpen: false })), "marketClosed");
});

test("derived rows match the brief's formulas (BTC 0.05 @ 20x)", () => {
  assert.equal(formatQuote(orderValue(BTC, 0.05)), "$3,421.03");
  assert.equal(formatQuote(marginRequired(BTC, 0.05, 20)), "$171.05");
  assert.equal(formatQuote(fee(BTC, 0.05)), "$0.54");
  assert.equal(formatLiquidation(BTC, "long", liquidationPrice(BTC, "long", 20)), "$64,999.5");
  assert.equal(formatLiquidation(BTC, "short", liquidationPrice(BTC, "short", 20)), "$71,841.5");
  assert.equal(formatRate(BTC.feeRate), "0.0158%");
});

test("size: precision kept, rounded down, % of buying power round-trips", () => {
  assert.equal(formatSize(BTC, 0.05), "0.0500 BTC");
  assert.equal(formatSize(BTC, 0.73079), "0.7307 BTC");
  assert.equal(formatSize(marketBySymbol("ETH-PERP"), 500), "500.000 ETH");
  assert.equal(formatPrice(BTC, 68420.5), "$68,420.5");
  assert.equal(maxSize(BTC, 2500, 20), 0.7307);
  assert.equal(Math.round(sizePercent(BTC, 0.05, 2500, 20)), 7);
  assert.equal(sizeFromPercent(BTC, 25, 2500, 20), 0.1826);
  assert.equal(quoteToBase(BTC, 3421.03), 0.05);
});

test("validation copy says what to do", () => {
  const ETH = marketBySymbol("ETH-PERP");
  assert.equal(amountError("belowMinimum", input({ size: 0.0005 })), "Minimum 0.0010 BTC");
  assert.equal(amountError("aboveMaximum", input({ market: ETH, size: 600, leverage: 10 })), "Maximum 500.000 ETH");
  assert.equal(amountError("insufficientBalance", input({ size: 2 })), "Needs $6,842.05 margin · $2,500.00 available");
  assert.deepEqual(deriveCta("ready", "long", input()), { label: "Long 0.0500 BTC", tone: "success", disabled: false, loading: false });
  assert.equal(deriveCta("insufficientBalance", "short", input({ size: 2 })).label, "Deposit USDC");
  assert.equal(deriveCta("belowMinimum", "long", input({ size: 0.0005 })).disabled, true);
});

test("input accepts digits and one dot, cuts extra decimals", () => {
  assert.equal(sanitizeDecimal("1,250.50", 2), "1250.50");
  assert.equal(sanitizeDecimal("0.123456", 4), "0.1234");
  assert.equal(sanitizeDecimal("-1e5", 2), "15");
  assert.equal(sanitizeDecimal("1.2.3", 3), "1.23");
  assert.equal(sanitizeDecimal(".5", 2), "0.5");
  assert.equal(sanitizeDecimal("007", 2), "7");
  assert.equal(sanitizeDecimal("12.5", 0), "125");
});

test("TP/SL sides", () => {
  assert.deepEqual(tpSlErrors("long", 100, 110, 90), {});
  assert.deepEqual(Object.keys(tpSlErrors("long", 100, 90, 110)), ["takeProfit", "stopLoss"]);
  assert.deepEqual(tpSlErrors("short", 100, 90, 110), {});
});
