// Token pipeline. Source: DTCG 2025.10 files in this folder.
//   npm run tokens
// 1. Checks the tier rules (semantic -> primitives only, component -> semantic only) and that every mode of a
//    collection defines the same paths. One exception: other semantic tokens may alias the Theme collection (`base`).
// 2. Style Dictionary builds dist/tokens.css: default modes in :root, other modes in their media query or selector.
// 3. Writes dist/figma-variables.json: collections, modes, aliases, scopes and code syntax for Figma.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, 'dist');
mkdirSync(dist, { recursive: true });

// One entry per Figma collection. The first mode is the default (:root); each further mode names its CSS media query
// or selector. The theme selector sits on :root (<html data-theme="modern">): custom properties resolve where they are
// declared, so a theme set lower in the tree would not reach the component tokens declared on :root.
// Elevation has no Figma collection: shadows become an effect style.
const COLLECTIONS = [
  { name: 'Primitives', tier: 1, hidden: true, modes: [{ name: 'Value', file: '1-primitives.json' }] },
  { name: 'Semantic · Color', tier: 2, modes: [{ name: 'Dark', file: '2-semantic/color.dark.json' }] },
  { name: 'Semantic · Layout', tier: 2, modes: [
    { name: 'Desktop', file: '2-semantic/layout.desktop.json' },
    { name: 'Mobile', file: '2-semantic/layout.mobile.json', media: '(max-width: 767px)' },
  ] },
  { name: 'Semantic · Theme', tier: 2, base: true, modes: [
    { name: 'Classic', file: '2-semantic/theme.classic.json' },
    { name: 'Modern', file: '2-semantic/theme.modern.json', selector: ':root[data-theme="modern"]' },
  ] },
  { name: 'Semantic · Typography', tier: 2, modes: [{ name: 'Default', file: '2-semantic/type.json' }] },
  { name: 'Semantic · Motion', tier: 2, modes: [
    { name: 'Default', file: '2-semantic/motion.json' },
    { name: 'Reduced', file: '2-semantic/motion.reduced.json', media: '(prefers-reduced-motion: reduce)' },
  ] },
  { name: null, tier: 2, modes: [{ name: 'Default', file: '2-semantic/elevation.json' }] },
  { name: 'Component', tier: 3, hidden: true, modes: [{ name: 'Default', file: '3-component.json' }] },
];

