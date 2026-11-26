"use client";

import { useEffect, useState } from "react";

type Theme = "classic" | "modern";

/**
 * Switches the Semantic · Theme mode. The attribute lives on <html> because the component tokens are
 * declared on :root and custom properties resolve where they are declared.
 */
export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("classic");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "modern") root.dataset.theme = "modern";
    else delete root.dataset.theme;
  }, [theme]);

  return (
    <div role="radiogroup" aria-label="Theme" style={{ display: "inline-flex", gap: "var(--space-inline-xs)" }}>
      {(["classic", "modern"] as const).map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={theme === t}
          onClick={() => setTheme(t)}
          className="type-label-xs"
          style={{
            padding: "var(--space-inline-xs) var(--space-inset-sm)",
            borderRadius: "var(--radius-control)",
            background: theme === t ? "var(--color-bg-neutral-selected)" : "var(--color-bg-neutral-default)",
            color: theme === t ? "var(--color-fg-primary)" : "var(--color-fg-secondary)",
            textTransform: "capitalize",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
