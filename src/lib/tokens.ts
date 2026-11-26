// Reads the generated DTCG file so pages can list tokens without copying names by hand.
import tokens from "../../tokens/dist/tokens.json";

export type TokenEntry = {
  /** Dot path, e.g. "color.bg.surface.default" */
  path: string;
  /** CSS custom property, e.g. "--color-bg-surface-default" */
  cssVar: string;
  type: string;
  description?: string;
};

type Node = { [key: string]: Node | unknown; $value?: unknown; $type?: string; $description?: string };

export function listTokens(prefix: string): TokenEntry[] {
  const root = prefix.split(".").reduce<Node | undefined>((n, k) => (n?.[k] as Node | undefined), tokens as unknown as Node);
  const out: TokenEntry[] = [];
  const walk = (node: Node, path: string[], type?: string) => {
    const t = node.$type ?? type;
    if ("$value" in node) {
      out.push({ path: path.join("."), cssVar: `--${path.join("-")}`, type: t ?? "", description: node.$description });
      return;
    }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith("$") && v && typeof v === "object") walk(v as Node, [...path, k], t);
  };
  if (root) walk(root, prefix.split("."));
  return out;
}