const read = (f) => JSON.parse(readFileSync(join(here, f), 'utf8'));
// Flatten a DTCG tree into { path, type, value, description }, inheriting group $type.
function flatten(node, path = [], type) {
  const t = node.$type ?? type;
  if ('$value' in node) return [{ path, type: t, value: node.$value, description: node.$description }];
  return Object.entries(node).filter(([k]) => !k.startsWith('$')).flatMap(([k, v]) => flatten(v, [...path, k], t));
}
for (const c of COLLECTIONS) for (const m of c.modes) m.tokens = flatten(read(m.file));
const refsIn = (v) => [...JSON.stringify(v).matchAll(/\{([^{}"]+)\}/g)].map((m) => m[1]);
const pathsOfTier = (n) => new Set(COLLECTIONS.filter((c) => c.tier === n).flatMap((c) => c.modes[0].tokens.map((t) => t.path.join('.'))));

// ---- 1. Rules
const basePaths = new Set(COLLECTIONS.filter((c) => c.base).flatMap((c) => c.modes[0].tokens.map((t) => t.path.join('.'))));
const below = { 2: pathsOfTier(1), 3: pathsOfTier(2) };
const errors = [];
for (const c of COLLECTIONS) {
  if (c.tier === 1) continue;
  for (const m of c.modes) {
    for (const t of m.tokens) {
      const refs = refsIn(t.value);
      if (!refs.length) errors.push(`${m.file}: ${t.path.join('.')} holds a raw value; tier ${c.tier} must alias tier ${c.tier - 1}`);
      for (const r of refs) if (!below[c.tier].has(r) && !(c.tier === 2 && !c.base && basePaths.has(r))) errors.push(`${m.file}: ${t.path.join('.')} -> {${r}} is not a tier ${c.tier - 1} token`);
    }
  }
  const signature = (m) => m.tokens.map((t) => t.path.join('.')).sort().join();
  for (const m of c.modes.slice(1)) if (signature(m) !== signature(c.modes[0])) errors.push(`${m.file} must define the same paths as ${c.modes[0].file}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

// ---- 2. CSS via Style Dictionary
const cssName = (path) => '--' + path.join('-');
const sdConfig = (files, destination, filter) => ({
  source: files.map((f) => join(here, f)),
  log: { verbosity: 'silent' },
  platforms: { css: { transformGroup: 'css', buildPath: dist + '/', files: [{ destination, format: 'css/variables', filter, options: { outputReferences: true, selector: ':root' } }] } },
});
const defaults = COLLECTIONS.map((c) => c.modes[0].file);
await new StyleDictionary(sdConfig(defaults, 'tokens.css')).buildAllPlatforms();
let css = readFileSync(join(dist, 'tokens.css'), 'utf8');
for (const c of COLLECTIONS) {
  for (const m of c.modes.slice(1)) {
    const file = join(here, m.file);
    const out = `mode-${c.name.split(' · ')[1].toLowerCase()}-${m.name.toLowerCase()}.css`;
    await new StyleDictionary(sdConfig(defaults.map((f) => (f === c.modes[0].file ? m.file : f)), out, (t) => t.filePath === file)).buildAllPlatforms();
    const body = readFileSync(join(dist, out), 'utf8').replace(/^\/\*\*[\s\S]*?\*\/\n+/, '').trimEnd();
    css += m.media
      ? `\n/* ${c.name} · mode: ${m.name} */\n@media ${m.media} {\n${body.replace(/^/gm, '  ')}\n}\n`
      : `\n/* ${c.name} · mode: ${m.name} */\n${body.replace(/^:root \{/m, `${m.selector} {`)}\n`;
  }
}
// Typography: the build emits a `font` shorthand per type token, which cannot carry letter-spacing. Each part also
// gets its own property (--type-label-xs-font-size …), the same names Figma's split variables use as code syntax.
const TYPE_CSS_PARTS = [['fontFamily', 'font-family'], ['fontWeight', 'font-weight'], ['fontSize', 'font-size'], ['lineHeight', 'line-height'], ['letterSpacing', 'letter-spacing']];
const varOf = (ref) => `var(--${ref.replace(/[{}]/g, '').replace(/\./g, '-')})`;
for (const t of COLLECTIONS.find((c) => c.name === 'Semantic · Typography').modes[0].tokens) {
  const name = cssName(t.path);
  const parts = TYPE_CSS_PARTS.map(([prop, sub]) => `  ${name}-${sub}: ${varOf(t.value[prop])};`).join('\n');
  css = css.replace(new RegExp(`^(  ${name}: .*)$`, 'm'), `$1\n${parts}`);
}
writeFileSync(join(dist, 'tokens.css'), css);

// ---- 3. Figma variables payload
const collectionOf = new Map();
for (const c of COLLECTIONS) if (c.name) for (const t of c.modes[0].tokens) collectionOf.set(t.path.join('.'), c.name);
const scopesFor = (c, path, kind) => {
  const p = path.join('/');
  if (c.tier === 1) return [];
  if (kind === 'COLOR') {
    if (/\/fg(\/|$)/.test(p)) return ['TEXT_FILL', 'SHAPE_FILL'];
    if (/border|focus-ring\/color|underline/.test(p)) return ['STROKE_COLOR'];
    return ['FRAME_FILL', 'SHAPE_FILL'];
  }
  if (p.startsWith('type/')) return { 'font-size': ['FONT_SIZE'], 'letter-spacing': ['LETTER_SPACING'], 'font-family': ['FONT_FAMILY'], 'font-weight': ['FONT_WEIGHT'] }[path.at(-1)] ?? [];
  if (p.startsWith('opacity/') || p.endsWith('/opacity')) return ['OPACITY'];
  if (kind !== 'FLOAT' || p.startsWith('motion/') || /(^|\/)scale\//.test(p)) return [];
  if (/radius/.test(p)) return ['CORNER_RADIUS'];
  if (/border-width|focus-ring\/width|divider\/width/.test(p)) return ['STROKE_FLOAT'];
  if (/^space\/|padding|gap/.test(p)) return ['GAP'];
  return ['WIDTH_HEIGHT'];
};
const kindOf = { color: 'COLOR', dimension: 'FLOAT', duration: 'FLOAT', number: 'FLOAT', fontWeight: 'FLOAT', fontFamily: 'STRING', cubicBezier: 'STRING' };
const literal = (type, v, path) => {
  if (type === 'color') return { r: v.components[0], g: v.components[1], b: v.components[2], a: v.alpha ?? 1 };
  if (type === 'dimension' || type === 'duration') return v.value;
  if (type === 'number' && path && path[0] === 'opacity') return v * 100; // Figma opacity variables are 0–100
  if (type === 'fontFamily') return v[0];
  if (type === 'cubicBezier') return `cubic-bezier(${v.join(', ')})`;
  return v;
};
const aliasOrLiteral = (type, v, path) => {
  const m = typeof v === 'string' && v.match(/^\{(.+)\}$/);
  return m ? { alias: { collection: collectionOf.get(m[1]), name: m[1].replace(/\./g, '/') } } : { value: literal(type, v, path) };
};
const variables = new Map();
const put = (c, mode, path, kind, value, description, web) => {
  const name = path.join('/');
  const v = variables.get(c.name + name) ?? { collection: c.name, name, kind, description: description ?? '', values: {}, scopes: scopesFor(c, path, kind), web };
  v.values[mode] = value;
  variables.set(c.name + name, v);
};
const TYPE_PARTS = [['fontSize', 'font-size', 'FLOAT'], ['letterSpacing', 'letter-spacing', 'FLOAT'], ['fontFamily', 'font-family', 'STRING'], ['fontWeight', 'font-weight', 'FLOAT']];
for (const c of COLLECTIONS.filter((c) => c.name)) {
  for (const m of c.modes) {
    for (const t of m.tokens) {
      // Composites: semantic typography expands into bindable parts. Component typography and shadow references stay
      // in code; in Figma the component applies the matching text or effect style.
      if (t.type === 'typography') {
        if (c.tier === 2) for (const [prop, sub, kind] of TYPE_PARTS) put(c, m.name, [...t.path, sub], kind, aliasOrLiteral(null, t.value[prop]), t.description, `var(${cssName([...t.path, sub])})`);
        continue;
      }
      if (!kindOf[t.type]) continue;
      put(c, m.name, t.path, kindOf[t.type], aliasOrLiteral(t.type, t.value, t.path), t.description, `var(${cssName(t.path)})`);
    }
  }
}
const typeTokens = COLLECTIONS.find((c) => c.name === 'Semantic · Typography').modes[0].tokens;
const textStyles = typeTokens.map((t) => ({ name: t.path.slice(1).join('/'), variablePrefix: t.path.join('/'), lineHeightPercent: 132, tabular: t.path[1] === 'value', description: t.description ?? '' }));
const elevationTokens = COLLECTIONS.find((c) => !c.name).modes[0].tokens;
const dim = (ref) => Number(ref.match(/(\d+)\}$/)[1]);
const effectStyles = elevationTokens.map((t) => ({
  name: t.path.join('/'),
  color: t.value.color.replace(/[{}]/g, '').replace(/\./g, '/'),
  offsetX: dim(t.value.offsetX), offsetY: dim(t.value.offsetY), blur: dim(t.value.blur), spread: dim(t.value.spread),
  description: t.description ?? '',
}));
writeFileSync(join(dist, 'figma-variables.json'), JSON.stringify({
  collections: COLLECTIONS.filter((c) => c.name).map((c) => ({ name: c.name, modes: c.modes.map((m) => m.name), hidden: !!c.hidden })),
  variables: [...variables.values()], textStyles, effectStyles,
}));

// ---- 4. One DTCG JSON for code: every tier in its default mode, aliases kept. Other modes ride along on each token as
// $extensions["com.ondo.modes"] = { "<Collection>": { "<Mode>": value } }, so one file carries Mobile, Reduced and Modern.
const merged = {};
const place = (path, token) => { let o = merged; for (const k of path.slice(0, -1)) o = o[k] ??= {}; o[path.at(-1)] = token; };
for (const c of COLLECTIONS) {
  const others = c.modes.slice(1).map((m) => [m.name, new Map(m.tokens.map((t) => [t.path.join('.'), t.value]))]);
  for (const t of c.modes[0].tokens) {
    const token = { $type: t.type, $value: t.value, ...(t.description ? { $description: t.description } : {}) };
    const modes = Object.fromEntries(others.map(([name, values]) => [name, values.get(t.path.join('.'))]).filter(([, v]) => JSON.stringify(v) !== JSON.stringify(t.value)));
    if (Object.keys(modes).length) token.$extensions = { 'com.ondo.modes': { [c.name ?? 'Elevation']: modes } };
    place(t.path, token);
  }
}
writeFileSync(join(dist, 'tokens.json'), JSON.stringify({
  $description: 'Ondo Perps order form tokens · DTCG 2025.10 · generated by build.mjs from tokens/*.json. Default modes: Theme Classic, Layout Desktop, Motion Default. Other modes in $extensions["com.ondo.modes"].',
  ...merged,
}, null, 2) + '\n');

const n = (tier) => COLLECTIONS.filter((c) => c.tier === tier).reduce((s, c) => s + c.modes[0].tokens.length, 0);
console.log(`rules ok · primitives ${n(1)} · semantic ${n(2)} · component ${n(3)} · modes: Theme[Classic, Modern], Layout[Desktop, Mobile], Motion[Default, Reduced]`);
console.log(`dist/tokens.css · dist/tokens.json · dist/figma-variables.json (${variables.size} variables, ${textStyles.length} text styles, ${effectStyles.length} effect styles)`);
