"use client";

import { useEffect, useState } from "react";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";

type Theme = "classic" | "modern";

/**
 * Switches the Semantic · Theme mode (prototype controls and the token page). Modern is a cosmetic exploration
 * kept in the tokens, not a product theme switcher (the brief leaves that out). The attribute lives on <html>
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
    <SegmentedControl
      aria-label="Theme"
      options={[
        { value: "classic", label: "Classic" },
        { value: "modern", label: "Modern" },
      ]}
      value={theme}
      onValueChange={(v) => setTheme(v as Theme)}
    />
  );
}
