import type { Metadata } from "next";
import { ThemeSwitch } from "@/components/dev/ThemeSwitch";
import { Showcase } from "./Showcase";
import s from "./components.module.css";

export const metadata: Metadata = { title: "Components · Ondo Perps order form" };

/** Every primitive in every variant and state, to check against the Figma component pages. */
export default function ComponentsPage() {
  return (
    <main className={s.page}>
      <header className={s.header}>
        <div>
          <h1 className="type-label-md">Primitives</h1>
          <p className={`type-label-xs ${s.meta}`}>Tab through the page to check focus. Resize under 768px for Mobile.</p>
        </div>
        <ThemeSwitch />
      </header>
      <Showcase />
    </main>
  );
}
