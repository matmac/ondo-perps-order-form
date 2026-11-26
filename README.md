# Ondo Perps · Order form

The Ondo Perps order form rebuilt from a design system: tokens, components and every state.
Next.js (App Router) + React + TypeScript.

## Run

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/matmac/ondo-perps-order-form?quickstart=1)

Live preview: https://ondo-perps-order-form.vercel.app

In a codespace the app installs and starts on its own, and the preview opens beside the code. Locally:

```bash
npm install
npm run dev
npm test     # order logic: the brief's fixtures, formulas, formatting
```

Open http://localhost:3000.

## Branches and deploys

- `main` holds reviewed work. Vercel deploys it to production.
- Each build step gets its own branch (`step/NN-name`) and a pull request into `main`. Vercel builds a preview URL for every pull request, so each step is reviewed live before it merges.
- Before a pull request: `npm run lint && npx tsc --noEmit && npm run build`.

## Where things live

| What | Where |
| --- | --- |
| Design tokens (source, DTCG 2025.10) | `tokens/` · build with `npm run tokens` |
| Tokens used by the app | `src/styles/tokens.css` (generated) |
| Components | `src/components/` · showcase at `/components` |
| Order logic | `src/lib/order/` |
| Guideline for extending the form | `GUIDELINES.md` |
| Competitive research | `docs/research/competitive.md` |

## Notes

- Words use Gellix in production. Gellix is licensed, so this build falls back to Inter. If Gellix is installed, it renders.
- The second layer (order type dropdown, leverage modal) stays as buttons that do nothing, as the brief asks.
