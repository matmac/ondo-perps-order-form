"use client";

import { useState, type ReactNode } from "react";
import {
  Alert,
  Badge,
  Button,
  Divider,
  Icon,
  Input,
  Label,
  SegmentedControl,
  Slider,
  Switch,
  Tabs,
  ToggleGroup,
  type IconName,
} from "@/components";
import { icons } from "@/components/Icon/icons";
import s from "./components.module.css";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={s.section}>
      <h2 className={`type-label-sm ${s.sectionTitle}`}>{title}</h2>
      <div className={s.card}>{children}</div>
    </section>
  );
}

const Row = ({ children }: { children: ReactNode }) => <div className={s.row}>{children}</div>;
const ORDER_TYPES = [
  { value: "market", label: "Market" },
  { value: "limit", label: "Limit" },
  { value: "stop", label: "Stop" },
];
const SIDES = [
  { value: "long", label: "Long" },
  { value: "short", label: "Short" },
] as const;
const UNITS = [
  { value: "BTC", label: "BTC" },
  { value: "USD", label: "USD" },
];

export function Showcase() {
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("long");
  const [unit, setUnit] = useState("USD");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("68420.5");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tpsl, setTpsl] = useState(true);
  const [pct, setPct] = useState(25);
  const tone = side === "long" ? "success" : "danger";

  return (
    <div className={s.stack}>
      <Section title="Icon · xs 12 · sm 16 · md 20">
        {(["xs", "sm", "md"] as const).map((sz) => (
          <Row key={sz}>
            {(Object.keys(icons) as IconName[]).map((n) => (
              <span key={n} title={n} className={s.icon}>
                <Icon name={n} size={sz} />
              </span>
            ))}
          </Row>
        ))}
      </Section>

      <Section title="Button · primary (lg)">
        <div className={s.column}>
          <Button tone="success">Long BTC</Button>
          <Button tone="danger">Short BTC</Button>
          <Button>Connect wallet</Button>
          <Button tone="success" disabled>
            Enter an amount
          </Button>
          <Button tone="success" loading>
            Long BTC
          </Button>
        </div>
      </Section>

      <Section title="Button · secondary (sm) · tertiary (sm, xs)">
        <Row>
          <Button variant="secondary">Cross</Button>
          <Button variant="secondary" iconEnd="drop-down">
            20x
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Divider />
          <Button variant="tertiary" iconStart="adjust" aria-label="Slippage settings" />
          <Button variant="tertiary" size="xs" iconStart="switch" aria-label="Switch unit" />
          <Button variant="tertiary" iconStart="pencil-box">
            Edit
          </Button>
          <Button variant="tertiary" iconStart="x-circle" aria-label="Clear" disabled />
        </Row>
      </Section>

      <Section title="Label · tones, sizes, numeric, trigger · Badge · Divider">
        <Row>
          {(["subdued", "default", "muted", "success", "danger"] as const).map((t) => (
            <Label key={t} tone={t}>
              {t}
            </Label>
          ))}
          <Divider />
          <Label size="sm" tone="default">
            Size sm
          </Label>
          <Label numeric tone="default">
            $68,420.5
          </Label>
          <Label numeric size="sm" tone="success">
            +2.41%
          </Label>
          <Label trigger tabIndex={0}>
            Est. liquidation price
          </Label>
          <Divider />
          <Badge>20x</Badge>
          <Badge tone="discovery">New</Badge>
        </Row>
      </Section>

      <Section title="Tabs · Segmented Control · Toggle Group">
        <div className={s.column}>
          <Row>
            <Tabs aria-label="Order type" items={ORDER_TYPES} value={orderType} onValueChange={setOrderType} />
            <Tabs aria-label="Order type, disabled item" items={[...ORDER_TYPES.slice(0, 2), { value: "stop", label: "Stop", disabled: true }]} value="limit" onValueChange={() => {}} />
          </Row>
          <SegmentedControl aria-label="Side" options={SIDES} tones={["success", "danger"]} value={side} onValueChange={setSide} />
          <SegmentedControl aria-label="Side, neutral" options={SIDES} value={side} onValueChange={setSide} />
          <Row>
            <ToggleGroup aria-label="Size unit" items={UNITS} value={unit} onValueChange={setUnit} />
          </Row>
        </div>
      </Section>

      <Section title="Input · lg, md, helper, error, disabled, trailing slot">
        <div className={s.column}>
          <Input
            label="Size"
            value={size}
            onValueChange={setSize}
            trailing={<ToggleGroup aria-label="Size unit" items={UNITS} value={unit} onValueChange={setUnit} />}
            helper="Available 1,250.00 USD"
          />
          <Input label="Limit price" size="md" unit="USD" value={price} onValueChange={setPrice} trailing={<Button variant="tertiary" aria-label="Use mid price">Mid</Button>} />
          <Input label="Size" value="5000" onValueChange={() => {}} unit="USD" error="Not enough margin. Max 1,250.00 USD" />
          <Input label="Trigger price" size="md" unit="USD" value="" onValueChange={() => {}} disabled />
        </div>
      </Section>

      <Section title="Switch · Slider">
        <div className={s.column}>
          <Row>
            <span id="reduce-only" className="type-label-xs">Reduce only</span>
            <Switch aria-labelledby="reduce-only" checked={reduceOnly} onCheckedChange={setReduceOnly} />
            <span id="tpsl" className="type-label-xs">TP/SL</span>
            <Switch aria-labelledby="tpsl" checked={tpsl} onCheckedChange={setTpsl} />
            <Switch aria-label="Disabled switch" checked={false} onCheckedChange={() => {}} disabled />
          </Row>
          <Slider aria-label="Size, percent of available" aria-valuetext={`${pct}%`} tone={tone} value={pct} onValueChange={setPct} />
          <Slider aria-label="Disabled slider" tone={tone} value={50} onValueChange={() => {}} disabled />
          <Label numeric tone="default">{pct}%</Label>
        </div>
      </Section>

      <Section title="Alert · warning, danger, info">
        <div className={s.column}>
          <Alert>Price moved 1.2% from the mark. Check the price before you place the order.</Alert>
          <Alert tone="danger" action={{ label: "Deposit", onClick: () => {} }}>
            Not enough margin for this order.
          </Alert>
          <Alert tone="info">Limit orders rest on the book until filled or cancelled.</Alert>
        </div>
      </Section>
    </div>
  );
}
