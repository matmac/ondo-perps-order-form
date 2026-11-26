"use client";

import { useEffect, useState } from "react";
import { ToggleGroup } from "../ToggleGroup/ToggleGroup";

type Theme = "classic" | "modern";

/**
 * Switches the Semantic · Theme mode on the token page only. Modern is a cosmetic exploration kept in the
 * tokens, not a product theme switcher (the brief leaves that out). The attribute lives on <html>
 * because the component tokens are declared on :root.
 */
export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("classic");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "modern") root.dataset.theme = "modern";
    else delete root.dataset.theme;
    return () => void delete root.dataset.theme;
  }, [theme]);

  return (
    <ToggleGroup
      aria-label="Theme exploration"
      items={[
        { value: "classic", label: "Classic" },
        { value: "modern", label: "Modern (exploration)" },
      ]}
      value={theme}
      onValueChange={(v) => setTheme(v as Theme)}
    />
  );
}
