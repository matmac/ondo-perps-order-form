"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderForm, Tabs, Label, Switch, ToggleGroup, Button, type OrderFormInitial } from "@/components";
import { ThemeSwitch } from "@/components/dev/ThemeSwitch";
import { account as demoAccount, exampleOrders, marketBySymbol, markets } from "@/lib/order";
import s from "./playground.module.css";

const TOAST_MS = 3000;

type AccountMode = "funded" | "signedOut" | "noFunds";

/**
 * Prototype controls around the form: what the 2nd layer and the backend would decide
 * (market, account, market hours) plus the brief's example orders. Not part of the product UI.
 */
export function Playground() {
  const [symbol, setSymbol] = useState(markets[0].symbol);
  const [accountMode, setAccountMode] = useState<AccountMode>("funded");
  const [marketOpen, setMarketOpen] = useState(true);
  const [initial, setInitial] = useState<OrderFormInitial | undefined>();
  const [run, setRun] = useState(0);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  // Out-of-scope clicks (2nd layer) show a short toast from the bottom, then leave on their own.
  useEffect(() => {
    if (!toast) return;
    const hide = setTimeout(() => setToastOpen(false), TOAST_MS);
    return () => clearTimeout(hide);
  }, [toast]);

  const market = marketBySymbol(symbol);
  const account = accountMode === "signedOut" ? null : { availableBalance: accountMode === "noFunds" ? 0 : demoAccount.availableBalance };
  const reset = (next?: OrderFormInitial) => {
    setInitial(next);
    setRun((r) => r + 1);
  };

  return (
    <div className={s.layout}>
      <OrderForm
        key={`${symbol}-${run}`}
        market={market}
        account={account}
        marketOpen={marketOpen}
        initial={initial}
        onSecondLayer={(what) => {
          setToast({ id: Date.now(), text: `${what[0].toUpperCase()}${what.slice(1)} opens the 2nd layer, out of scope for this build.` });
          setToastOpen(true);
        }}
      />

      <aside className={s.panel} aria-label="Prototype controls">
        <header className={s.head}>
          <Label size="sm" tone="default">Prototype controls</Label>
          <p className={`type-label-xs ${s.muted}`}>Not part of the form. They stand in for the asset picker, the account and the backend.</p>
        </header>

        <div className={s.field}>
          <Label>Market</Label>
          <Tabs
            aria-label="Market"
            stretch
            items={markets.map((m) => ({ value: m.symbol, label: m.baseAsset }))}
            value={symbol}
            onValueChange={(v) => {
              setSymbol(v);
              reset();
            }}
          />
        </div>

        <div className={s.field}>
          <Label>Account</Label>
          <ToggleGroup
            aria-label="Account"
            items={[
              { value: "funded", label: "$2,500 USDC" },
              { value: "noFunds", label: "No funds" },
              { value: "signedOut", label: "Signed out" },
            ]}
            value={accountMode}
            onValueChange={(v) => setAccountMode(v as AccountMode)}
          />
        </div>

        <div className={s.row}>
          <Label id="market-open">Market open</Label>
          <Switch aria-labelledby="market-open" checked={marketOpen} onCheckedChange={setMarketOpen} />
        </div>

        <div className={s.field}>
          <Label>Example orders from the brief</Label>
          <div className={s.orders}>
            {exampleOrders.map((o) => (
              <Button
                key={`${o.market}-${o.size}`}
                variant="secondary"
                className={s.order}
                onClick={() => {
                  setSymbol(o.market);
                  setAccountMode("funded");
                  reset({ side: o.side, size: o.size, leverage: o.leverage, takeProfit: o.takeProfit, stopLoss: o.stopLoss });
                }}
              >
                {o.side === "long" ? "Long" : "Short"} {o.size} {o.market.replace("-PERP", "")} · {o.leverage}x
                {o.takeProfit ? " · TP/SL" : ""} → {o.expect}
              </Button>
            ))}
          </div>
          <p className={`type-label-xs ${s.muted}`}>Submitting: place a valid order. Empty: clear the amount.</p>
        </div>

        <div className={s.row}>
          <Label>Theme</Label>
          <ThemeSwitch />
        </div>

        <nav className={s.links}>
          <Link href="/components" className="type-label-xs">Components</Link>
          <Link href="/tokens" className="type-label-xs">Tokens</Link>
        </nav>
      </aside>

      <div className={s.toast} data-open={toastOpen || undefined} role="status" aria-live="polite">
        {toast?.text}
      </div>
    </div>
  );
}
