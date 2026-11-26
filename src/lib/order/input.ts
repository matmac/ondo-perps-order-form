// What the amount and price fields accept while typing.

/**
 * Digits and one "." only. Commas are stripped (paste "1,250.5"), minus signs and exponents are dropped,
 * and decimals past `precision` are cut, not rounded. Returns the string to show in the field.
 */
export function sanitizeDecimal(raw: string, precision: number): string {
  let out = "";
  let dot = false;
  let decimals = 0;
  for (const ch of raw.replace(/,/g, "")) {
    if (ch === "." && !dot && precision > 0) {
      dot = true;
      out += out === "" ? "0." : ".";
    } else if (ch >= "0" && ch <= "9") {
      if (dot) {
        if (decimals >= precision) continue;
        decimals++;
      }
      out += ch;
    }
  }
  // "007" → "7", keep "0" and "0.x"
  return out.replace(/^0+(?=\d)/, "");
}

/** Field string → number, or null while empty or just "." typed. */
export function parseDecimal(value: string): number | null {
  if (value === "" || value === ".") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
