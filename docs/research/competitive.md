# Competitive research: perps order forms

Input to Order form v2 (Figma › 08 · Form v2). The visual version, with the panels, is Figma › 05 · Research. Audit issues #17–#21 come from this research (Figma › 01 · Audit).

## Question

What do the best perps venues do in the order form that a trader who places 400 orders a day would defend, and that still feels like Ondo Perps?

## Method

- **Date:** 24 Nov 2026.
- **Setup:** live trade pages, signed out, BTC market, desktop at 1600 × 1000 @2x.
- **Capture:** Playwright, 9 s settle time. The script is `shoot.js`.
- **Venues tried:** 13. Ondo Perps, Hyperliquid, dYdX, Lighter, Drift, Paradex, GMX, Aster, Binance, Bybit, OKX, Coinbase Advanced and Kraken Pro.
- **Venues used for panel crops:** 7. Ondo Perps, Hyperliquid, dYdX, Lighter, Drift, Paradex and Bybit. The other six gave no usable order panel while signed out. Their full-page captures are kept.
- **Mobile:** Mobbin references for Binance Futures, Crypto.com, Phantom and OKX. Mobbin needs a login, so these are cited, not embedded.
- **Peer weighting:** Ondo Perps is a Hyperliquid-lineage layout. The closest peers are Hyperliquid, Paradex, Lighter and dYdX.
- **Test for each pattern:** the brief's test. Could you defend it to a trader who uses this form 400 times a day, and does it still feel like Ondo Perps?

## Files

| What | Where |
| --- | --- |
| Full-page captures (13) | `competitors/*.png` |
| Order panel crops (7) | `competitors/crops/*.jpg` |
| Ondo Perps live, desktop and mobile | `live-desktop.jpg`, `live-mobile.jpg` |
| Live app tokens and first-pass findings | `findings.md`, `app-root-tokens.txt` |

## Observations by venue

### Ondo Perps (live today)
- The slider sets size as % of buying power: a tick ramp with a "0%" box. Leverage sits in the "Cross 15x" chip.
- TP/SL has a $ / % unit switch on Gain and Loss.
- The CTA sits before the details, so the cost is read after the button.

### Hyperliquid
- Margin mode, leverage and account mode are three separate buttons. Each is one tap and nothing is hidden.
- Size has a unit dropdown inside the field.
- Liquidation price is the first detail row. The CTA is pinned to the bottom of the panel.

### dYdX
- The side tabs come before the order type.
- The amount field has a unit chip and a swap button.
- A collapsible "Receipt" sits directly above the CTA. It shows expected price, liquidation, margin and fee.

### Lighter
- Side comes first, then Market / Limit / RFQ.
- TP/SL and Reduce only share one row, which keeps the form short.
- The details list order size and value first, then liquidation and margin.

### Drift
- "Available: $" sits directly above Size, where the trader is already looking.
- The slider is labelled 0 / 25 / 50 / 75 / 100%, so a size is one tap.
- Margin Required is the first row under the CTA.

### Paradex
- BTC | USD is a segmented toggle inside the size field, so the active unit is always visible.
- The slider has labelled % stops.
- The CTA names the action: "Confirm Buy".

### Bybit
- A Value / Cost box sits right above the CTA, so the trader sees the cost before committing.
- Margin mode and leverage are two separate selects.
- The quantity unit can be chosen inside the field.

### Mobile (Mobbin)
- **Binance Futures:** max size and cost sit directly above each Buy / Sell button.
- **Crypto.com:** the amount is the hero, with the quantity under it. Est. margin required and margin available sit above "Place Order".
- **Phantom:** a very large amount, with leverage under it. "Insufficient Funds" appears inline right there, not in a toast.
- **OKX:** the slider stops are labelled 0 / 25 / 50 / 75 / 100%. Max buy and cost sit under the CTA.

## Synthesis

| Pattern | Seen in | Verdict | Defence for a 400-orders-a-day trader | Lands as |
| --- | --- | --- | --- | --- |
| The slider sets size as % of buying power. Leverage has its own control. | Ondo Perps (live), Hyperliquid, dYdX, Lighter, Drift, Paradex, Bybit, Binance, OKX | Take (decision) | Every venue does this, including Ondo's own production. Muscle memory is the strongest UX asset a trader has. % of buying power (available × leverage) is how amount and leverage relate. | Audit #1, #2. v2 change 9 |
| Cost at the decision point: liquidation and margin right above the CTA | dYdX, Bybit, Crypto.com, Binance mobile | Take | The trader reads the cost before the click, not after. One glance, no scrolling past the button. | Audit #17. v2 change 5 |
| Labelled quick-size stops (25 / 50 / 75 / Max) | Drift, Paradex, OKX | Take | One tap to a common size instead of a drag. | Audit #20. v2 change 2 |
| Margin mode and leverage as two separate buttons | Hyperliquid, Paradex, Binance, Bybit, Drift | Take, then rolled back | Leverage changes many times a day and margin mode almost never. Two targets, one tap each. We kept Ondo's inline "Cross 20x" so the order type and account controls stay on one familiar row. | Audit #18 (open). `layout=stacked` stays in the library |
| Active unit visible inside the amount field (BTC \| USD) | Paradex, dYdX, Hyperliquid | Adapt: Toggle Group in the Input's trailing slot | An icon-only swap hides which unit you typed in. Showing the pair removes a class of 10× mistakes. | Audit #19. v2 change 3 |
| "Available · Max" right under the amount | Drift, Binance | Take | Answers "how much can I trade?" where the eye already is. | v2 change 4 |
| Liquidation price first in the details | Hyperliquid | Take | Risk before fees. The number that can end the position deserves the first line. | Audit #21. v2 change 6 |
| Reduce only and TP/SL on one compact row | Lighter, Paradex | Rejected after review | It saves a row, but two switches side by side read as one control and the label-to-switch link breaks. We kept Ondo's stacked toggle rows. | Audit #21 (toggle part open) |
| Side before order type | dYdX, Lighter, Drift | Reject | Ondo, Hyperliquid and Paradex put the order type first. Changing it breaks Ondo muscle memory for little gain. | none |
| Hero amount, keypad, Review step | Phantom, Crypto.com | Reject on desktop. Adapt on mobile: sticky decision bar, no Review step | A Review step adds a tap to every order. On mobile, a larger amount is worth it and the extra step is not. | v2 change 9 (mobile) |
| Inline error at the amount | Phantom | Already in v1 | The error is where the eye is, with the fix in numbers. | Audit #7 |

Grouped spacing (Setup, Size, Options, Review, Decision, Details) is v2 change 8. It follows from the takes above rather than from any one venue.

## Limits

- The captures are signed out. Signed-in states (positions, the real max size, the deposit flow) were not observed.
- This is one market (BTC) on one day. The venues ship often, so recheck before quoting any of them.
- No user testing. The verdicts are expert judgement against the brief's test, backed by how common each pattern is.

## Reproduce

```bash
cd research && npm install && node shoot.js competitors
```

The script loads each venue's trade URL at 1600 × 1000 @2x, waits 9 s, presses Escape and takes a screenshot. The panel crops in `competitors/crops/` were cut from those captures with PIL.
