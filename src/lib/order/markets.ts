// Example data from the brief. The form never hard-codes a market: add one here and everything follows.

export type OrderType = "market" | "limit" | "stop";
export type Side = "long" | "short";

export interface Market {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  markPrice: number;
  pricePrecision: number;
  sizePrecision: number;
  minOrderSize: number;
  maxOrderSize: number;
  leverage: { min: number; max: number; default: number; marginMode: "cross" | "isolated" };
  feeRate: number;
  orderTypes: readonly OrderType[];
}

export interface Account {
  availableBalance: number;
  balanceCurrency: string;
}

export const account: Account = { availableBalance: 2500.0, balanceCurrency: "USDC" };

export const markets: readonly Market[] = [
  {
    symbol: "BTC-PERP",
    baseAsset: "BTC",
    quoteAsset: "USDC",
    markPrice: 68420.5,
    pricePrecision: 1,
    sizePrecision: 4,
    minOrderSize: 0.001,
    maxOrderSize: 50,
    leverage: { min: 1, max: 50, default: 20, marginMode: "cross" },
    feeRate: 0.000158,
    orderTypes: ["market", "limit", "stop"],
  },
  {
    symbol: "ETH-PERP",
    baseAsset: "ETH",
    quoteAsset: "USDC",
    markPrice: 3250.25,
    pricePrecision: 2,
    sizePrecision: 3,
    minOrderSize: 0.01,
    maxOrderSize: 500,
    leverage: { min: 1, max: 25, default: 10, marginMode: "cross" },
    feeRate: 0.000158,
    orderTypes: ["market", "limit", "stop"],
  },
  {
    symbol: "SOL-PERP",
    baseAsset: "SOL",
    quoteAsset: "USDC",
    markPrice: 178.4,
    pricePrecision: 2,
    sizePrecision: 2,
    minOrderSize: 0.1,
    maxOrderSize: 10000,
    leverage: { min: 1, max: 20, default: 5, marginMode: "cross" },
    feeRate: 0.000158,
    orderTypes: ["market", "limit"],
  },
];

export const marketBySymbol = (symbol: string): Market => {
  const m = markets.find((x) => x.symbol === symbol);
  if (!m) throw new Error(`Unknown market ${symbol}`);
  return m;
};

export interface ExampleOrder {
  market: string;
  side: Side;
  size: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
  expect: "valid" | "belowMinimum" | "aboveMaximum" | "insufficientBalance";
}

/** The brief's fixtures. Each must land on its `expect` status (tests and the state switcher use them). */
export const exampleOrders: readonly ExampleOrder[] = [
  { market: "BTC-PERP", side: "long", size: 0.05, leverage: 20, expect: "valid" },
  { market: "BTC-PERP", side: "long", size: 0.0005, leverage: 20, expect: "belowMinimum" },
  { market: "BTC-PERP", side: "short", size: 2.0, leverage: 20, expect: "insufficientBalance" },
  { market: "ETH-PERP", side: "long", size: 10, leverage: 25, expect: "valid" },
  { market: "ETH-PERP", side: "long", size: 600, leverage: 10, expect: "aboveMaximum" },
  { market: "SOL-PERP", side: "short", size: 50, leverage: 5, takeProfit: 160.0, stopLoss: 190.0, expect: "valid" },
];
