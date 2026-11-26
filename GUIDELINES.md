# Ondo Perps order form: guidelines

This file is for engineers and AI coding agents who extend the order form. It lists the rules the design system enforces and why they exist, so new work ships the same way the rest of the form did.

If this file and Figma disagree, Figma wins on visuals and this file wins on behaviour. Either way, flag the conflict.

## 1. Where things live

| What | Where |
|---|---|
| Tokens (source of truth) | `tokens/*.json` (DTCG 2025.10). `npm run tokens` builds `tokens/dist/tokens.css` |
| Token rules | `tokens/README.md` |
| Order logic: market data, formulas, formatting, input rules, status model | `src/lib/order/`. Run the tests with `npm test` |
| Audit of the original (issues #1–#21; #17–#21 come from research, #2 is resolved) | Figma › 01 · Audit |
| Token sheet | Figma › 02 · Tokens |
| Motion spec and prototype | Figma › 03 · Motion |
| Decomposition overview (structure, inventory, tiers, state model, patterns) | Figma › 04 · Components |
| Each component's set and spec card | Figma › 04 · Components › ↳ <Component> page |
| Competitive research | Figma › 05 · Research, `docs/research/competitive.md` |
| v1, the in-between step: 20 states and a note on what v2 changed | Figma › 07 · Form v1 (archive) |
| Order form v2 (final): 20 states, mobile, before/after with audit tags | Figma › 08 · Form v2 (final) |

## 2. Ten rules

1. **Components use component tokens only, and nothing uses raw values.** `var(--button-primary-bg-success-hover)` belongs in a component. `var(--color-green-200)`, `#66d5b7` and `310px` don't. `npm run tokens` fails when a token skips a tier. `npm run lint` fails on an unknown token, and on a raw length, time, colour or curve in CSS. Geometry is the exception: `0`, `%`, flex factors and stacking order stay raw. JS timers get their durations from tokens through `durationMs()` in `src/lib/cssToken.ts`.
2. **Prop names match the Figma component properties exactly.** When Figma says `variant`, `tone`, `status` or `hasHelper`, React says the same. The interactive `state` property only exists in Figma. In code it becomes `:hover`, `:active` or `:focus-visible`.
3. **Store one value per quantity.** Size lives in the base asset (BTC, ETH, SOL). The USD amount, slider position, margin, fee and liquidation all come from it. None of them is stored.
4. **Never animate numbers.** A value changes in a single frame (see §8).
5. **Put validation errors on the field, and have the CTA repeat the reason.** Alerts are only for market and system notices.
6. **The CTA label says what will happen**, for example "Long 0.0500 BTC". It never says "Error" or "Submit".
7. **Green and red mean Long and Short, nothing else.** Settings use the neutral `switch/track/bg/on`.
8. **Components render empty values as "–".** Don't type a dash into data.
9. **Every interactive element gets a 24 px target on desktop and 44 px on mobile.** The size comes from `size/target/min` and the Layout modes. In code, controls compose `internal/target.module.css`, where an invisible pseudo-element grows the hit area without changing how the control looks.
10. **Spec new behaviour before you build it.** Add the prop in Figma › 04 · Components first, then write the code.

## 3. Tokens

- **Tiers.** There are three, and each one may only reference the tier directly below it.
  - Tier 1, Primitives, holds raw production values.
  - Tier 2, Semantic, holds intent. It covers Color [Dark], Layout [Desktop, Mobile], Typography, Motion [Default, Reduced] and Elevation.
  - Tier 3 is Component.
- **Naming.** Semantic tokens follow `category/property/role/emphasis/state`, and component tokens follow `component/part/property/variant/state`. States are `default | hover | pressed | focus | selected | disabled`.
- **Modes in CSS.** The default modes sit in `:root`. Mobile sits in `@media (max-width: 767px)` and Reduced motion in `@media (prefers-reduced-motion: reduce)`. If a token can handle a breakpoint or a motion preference, components don't branch on it in JS.
- **Theme.** `Semantic · Theme` has two modes. Classic is the default. Modern is a cosmetic exploration with radius 12/10 and Geist Mono for numbers. A theme can only change `radius/*` and `font/family/numeric`, so colour, spacing and layout stay shared. Switch it with the collection's mode in Figma and with `<html data-theme="modern">` in code. Don't hard-code a radius or a font family in a component.
- **Colour roles.** Tokens use standard roles: neutral, inverse, success, danger, warning, info and discovery. Product meaning is mapped once, here: **Long = success, Short = danger**. No token or prop is named after a side.
- **Typography.** Words use `label/*` and numbers use `value/*`. Every `value/*` element sets `font-variant-numeric: tabular-nums`. Each type token ships as a `font` shorthand (`--type-label-xs`) plus one property per part (`--type-label-xs-font-size`, `-font-family`, `-font-weight`, `-line-height`, `-letter-spacing`). The shorthand can't carry letter-spacing, so set `letter-spacing: var(--type-label-xs-letter-spacing)` next to it. Figma's split type variables use the same part names as their code syntax.
- **Adding a token.**
  1. Add a raw value to tier 1, but only if it's missing.
  2. Name the decision in tier 2 after its intent.
  3. Add a tier 3 token only when a component part needs one.
  4. Run `npm run tokens` and re-import into Figma.

## 4. Components

The form is built from two kinds of block, put together in the order form itself:

- **Components** stand on their own and work outside this form.
- **Patterns** are documented recipes made from components. They aren't components.

**Components**

| Component | Key props (= Figma properties) |
|---|---|
| `Button` | `variant: primary \| secondary \| tertiary` (emphasis), `tone: neutral \| success \| danger` (meaning, primary only), `size: lg \| sm \| xs`, `disabled` (stays focusable via `aria-disabled`), `loading` (spinner in the start slot, the label stays), `iconStart`, `iconEnd`, `href` (renders a link that looks the same), and the label as `children`. An icon-only button needs `aria-label`. |
| `SegmentedControl` | `options` (exactly two), `value`, `onValueChange`, `tones` (the indicator tone for each option). The order side passes `tones={['success', 'danger']}`. `role="radiogroup"`. |
| `Tabs` | `items[]` (`value`, `label`, `disabled`), `value`, `onValueChange`, `stretch`. Used for the order type, with items from `market.orderTypes`. The selected fill is a sliding indicator, and hover only changes the label. |
| `ToggleGroup` | `items[]` (`value`, `label`, `disabled`), `value`, `onValueChange`. Single choice, `role="radiogroup"`. A pill track with pill items (20), smaller than Tabs. Used for the amount unit (base \| USD) inside an Input. Tokens: `toggle-group/*`. |
| `Label` | `tone: subdued \| default \| muted \| success \| danger`, `size: xs \| sm`, `numeric`, `trigger` (dotted underline, opens a tooltip or modal), `children` |
| `Input` | `size: md \| lg`, `status: default \| error`, `label`, `hideLabel`, `value`, `onValueChange`, `unit`, `helper` (a hint, or the error message when `status="error"`), `disabled`, `readOnly`, `groupDigits`, `trailing` (slot). Always `inputmode="decimal"`. The caller applies precision with `sanitizeDecimal`. |
| `Slider` | `tone: success \| danger`, `value` (size as % of buying power), `onValueChange`, `min`, `max`, `step`, `disabled`, `aria-valuetext`. It looks as shipped: a ramp of 2px ticks (neutral into the tone colour by 50%) and an 11×16 grip thumb, on top of a native range input. |
| `Switch` | `checked`, `onCheckedChange`, `disabled`, `aria-labelledby`, `aria-describedby`. Just the control: its label lives in the toggle row. A 36×20 track with a 16px thumb. The whole toggle row is the click target. |
| `Divider` | `orientation: vertical \| horizontal` |
| `OrderForm` | `market`, `account` (null means signed out), `marketOpen`, `initial`, `onPlaceOrder` (returns a promise, and the form shows "Placing order…" until it settles), `onSecondLayer` (called by 2nd-layer buttons). Status is derived. It's never passed in. |
| `Badge` | `tone: discovery \| neutral`, `children` |
| `Alert` | `tone: info \| warning \| danger`, `children` (the message), `action` (`{ label, onClick }`) |
| `LabelValueRow` | `size: xs \| sm`, `tone: default \| muted \| success \| danger`, `label`, `onLabelClick` (turns the label into a trigger), `labelAddon` (Icon or Badge), `value` (null renders "–"), `secondary` (subdued text; the Divider only shows with it), `action` (`{ icon, label, onClick }`, a naked XS icon Button). It renders `<dt>`/`<dd>`, so put it inside a `<dl>`. |
| `DetailsList` | `children`: `LabelValueRow size="xs"` rows in one `<dl>`. Leave out any row a state doesn't need. |
| `OrderTypeBar` | `orderTypes[]`, `value`, `onValueChange`, `marginMode`, `leverage`, `onMarginClick`. Tabs on the left and one "Cross 20x" Button on the right, as in Ondo today. Figma also keeps `layout="stacked"` with `hasLeverage` (margin and leverage as separate Buttons). It isn't built in code because v2 doesn't use it; see audit #18. |
| `Icon` | `name`, `size: xs \| sm \| md`, `label` (only when the icon carries meaning on its own). Use the in-house set only. |

**Patterns**

| Pattern | Recipe |
|---|---|
| Amount input | `Input size="lg"` (the value uses `value/lg`, 18). In v2, a `ToggleGroup` (base \| USD) sits in `trailing`, and the helper reads "$2,500.00 available · Max 0.7307 BTC" or shows the error. |
| Size % (v2) | A `Slider` (tone from the side) and an `Input size="md" unit="%"` share one value. 100% = available × leverage, as in production. Leverage itself lives in the "Cross 20x" Button. |
| Quick size (v2) | 4 × `Button variant="secondary" size="sm"`: 25% · 50% · 75% · Max. Disabled when the trader is signed out or has no funds. |
| Review (v2) | 2 × `LabelValueRow size="sm"`: Est. liquidation price (trigger) and Margin required. They sit right above the Trade CTA, and inside the sticky bar on mobile. |
| Toggle rows | Reduce only, then TP / SL, stacked one row each with the label on the left and the switch on the right (as in Ondo today). The TP/SL inputs appear below when it's on. Never put two switches side by side, because they read as one control. |
| Toggle row | `Label tone="subdued" trigger` and a `Switch`. The whole row is the target. |
| TP/SL | A toggle row, then 2 × [`Input` price, `Input` %] |
| Trade CTA | `Button variant="primary"`. Its `tone` comes from the side (`success` / `danger`), or it's `tone="neutral"` for Sign in and Deposit USDC. The label comes from the status. |
| Account rows | 2 × `LabelValueRow size="sm"` |
| Decision bar (mobile) | In the Mobile layout, the Review rows, the notice and the Trade CTA stick to the bottom of the screen (`order-form/bar/*`). Cost and the action stay visible while the form scrolls. This only changes the visual order: keyboard and reading order still put the decision before the details. |

Patterns never reach into a component's internals. When a pattern needs a new look, add a prop or a component token to the component first. Only turn a pattern into a component when a second screen needs it.

## 5. State model

```ts
type Side = 'long' | 'short';
type Status =
  | 'signedOut' | 'noFunds' | 'empty' | 'ready'
  | 'belowMinimum' | 'aboveMaximum' | 'insufficientBalance'
  | 'marketClosed' | 'submitting';

// Derived on every change. Never stored.
function deriveStatus(i: {
  account: { availableBalance: number } | null;
  market: Market; size: number | null; leverage: number;
  marketOpen: boolean; submitting: boolean;
}): Status
```

Check the statuses in this order. The first match wins.

1. `signedOut`
2. `noFunds` (the balance is 0)
3. `submitting`
4. `empty`
5. `aboveMaximum`
6. `belowMinimum`
7. `insufficientBalance`
8. `marketClosed`
9. `ready`

| Status | Amount input | Trade CTA | Alert |
|---|---|---|---|
| signedOut | default | primary · "Sign in" | none |
| noFunds | default | primary · "Deposit USDC" | none |
| empty | placeholder | primary + tone · disabled · "Enter an amount" | none |
| ready | helper "$2,500.00 available · Max 0.7307 BTC" | primary + tone · "Long 0.0500 BTC" | none |
| belowMinimum | error "Minimum 0.0010 BTC" | primary + tone · disabled · same text | none |
| aboveMaximum | error "Maximum 500.000 ETH" | primary + tone · disabled · same text | none |
| insufficientBalance | error "Needs $6,842.05 margin · $2,500.00 available" | primary · "Deposit USDC" | none |
| marketClosed | default | primary + tone · enabled | warning, above the CTA |
| submitting | read-only | primary + tone · loading · "Placing order…" | none |

The test fixtures are the brief's `exampleOrders`, and each one has to land on its `expect` status.

## 6. Numbers

**Formulas** (from the brief):

```
orderValue        = size × markPrice
marginRequired    = orderValue / leverage
fee               = orderValue × feeRate
liquidationLong   = markPrice × (1 − 1/leverage)
liquidationShort  = markPrice × (1 + 1/leverage)
buyingPower       = availableBalance × leverage
sizePercent       = orderValue / buyingPower × 100   (slider and % field; > 100 means insufficient)
maxSize           = floor(buyingPower / markPrice, sizePrecision)
```

**Formatting** (locale en-US):

| Value | Rule |
|---|---|
| Size | `sizePrecision` decimals, trailing zeros kept, rounded **down**, with the unit: "0.0500 BTC". |
| Price | `pricePrecision` decimals with a "$" prefix: "$68,420.5". |
| Liquidation | Rounds toward the mark, so a long rounds up and a short rounds down. |
| Quote amounts | 2 decimals with "$". Covers balance, order value, margin and fee. |
| Leverage | An integer clamped to `market.leverage`, with an "x" suffix. |

**Input:**
- **Allowed characters.** Digits and one ".". Commas get stripped on paste. Minus signs and exponents are rejected.
- **Decimals while typing.** Anything past the precision is cut, not rounded.
- **Grouping.** Digits are grouped on blur only.
- **Unit switch.** Converting quote to base rounds down to `sizePrecision`, so the value never drifts.
- **Error timing.** Blocking errors (above maximum, insufficient balance) show while the trader types. Below-minimum waits for blur or 600 ms.

**How controls affect each other:**
- **Market change.** Clamp leverage to the new maximum. If the order type isn't available, fall back to Market. Clear the amount and TP/SL.
- **Side change.** Keep TP/SL and validate it again. For a long, TP sits above entry and SL below it. A short is the other way round.
- **Leverage change.** Only margin and liquidation update. Size never changes.
- **Reduce only.** With no open position, it's disabled with the hint "No open position".

## 7. Accessibility

- **Order side, order type and amount unit.** The Segmented Control (side) is a `role="radiogroup"`. Tabs (order type) are a `role="tablist"`. The Toggle Group (amount unit) is a `role="radiogroup"` with `aria-label="Amount unit"`. Each uses a roving tabindex, and the arrow keys move between options.
- **Number fields.** Every field is a real `<input inputmode="decimal">` with a linked label. Errors use `aria-invalid` and `aria-describedby`.
- **Slider.** It's a native range input (`role="slider"`) with `aria-valuetext`, for example "25%". Arrows step by 1 and PageUp/PageDown by 10. Home and End jump to the limits.
- **Switch.** It uses `role="switch"`, and the whole row is clickable.
- **Disabled CTA.** It stays focusable through `aria-disabled` and points to its reason. Label changes are announced with `aria-live="polite"`.
- **Summary.** The summary is one `<dl>`. Hints open on focus as well as hover.
- **Contrast.** Text contrast is at least 4.5:1. `color/fg/tertiary` reaches 4.7:1. `fg/disabled` is only for disabled text and placeholders.
- **Focus.** Use `focus-ring/*` with `:focus-visible`. Never set `outline: none` without a replacement.

## 8. Motion

| Transition | Duration | Easing |
|---|---|---|
| Side indicator, order-type indicator, slider mirror | `motion/duration/move` | `motion/easing/emphasized` |
| Colour, border, label and helper crossfades | `motion/duration/state` | `motion/easing/standard` |
| Hover, press (CTA scale 0.98), thumb grab | `motion/duration/feedback` | `motion/easing/standard` |
| TP/SL and notice reveal (`grid-template-rows` 0fr → 1fr) | `motion/duration/reveal` | `motion/easing/enter` (exit: `state` + `exit`) |
| Spinner | `motion/duration/loop` | linear |
| CTA press | `motion/scale/press` (0.98, 1 in Reduced) over `motion/duration/feedback` | `motion/easing/standard` |
| Wait before a soft validation (below minimum) | `motion/delay/validate` | none |
| How long a toast stays | `motion/duration/notice` | none |

Rules that apply everywhere:
- **Animate cheap properties only:** transform, opacity and colour.
- **The touched control responds instantly.** Whatever mirrors it does the animating.
- **No celebration.** No bounce, shake or confetti.
- **Reduced motion comes from the tokens.** Their Reduced mode handles it, so you don't write extra code.
- **In code.** Reveals use `src/components/internal/Reveal`, which keeps content mounted and inert while it's closed. The Slider thumb animates when another control sets the size. While the trader drags or steps the slider, the thumb follows with no transition. The Tabs indicator is measured, so labels can have different widths.

## 9. Content

- **Case.** Sentence case: "Reduce only", "Take profit / Stop loss".
- **Copy matches production.** Write "Available to trade", not "Available Perps Margin".
- **Errors.** Tell the trader what to do, with numbers: "Minimum 0.0010 BTC".
- **Units.** Always show the unit. Show the fee as an amount and put the rate in the label: "Fee (0.0158%)  $0.54".

## 10. Recipes

**Add the Limit price field (2nd layer):**
1. In Figma, add `orderType=limit` to `OrderForm` and put an `Input size=md label="Limit price" unit="$"` after the Segmented Control.
2. Stick to existing tokens. If one is missing, add it to `3-component.json` under `input`.
3. In code, show the field when `orderType === 'limit'` and put `estPrice = limitPrice` in the summary.
4. Add validation: a limit long must be at or below `markPrice × (1 + maxSlippage)`. Write the error in the style from §9.
5. Reveal the field with the TP/SL reveal tokens.

**Add a market:** add it to the market data, and that's it. Precision, limits, leverage, order types and formatting follow on their own. If anything needs a code change, that's a bug.

**Add a status:**
1. Add it to `Status` and to `deriveStatus`, in priority order.
2. Add a row to §5.
3. Add the variant to `OrderForm` for both sides.
4. If the trader can see the change, add a before/after note.

## 11. Definition of done

- [ ] No hex values and no tier 1 or tier 2 tokens inside components. `npm run tokens` passes.
- [ ] Props match the Figma properties one to one.
- [ ] Every `exampleOrders` fixture reaches its expected status (`npm test`).
- [ ] A keyboard-only run-through passes, and the screen reader labels are checked.
- [ ] Both Layout modes and both Motion modes are checked.
- [ ] Figma › 04 · Components and 08 · Form v2 (final) are updated in the same change.
