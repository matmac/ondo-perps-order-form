// Fails when the app references a CSS custom property that the tokens do not define (a typo or a removed token).
//   npm run lint:tokens
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const defined = new Set([...readFileSync("src/styles/tokens.css", "utf8").matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
// Defined by the app, not the tokens (next/font variables and globals.css overrides).
for (const v of ["--font-inter", "--font-geist-mono"]) defined.add(v);

const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(f) && !p.endsWith("tokens.css")) files.push(p);
  }
};
walk("src");

const missing = [];
// Raw design values: lengths, times, colours and curves must come from a token. 0, %, flex factors and
// stacking order are geometry, not design values. A line may opt out with a "raw-ok: <reason>" comment.
const RAW = /(?<![\w.-])(?!0+(px|rem|em|ms|s|vh|vw)\b)\d*\.?\d+(px|rem|em|ms|s|vh|vw)\b|#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|cubic-bezier)\(/i;
const raw = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  // --_name is a private variable a component sets for itself (per variant), never a token.
  for (const m of src.matchAll(/var\((--(?!_)[\w-]+)/g)) if (!defined.has(m[1])) missing.push(`${f}: ${m[1]}`);
  if (f.endsWith(".css")) {
    src.split("\n").forEach((line, i) => {
      const code = line.replace(/\/\*.*?\*\//g, "");
      if (RAW.test(code) && !line.includes("raw-ok:") && !/^\s*@media/.test(line)) raw.push(`${f}:${i + 1}: ${line.trim()}`);
    });
  }
}
if (missing.length || raw.length) {
  if (missing.length) console.error(`Unknown tokens:\n${missing.join("\n")}`);
  if (raw.length) console.error(`Raw values (use a token):\n${raw.join("\n")}`);
  process.exit(1);
}
console.log(`tokens ok · ${files.length} files checked`);
