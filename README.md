# Ondo Perps · Order form

The Ondo Perps order form rebuilt from a design system: tokens, components and every state.
Next.js (App Router) + React + TypeScript.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

| What | Where |
| --- | --- |
| Design tokens (source, DTCG 2025.10) | `tokens/` · build with `npm run tokens` |
| Tokens used by the app | `src/styles/tokens.css` (generated) |
| Guideline for extending the form | `GUIDELINES.md` |
| Competitive research | `docs/research/competitive.md` |

## Notes

- Words use Gellix in production. Gellix is licensed, so this build falls back to Inter. If Gellix is installed, it renders.
- The second layer (order type dropdown, leverage modal) stays as buttons that do nothing, as the brief asks.
