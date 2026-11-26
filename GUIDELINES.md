# Ondo Perps order form: guidelines

These guidelines are for engineers and AI coding agents who extend the order form. They give the rules the design system enforces and the reasons for them, so a change ships the way the rest of the form was built. When this file and the Figma file disagree, Figma is the source of truth for visuals and this file is the source of truth for behaviour. Raise the conflict in either case.

## 1. Where things live

| What | Where |
|---|---|
| Tokens (source of truth) | `tokens/*.json` (DTCG 2025.10). Build with `npm run tokens`, which outputs `tokens/dist/tokens.css` |
| Token rules | `tokens/README.md` |
| Order logic: market data, formulas, formatting, input rules, status model | `src/lib/order/` · tests with `npm test` |
| Audit of the original (issues #1–#21; #17–#21 from research, #2 resolved) | Figma › 01 · Audit |
| Token sheet | Figma › 02 · Tokens |
| Motion spec and prototype | Figma › 03 · Motion |
| Decomposition overview (structure, inventory, tiers, state model, patterns) | Figma › 04 · Components |
| Each component: set + spec card | Figma › 04 · Components › ↳ <Component> page |
| Competitive research | Figma › 05 · Research, `docs/research/competitive.md` |
| v1 intermediate step: 20 states and a note on what v2 changed | Figma › 07 · Form v1 (archive) |
| Order form v2 (final): 20 states, mobile, before/after with audit tags | Figma › 08 · Form v2 (final) |

## 2. Ten rules

1. **Use only component tokens inside components, and no raw values anywhere.** For example, `var(--button-primary-bg-success-hover)` belongs in a component, but `var(--color-green-200)`, `#66d5b7` or `310px` do not. `npm run tokens` fails if a token skips a tier, and `npm run lint` fails on an unknown token or a raw length, time, colour or curve in CSS. Only geometry stays raw: `0`, `%`, flex factors and stacking order. JS timers read duration tokens with `durationMs()` from `src/lib/cssToken.ts`.
2. **Keep prop names identical to the Figma component properties.** If Figma says `variant`, `tone`, `status` or `hasHelper`, React uses the same names. Interactive `state` exists only in Figma. In code it is `:hover`, `:active` or `:focus-visible`.
3. **Store one value per quantity.** Size is stored in the base asset (BTC, ETH, SOL). The USD amount, the slider position, margin, fee and liquidation are all derived from it and never stored.
4. **Never animate numbers.** Values change in a single frame (see §8).
5. **Validation errors belong on the field, and the CTA repeats the reason.** Alert is reserved for market and system notices.
6. **Make the CTA label say what will happen**, for example "Long 0.0500 BTC". Never use "Error" or "Submit".
7. **Use green and red only to mean Long and Short.** Settings use the neutral `switch/track/bg/on`.
8. **Let components render empty values as "–".** Never type a dash into data.
9. **Give every interactive element a 24 px target on desktop and a 44 px target on mobile.** This comes from `size/target/min` and the Layout modes. In code, controls compose `internal/target.module.css`: an invisible pseudo-element grows the hit area without changing the look.
10. **Get new behaviour into the spec before it goes into code.** Add the prop to Figma › 03 first, then build it.

## 3. Tokens

- **Tiers.** There are three:
  - Tier 1 is Primitives, which hold raw production values.
  - Tier 2 is Semantic, which holds intent. It covers Color [Dark], Layout [Desktop, Mobile], Typography, Motion [Default, Reduced] and Elevation.
  - Tier 3 is Component.

  Each tier may reference only the tier directly below it.
- **Naming.** Semantic tokens follow `category/property/role/emphasis/state`. Component tokens follow `component/part/property/variant/state`. States come from `default | hover | pressed | focus | selected | disabled`.
- **Modes in CSS.** Default modes sit in `:root`. Mobile sits in `@media (max-width: 767px)`, and Reduced motion sits in `@media (prefers-reduced-motion: reduce)`. Components never branch on breakpoint or motion preference in JS when a token can do it.
- **Theme.** `Semantic · Theme` has two modes: Classic (default) and Modern (a cosmetic exploration: radius 12/10 and Geist Mono for numbers). A theme may change only `radius/*` and `font/family/numeric`; colour, spacing and layout are shared. Switch it in Figma with the collection's mode, in code with `<html data-theme="modern">`. Never hard-code a radius or a font family in a component.
- **Colour roles.** Tokens use standard roles: neutral, inverse, success, danger, warning, info, discovery. Product meaning is mapped once, here: **Long = success, Short = danger**. No token or prop is named after a side.
- **Typography.** Use `label/*` for words and `value/*` for numbers. Every `value/*` element sets `font-variant-numeric: tabular-nums`. Each type token comes as a `font` shorthand (`--type-label-xs`) plus one property per part (`--type-label-xs-font-size`, `-font-family`, `-font-weight`, `-line-height`, `-letter-spacing`). The shorthand cannot carry letter-spacing, so set `letter-spacing: var(--type-label-xs-letter-spacing)` beside it. Figma's split type variables use these same part names as code syntax.
- **Adding a token.**
  1. Add a raw value to tier 1 only if one is missing.
  2. Name the decision in tier 2 by its intent.
  3. Add a tier 3 token only when a component part needs it.
  4. Run `npm run tokens` and re-import into Figma.

## 4. Components

There are three kinds of building block:

- **Components** are independent and reusable beyond this form.
- **Patterns** are documented recipes composed from components. They are not components themselves.
- **The order form** is the assembly.

**Components**

| Component | Key props (= Figma properties) |
|---|---|
| `Button` | `variant: primary \| secondary \| tertiary` (emphasis), `tone: neutral \| success \| danger` (meaning; on primary only), `size: lg \| sm \| xs`, `disabled` (stays focusable via `aria-disabled`), `loading` (spinner in the start slot, label stays), `iconStart`, `iconEnd`, `href` (renders a link with the same look), label as `children`. Icon-only needs `aria-label`. |
| `SegmentedControl` | `options` (exactly two), `value`, `onValueChange`, `tones` (indicator tone per option). Order side passes `tones={['success', 'danger']}`. `role="radiogroup"`. |
| `Tabs` | `items[]` (`value`, `label`, `disabled`), `value`, `onValueChange`, `stretch`. Used for the order type; items come from `market.orderTypes`. The selected fill is a sliding indicator; hover changes the label only. |
| `ToggleGroup` | `items[]` (`value`, `label`, `disabled`), `value`, `onValueChange`. Single choice, `role="radiogroup"`. Pill track and pill items (20), smaller than Tabs. Used for the amount unit (base \| USD) inside an Input. Tokens `toggle-group/*`. |
| `Label` | `tone: subdued \| default \| muted \| success \| danger`, `size: xs \| sm`, `numeric`, `trigger` (dotted underline, opens a tooltip or modal), `children` |
| `Input` | `size: md \| lg`, `status: default \| error`, `label`, `hideLabel`, `value`, `onValueChange`, `unit`, `helper` (hint, or the error message with `status="error"`), `disabled`, `readOnly`, `groupDigits`, `trailing` (slot). Always `inputmode="decimal"`; precision is applied by the caller with `sanitizeDecimal`. |
| `Slider` | `tone: success \| danger`, `value` (size as % of buying power), `onValueChange`, `min`, `max`, `step`, `disabled`, `aria-valuetext`. Visual as shipped: a ramp of 2px ticks (neutral → tone colour at 50%) and an 11×16 grip thumb, over a native range input. |
| `Switch` | `checked`, `onCheckedChange`, `disabled`, `aria-labelledby`, `aria-describedby`. The control only; its label lives in the toggle row. Track 36×20 with a 16px thumb; the whole toggle row is the click target. |
| `Divider` | `orientation: vertical \| horizontal` |
| `OrderForm` | `market`, `account` (null = signed out), `marketOpen`, `initial`, `onPlaceOrder` (returns a promise; the form shows "Placing order…" until it settles), `onSecondLayer` (2nd-layer buttons call it). Status is derived, never passed in. |
| `Badge` | `tone: discovery \| neutral`, `children` |
| `Alert` | `tone: info \| warning \| danger`, `children` (message), `action` (`{ label, onClick }`) |
| `LabelValueRow` | `size: xs \| sm`, `tone: default \| muted \| success \| danger`, `label`, `onLabelClick` (makes the label a trigger), `labelAddon` (Icon or Badge), `value` (null renders "–"), `secondary` (subdued text; the Divider renders only with it), `action` (`{ icon, label, onClick }`, naked icon Button XS). Renders `<dt>`/`<dd>`: place it in a `<dl>`. |
| `DetailsList` | `children`: `LabelValueRow size="xs"` rows, one `<dl>`. Leave out the rows a state does not need. |
| `OrderTypeBar` | `orderTypes[]`, `value`, `onValueChange`, `marginMode`, `leverage`, `onMarginClick`. Tabs left, one "Cross 20x" Button right, as in Ondo today. Figma also keeps `layout="stacked"` with `hasLeverage` (separate margin and leverage Buttons), not built in code because v2 does not use it; see audit #18. |
| `Icon` | `name`, `size: xs \| sm \| md`, `label` (only when the icon carries meaning alone). Use the in-house set only. |

**Patterns**

| Pattern | Recipe |
|---|---|
| Amount input | `Input type="number" size="lg"` (value uses `value/lg`, 18). v2: `Toggle Group` (base \| USD) in `trailing`, helper "$2,500.00 available · Max 0.7307 BTC" or the error. |
| Size % (v2) | `Slider` (tone from side) and `Input type="number" size="md" unit="%"` sharing one value. 100% = available × leverage, as in production. Leverage itself lives in the "Cross 20x" Button. |
| Quick size (v2) | 4 × `Button variant="secondary" size="sm"`: 25% · 50% · 75% · Max. Disabled when signed out or unfunded. |
| Review (v2) | 2 × `LabelValueRow size="sm"`: Est. liquidation price (trigger), Margin required. Directly above the Trade CTA; inside the sticky bar on mobile. |
| Toggle rows | Reduce only, then TP / SL, stacked: one row each, label left, switch right (as in Ondo today). TP/SL inputs appear below when on. Never put two switches side by side: they read as one control. |
| Toggle row | `Label tone="subdued" trigger` and a `Switch`. The whole row is the target. |
| TP/SL | A toggle row, then 2 × [`Input` price, `Input` %] |
| Trade CTA | `Button variant="primary"` with `tone` from the side (`success` / `danger`), or `tone="neutral"` for Sign in / Deposit USDC, with its label from the status |
| Account rows | 2 × `LabelValueRow size="sm"` |
| Decision bar (mobile) | In the Mobile layout the Review rows, the notice and the Trade CTA stick to the bottom of the screen (`order-form/bar/*`), so cost and the action stay visible while the form scrolls. Visual order only: keyboard and reading order keep the decision before the details. |

Patterns never reach into a component's internals. If a pattern needs a new look, add a prop or a component token to the component first. Promote a pattern to a component only when a second screen needs it.

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
  market: Market; sizeBase: number | null; leverage: number;
  marketOpen: boolean; submitting: boolean;
}): Status
```

Evaluate the statuses in this order. The first match wins.

1. `signedOut`
2. `noFunds` (when the balance is 0)
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

Test fixtures are the brief's `exampleOrders`. Every one of them must land on its `expect` status.

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
| Size | `sizePrecision` decimals. Keep trailing zeros, round **down**, and append the unit: "0.0500 BTC". |
| Price | `pricePrecision` decimals with a "$" prefix: "$68,420.5". |
| Liquidation | Round toward mark: a long rounds up and a short rounds down. |
| Quote amounts | 2 decimals with "$": balance, order value, margin and fee. |
| Leverage | An integer clamped to `market.leverage`, with an "x" suffix. |

**Input:**
- **Allowed characters.** Accept digits and one ".". Strip "," on paste. Reject minus signs and exponents.
- **Decimals while typing.** Truncate past the precision instead of rounding.
- **Grouping.** Group digits on blur only.
- **Unit switch.** The quote → base conversion rounds down to `sizePrecision`, so the value never drifts.
- **Error timing.** Show blocking errors (above maximum, insufficient balance) while typing. Show below-minimum on blur or after 600 ms.

**Cross-component behaviour:**
- **Market change.** Clamp leverage to the new maximum, fall back to Market if the order type is unavailable, and clear the amount and TP/SL.
- **Side change.** Keep TP/SL and re-validate it. A TP must sit above entry for a long and below it for a short, and SL the reverse.
- **Leverage change.** Update only margin and liquidation, never size.
- **Reduce only.** Disable it, with the hint "No open position", when no position exists.

## 7. Accessibility

- **Order side and order type.** The Segmented Control (side) is a `role="radiogroup"`, Tabs (order type) are a `role="tablist"`, and the Toggle Group (amount unit) is a `role="radiogroup"` with `aria-label="Amount unit"`. Both use a roving tabindex, and the arrow keys move between options.
- **Number fields.** Each field is a real `<input inputmode="decimal">` with a linked label. Errors use `aria-invalid` plus `aria-describedby`.
- **Slider.** The slider uses `role="slider"` with `aria-valuetext` (for example "20x"). Arrows step ±1, PageUp and PageDown step ±5, and Home and End jump to the limits.
- **Switch.** A switch uses `role="switch"`, and the whole row is clickable.
- **Disabled CTA.** It stays focusable through `aria-disabled` and points to its reason. Label changes are announced with `aria-live="polite"`.
- **Summary.** The summary is one `<dl>`. Hints open on focus as well as on hover.
- **Contrast.** Text has a contrast of at least 4.5:1, which `color/fg/tertiary` reaches at 4.7:1. `fg/disabled` is used only for disabled text and placeholders.
- **Focus.** Use `focus-ring/*` with `:focus-visible`, never `outline: none` without a replacement.

## 8. Motion

| Transition | Duration | Easing |
|---|---|---|
| Side indicator, order-type indicator, slider mirror | `motion/duration/move` | `motion/easing/emphasized` |
| Colour, border, label and helper crossfades | `motion/duration/state` | `motion/easing/standard` |
| Hover, press (CTA scale 0.98), thumb grab | `motion/duration/feedback` | `motion/easing/standard` |
| TP/SL and notice reveal (`grid-template-rows` 0fr → 1fr) | `motion/duration/reveal` | `motion/easing/enter` (exit: `state` + `exit`) |
| Spinner | `motion/duration/loop` | linear |
| CTA press | `motion/scale/press` (0.98, 1 in Reduced) over `motion/duration/feedback` | `motion/easing/standard` |
| Soft validation (below minimum) waits | `motion/delay/validate` | none |
| Toast stays | `motion/duration/notice` | none |

These rules apply throughout:
- **Animate only cheap properties.** Use transform, opacity and colour.
- **Keep the touched control instant.** The control under the trader's hand responds immediately, and whatever mirrors it animates.
- **No celebration.** Use no bounce, no shake and no confetti.
- **Reduced motion comes from tokens.** The Reduced mode in the tokens handles it, so no extra code is needed.
- **In code.** Reveals use `src/components/internal/Reveal` (content stays mounted and inert while closed). The Slider thumb animates when another control sets the size and follows the hand with no transition while the slider itself is dragged or stepped. The Tabs indicator is measured, so labels can differ in width.

## 9. Content

- **Case.** Use sentence case: "Reduce only", "Take profit / Stop loss".
- **Copy matches production.** Write "Available to trade", not "Available Perps Margin".
- **Errors.** Say what to do, using numbers: "Minimum 0.0010 BTC".
- **Units.** Always show the unit. Show the fee as an amount, with the rate in the label: "Fee (0.0158%)  $0.54".

## 10. Recipes

**Add the Limit price field (2nd layer):**
1. In Figma › 03, add `orderType=limit` to `OrderForm` and insert an `Input type=number size=md label="Limit price" unit="$"` after the Segmented Control.
2. Use existing tokens only. If you find one missing, add it to `3-component.json` under `input`.
3. In code, show the field when `orderType === 'limit'`. Put `estPrice = limitPrice` into the summary.
4. Add validation: a limit long must be at or below `markPrice × (1 + maxSlippage)`. Write the copy in the error style from §9.
5. Reveal the field with the TP/SL reveal tokens.

**Add a market:** add it to the market data only. Precision, limits, leverage, order types and formatting all follow automatically. If something needs a code change, that is a bug.

**Add a status:**
1. Add it to `Status` and to `deriveStatus` in priority order.
2. Add a row to §5.
3. Add the variant to `OrderForm` for both sides.
4. Add a before/after note if it changes something the trader can see.

## 11. Definition of done

- [ ] No hex values or tier-1/tier-2 tokens inside components, and `npm run tokens` passes.
- [ ] Props match the Figma properties one to one.
- [ ] Every `exampleOrders` fixture reaches its expected status (`npm test`).
- [ ] Keyboard-only run-through passes, and screen-reader labels are checked.
- [ ] Both Layout modes and both Motion modes are checked.
- [ ] Figma › 03 and 04 are updated in the same change.
