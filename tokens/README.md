# Ondo Perps order form · tokens

Source of truth for colour, layout, type, elevation and motion. Format: [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/format/). Built with Style Dictionary.

```
npm run tokens   # checks tier rules, writes dist/tokens.css and dist/figma-variables.json
```

## Tiers

| Tier | File | References | Figma collection | Published |
|---|---|---|---|---|
| 1 · Primitives | `1-primitives.json` | raw values only | `Primitives` [Value] | no |
| 2 · Semantic | `2-semantic/color.dark.json` | tier 1 only | `Semantic · Color` [Dark] | yes |
| | `2-semantic/layout.{desktop,mobile}.json` | tier 1 only | `Semantic · Layout` [Desktop, Mobile] | yes |
| | `2-semantic/theme.{classic,modern}.json` | tier 1 only | `Semantic · Theme` [Classic, Modern] | yes |
| | `2-semantic/type.json` | tier 1, and `font.family.numeric` from Theme | `Semantic · Typography` | yes |
| | `2-semantic/motion{,.reduced}.json` | tier 1 only | `Semantic · Motion` [Default, Reduced] | yes |
| | `2-semantic/elevation.json` | tier 1 only | effect style `elevation/handle` | yes |
| 3 · Component | `3-component.json` | tier 2 only | `Component` | no |

The build fails if a semantic token points anywhere but a primitive (the one exception: semantic tokens may point to the Theme collection), if a component token points anywhere but a semantic token or holds a raw value, or if two modes of one collection define different paths.

## Naming

- Semantic: `category / property / role / emphasis / state`, e.g. `color.bg.success.bold.hover`.
- Component: `component / part / property / variant / state`, e.g. `button.primary.bg.success.pressed` (tone is a variant).
- States always come from: `default, hover, pressed, focus, selected, disabled`.
- Colour roles are standard and reusable app-wide: neutral, inverse, success, danger, warning, info, discovery. Emphasis ladder: `bold`, `subtle`, `subtler`. Product meaning is mapped in components and guidelines only (Long = success, Short = danger); no token is named after a product concept.

## Modes

- Colour: one theme, `Dark`. The structure is ready for a `Light` mode; the brief excludes a theme switcher.
- Theme: `Classic` is the default in `:root`; `Modern` overrides it in `:root[data-theme="modern"]`. It holds only corner radius (`radius/*`) and the font for numbers (`font/family/numeric`). A theme never changes colour, spacing or layout. Set `data-theme` on `<html>`: custom properties resolve where they are declared, so a theme set lower in the tree would not reach component tokens declared on `:root`.
- Layout: `Desktop` is the default in `:root`; `Mobile` overrides it inside `@media (max-width: 767px)`.
- Motion: `Default` in `:root`; `Reduced` inside `@media (prefers-reduced-motion: reduce)`. Travel drops to 0ms, state fades stay at 100ms.
- One collection per domain and mode axis. Typography and motion are separate because their modes are independent.

## Figma notes

- Typography and shadow are composites. In Figma they become text styles (`label/*`, `value/*`) and an effect style (`elevation/handle`). Their size, tracking and colour are bound to variables. Line height (132%) sits on the style, because number variables cannot hold a ratio.
- Every variable has a scope and a WEB code syntax matching its CSS custom property.
- Typography: each composite emits the `font` shorthand plus one CSS property per part (`--type-label-xs-font-size` …). Figma stores the parts as variables (`type/label/xs/font-size`) whose code syntax is that part property, so Dev Mode shows the exact CSS.
- The CSS font family is `Gellix`. In Figma the `font/family/gellix` primitive holds the locally installed `Gellix-TRIAL`, so text styles can bind their family to variables and the Theme mode can swap the numeric font to `Geist Mono`.
- `value/*` styles are for numbers. Code renders them with `font-variant-numeric: tabular-nums`.

## Adding a token

1. Need a new raw value? Add it to tier 1.
2. Name the decision in tier 2, by intent. Never name it by appearance.
3. Only add a tier 3 token when a component part needs it.
4. Run `npm run tokens`, then re-import the Figma payload.
