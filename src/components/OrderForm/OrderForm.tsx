"use client";

import { useEffect, useId, useState } from "react";
import {
  amountError,
  deriveCta,
  deriveStatus,
  fee,
  formatLiquidation,
  formatPercent,
  formatPrice,
  formatQuote,
  formatRate,
  formatSize,
  liquidationPrice,
  marginRequired,
  maxSize,
  orderValue,
  parseDecimal,
  quoteToBase,
  sanitizeDecimal,
  sizeFromPercent,
  sizePercent,
  tpSlErrors,
  clampLeverage,
  type Account,
  type Market,
  type OrderType,
  type Side,
  type StatusInput,
} from "@/lib/order";
import { Alert } from "../Alert/Alert";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { DetailsList } from "../DetailsList/DetailsList";
import { Input } from "../Input/Input";
import { Label } from "../Label/Label";
import { LabelValueRow } from "../LabelValueRow/LabelValueRow";
import { OrderTypeBar } from "../OrderTypeBar/OrderTypeBar";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { Slider } from "../Slider/Slider";
import { Switch } from "../Switch/Switch";
import { ToggleGroup } from "../ToggleGroup/ToggleGroup";
import s from "./OrderForm.module.css";

const ORDER_TYPE_LABEL: Record<OrderType, string> = { market: "Market", limit: "Limit", stop: "Stop" };
const SIDES = [
  { value: "long", label: "Long" },
  { value: "short", label: "Short" },
] as const;
const QUICK = [25, 50, 75, 100] as const;
/** Default TP/SL distance when the trader turns TP/SL on (as in the Figma ready state). */
const TPSL_DEFAULT_PCT = 5;
/** Below minimum waits for blur or this pause, so the error does not flash while typing "0.00…". */
const SOFT_ERROR_DELAY = 600;
const PERCENT_PRECISION = 2;
const QUOTE_PRECISION = 2;
const SUBMIT_MS = 1600;

export interface OrderFormInitial {
  side?: Side;
  size?: number;
  leverage?: number;
  takeProfit?: number;
  stopLoss?: number;
}

export interface OrderFormProps {
  market: Market;
  /** null when signed out. */
  account: Pick<Account, "availableBalance"> | null;
  /** false shows the market closed notice. Trading stays possible. */
  marketOpen?: boolean;
  /** Starting values. Change the component key to apply new ones (the state switcher does). */
  initial?: OrderFormInitial;
  /** Sign in, Deposit, leverage and the hint modals are the 2nd layer: buttons that do nothing here. */
  onSecondLayer?: (what: string) => void;
}

type Unit = "base" | "quote";

