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
for (const f of files) {
  const src = readFileSync(f, "utf8");
  // --_name is a private variable a component sets for itself (per variant), never a token.
  for (const m of src.matchAll(/var\((--(?!_)[\w-]+)/g)) if (!defined.has(m[1])) missing.push(`${f}: ${m[1]}`);
}
if (missing.length) {
  console.error(`Unknown tokens:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log(`tokens ok · ${files.length} files checked`);