/** Ondo Perps order form, v2. Everything shown is derived from one stored size (GUIDELINES §5–6). */
export function OrderForm({ market, account, marketOpen = true, initial, onSecondLayer = () => {} }: OrderFormProps) {
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [side, setSide] = useState<Side>(initial?.side ?? "long");
  const [leverage] = useState(() => clampLeverage(market, initial?.leverage ?? market.leverage.default));
  const [unit, setUnit] = useState<Unit>("base");
  const [amount, setAmount] = useState(initial?.size ? initial.size.toFixed(market.sizePrecision) : "");
  const [percentDraft, setPercentDraft] = useState<string | null>(null);
  const [softErrors, setSoftErrors] = useState(Boolean(initial?.size));
  const [tpsl, setTpsl] = useState(initial?.takeProfit !== undefined || initial?.stopLoss !== undefined);
  const [tp, setTp] = useState(initial?.takeProfit !== undefined ? initial.takeProfit.toFixed(market.pricePrecision) : "");
  const [sl, setSl] = useState(initial?.stopLoss !== undefined ? initial.stopLoss.toFixed(market.pricePrecision) : "");
  const [submitting, setSubmitting] = useState(false);
  const ids = useId();

  // One stored quantity: what the trader typed. Size in the base asset is derived from it.
  const typed = parseDecimal(amount);
  const size = typed === null ? null : unit === "base" ? typed : quoteToBase(market, typed);
  const balance = account?.availableBalance ?? 0;
  const input: StatusInput = { account, market, size, leverage, marketOpen, submitting };
  const status = deriveStatus(input);
  const cta = deriveCta(status, side, input);
  const error = amountError(status, input);
  const showError = error !== undefined && (status !== "belowMinimum" || softErrors);
  const canSize = account !== null && balance > 0;
  const hasSize = size !== null && size > 0;
  const percent = hasSize && balance > 0 ? sizePercent(market, size, balance, leverage) : 0;
  const tone = side === "long" ? "success" : "danger";
  const entry = market.markPrice;

  useEffect(() => {
    if (!amount) return;
    const t = setTimeout(() => setSoftErrors(true), SOFT_ERROR_DELAY);
    return () => clearTimeout(t);
  }, [amount]);

  useEffect(() => {
    if (!submitting) return;
    const t = setTimeout(() => {
      setSubmitting(false);
      setAmount("");
      setSoftErrors(false);
    }, SUBMIT_MS);
    return () => clearTimeout(t);
  }, [submitting]);

  const precision = unit === "base" ? market.sizePrecision : QUOTE_PRECISION;
  const setSize = (next: number) => {
    const n = Math.max(0, next);
    setAmount(unit === "base" ? n.toFixed(market.sizePrecision) : (n * market.markPrice).toFixed(QUOTE_PRECISION));
    setSoftErrors(true);
  };
  const setFromPercent = (p: number) =>
    !submitting &&
    setSize(p >= 100 ? maxSize(market, balance, leverage) : sizeFromPercent(market, p, balance, leverage));

  const switchUnit = (next: string) => {
    const u = next as Unit;
    if (u === unit) return;
    setUnit(u);
    if (size === null) return;
    // Converting quote → base rounds down to sizePrecision, so the size never drifts up.
    setAmount(u === "base" ? size.toFixed(market.sizePrecision) : (size * market.markPrice).toFixed(QUOTE_PRECISION));
  };

  const priceAt = (pct: number, up: boolean) => (entry * (1 + (up ? pct : -pct) / 100)).toFixed(market.pricePrecision);
  const pctOf = (price: string) => {
    const p = parseDecimal(price);
    return p === null ? "" : (Math.abs(p / entry - 1) * 100).toFixed(2);
  };
  const toggleTpsl = (on: boolean) => {
    setTpsl(on);
    if (on && !tp && !sl) {
      setTp(priceAt(TPSL_DEFAULT_PCT, side === "long"));
      setSl(priceAt(TPSL_DEFAULT_PCT, side === "short"));
    }
  };
  const tpslErr = tpsl ? tpSlErrors(side, entry, parseDecimal(tp), parseDecimal(sl)) : {};

  const helper = showError
    ? error
    : account === null
      ? "Sign in to see what you can trade"
      : balance <= 0
        ? formatQuote(0) + " available"
        : `${formatQuote(balance)} available · Max ${formatSize(market, maxSize(market, balance, leverage))}`;

  const filled = hasSize && status !== "empty";
  const liq = filled ? formatLiquidation(market, side, liquidationPrice(market, side, leverage)) : null;
  const tpslBlocks = Boolean(tpslErr.takeProfit || tpslErr.stopLoss);

  const submit = () => {
    if (cta.disabled || cta.loading) return;
    if (status === "signedOut" || status === "noFunds" || status === "insufficientBalance") return onSecondLayer(cta.label);
    if (tpslBlocks) return;
    setSubmitting(true);
  };

  return (
    <form
      className={s.form}
      aria-label={`${market.symbol} order`}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className={s.group}>
        <OrderTypeBar
          orderTypes={market.orderTypes.map((t) => ({ value: t, label: ORDER_TYPE_LABEL[t] }))}
          value={orderType}
          onValueChange={(v) => setOrderType(v as OrderType)}
          marginMode={market.leverage.marginMode === "cross" ? "Cross" : "Isolated"}
          leverage={leverage}
          onMarginClick={() => onSecondLayer("leverage")}
        />
        <SegmentedControl aria-label="Side" options={SIDES} tones={["success", "danger"]} value={side} onValueChange={(v) => setSide(v as Side)} />
        <dl>
          <LabelValueRow label="Current position" value={null} />
        </dl>
      </div>

      <div className={s.group}>
        <Input
          label="Amount"
          groupDigits
          value={amount}
          placeholder={(0).toFixed(precision)}
          onValueChange={(v) => {
            setAmount(sanitizeDecimal(v, precision));
            setSoftErrors(false);
            setPercentDraft(null);
          }}
          onBlur={() => setSoftErrors(true)}
          status={showError ? "error" : "default"}
          helper={helper}
          readOnly={submitting}
          trailing={
            <ToggleGroup
              aria-label="Amount unit"
              items={[
                { value: "base", label: market.baseAsset },
                { value: "quote", label: "USD" },
              ]}
              value={unit}
              onValueChange={switchUnit}
            />
          }
        />
        <div className={s.inline}>
          <Slider
            className={s.slider}
            aria-label="Size, percent of buying power"
            aria-valuetext={formatPercent(percent)}
            tone={tone}
            value={Math.min(100, percent)}
            onValueChange={setFromPercent}
            disabled={!canSize}
          />
          <Input
            className={s.percent}
            size="md"
            label="Size, percent of buying power"
            hideLabel
            unit="%"
            placeholder="0"
            value={percentDraft ?? (hasSize ? formatPercentField(percent) : "")}
            onValueChange={(v) => {
              const clean = sanitizeDecimal(v, PERCENT_PRECISION);
              setPercentDraft(clean);
              const p = parseDecimal(clean);
              if (p === null) setAmount("");
              else setFromPercent(p);
            }}
            onBlur={() => setPercentDraft(null)}
            disabled={!canSize}
            readOnly={submitting}
          />
        </div>
        <div className={s.inline}>
          {QUICK.map((p) => (
            <Button key={p} variant="secondary" className={s.fill} disabled={!canSize} onClick={() => setFromPercent(p)}>
              {p === 100 ? "Max" : `${p}%`}
            </Button>
          ))}
        </div>
      </div>

      <div className={s.group}>
        <ToggleRow
          id={`${ids}-reduce`}
          label="Reduce only"
          hint="No open position"
          checked={false}
          onCheckedChange={() => {}}
          disabled
        />
        <ToggleRow id={`${ids}-tpsl`} label="TP / SL" checked={tpsl} onCheckedChange={(on) => !submitting && toggleTpsl(on)} />
        {tpsl && (
          <>
            <div className={s.inline}>
              <Input
                className={s.fill}
                size="md"
                label="TP price"
                groupDigits
                value={tp}
                onValueChange={(v) => setTp(sanitizeDecimal(v, market.pricePrecision))}
                status={tpslErr.takeProfit ? "error" : "default"}
                helper={tpslErr.takeProfit}
                readOnly={submitting}
              />
              <Input
                className={s.fill}
                size="md"
                label="Gain"
                unit="%"
                value={pctOf(tp)}
                onValueChange={(v) => {
                  const p = parseDecimal(sanitizeDecimal(v, PERCENT_PRECISION));
                  setTp(p === null ? "" : priceAt(p, side === "long"));
                }}
                readOnly={submitting}
              />
            </div>
            <div className={s.inline}>
              <Input
                className={s.fill}
                size="md"
                label="SL price"
                groupDigits
                value={sl}
                onValueChange={(v) => setSl(sanitizeDecimal(v, market.pricePrecision))}
                status={tpslErr.stopLoss ? "error" : "default"}
                helper={tpslErr.stopLoss}
                readOnly={submitting}
              />
              <Input
                className={s.fill}
                size="md"
                label="Loss"
                unit="%"
                value={pctOf(sl)}
                onValueChange={(v) => {
                  const p = parseDecimal(sanitizeDecimal(v, PERCENT_PRECISION));
                  setSl(p === null ? "" : priceAt(p, side === "short"));
                }}
                readOnly={submitting}
              />
            </div>
          </>
        )}
      </div>

      <div className={s.decision}>
        <dl className={s.group}>
          <LabelValueRow size="sm" label="Est. liquidation price" value={liq} onLabelClick={() => onSecondLayer("liquidation")} />
          <LabelValueRow size="sm" label="Margin required" value={filled ? formatQuote(marginRequired(market, size!, leverage)) : null} />
        </dl>
        {!marketOpen && account !== null && (
          <Alert tone="warning" action={{ label: "Learn more", onClick: () => onSecondLayer("market hours") }}>
            The underlying market is closed. Liquidity and some safeguards are limited until it reopens.
          </Alert>
        )}
        <Button
          type="submit"
          tone={cta.tone}
          disabled={cta.disabled || tpslBlocks}
          loading={cta.loading}
          aria-describedby={showError ? `${ids}-reason` : undefined}
        >
          {cta.label}
        </Button>
        <span id={`${ids}-reason`} className="sr-only" aria-live="polite">
          {cta.loading ? "Placing order…" : showError ? error : ""}
        </span>
      </div>

      <DetailsList aria-label="Order details">
        <LabelValueRow label="Order value" value={filled ? formatQuote(orderValue(market, size!)) : null} />
        <LabelValueRow label="Est. price" value={filled ? formatPrice(market, market.markPrice) : null} />
        <LabelValueRow
          label="Net position"
          value={filled ? `${side === "long" ? "Long" : "Short"} ${formatSize(market, size)}` : null}
          tone={tone}
        />
        <LabelValueRow
          label={`Fee (${formatRate(market.feeRate)})`}
          labelAddon={<Badge tone="discovery">55% off</Badge>}
          value={filled ? formatQuote(fee(market, size!)) : null}
        />
        <LabelValueRow
          label="Slippage"
          onLabelClick={() => onSecondLayer("slippage")}
          secondary="Est. 0%"
          value="Max 8%"
          action={{ icon: "pencil-box", label: "Edit slippage", onClick: () => onSecondLayer("slippage") }}
        />
      </DetailsList>
    </form>
  );
}

/** Whole numbers above 1%, one decimal below, so a tiny size never reads as 0%. */
const formatPercentField = (p: number) =>
  p >= 1 ? Math.round(p).toLocaleString("en-US") : String(Math.max(0.1, Math.round(p * 10) / 10));

/** Toggle row pattern: Label (trigger) + Switch. The whole row is the target. */
function ToggleRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={s.toggleRow}
      data-disabled={disabled || undefined}
      onClick={(e) => {
        // The Switch handles its own clicks; the rest of the row forwards to it.
        if (!disabled && !(e.target as HTMLElement).closest("[role=switch]")) onCheckedChange(!checked);
      }}
    >
      <Label id={`${id}-label`} trigger>
        {label}
      </Label>
      {hint && (
        <span id={`${id}-hint`} className="sr-only">
          {hint}
        </span>
      )}
      <Switch
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
