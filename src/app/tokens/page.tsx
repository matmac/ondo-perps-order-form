import type { Metadata } from "next";
import { listTokens } from "@/lib/tokens";
import { ThemeSwitch } from "@/components/dev/ThemeSwitch";
import s from "./tokens.module.css";

export const metadata: Metadata = { title: "Tokens · Ondo Perps order form" };

const TYPE_STYLES = ["label-xs", "label-sm", "label-md", "value-xs", "value-sm", "value-md", "value-lg"] as const;

/** Token check page: everything here reads the generated tokens, so it proves the pipeline end to end. */
export default function TokensPage() {
  const colors = [...listTokens("color.bg"), ...listTokens("color.fg"), ...listTokens("color.border")];
  const space = listTokens("space");
  const radius = listTokens("radius");
  const durations = listTokens("motion.duration");
  const easings = listTokens("motion.easing");

  return (
    <main className={s.page}>
      <header className={s.header}>
        <div>
          <h1 className="type-label-md">Tokens</h1>
          <p className={`type-label-xs ${s.meta}`}>Semantic tier, read from tokens/dist/tokens.json. Resize under 768px for Mobile.</p>
        </div>
        <ThemeSwitch />
      </header>

      <section className={s.section}>
        <h2 className={`type-label-sm ${s.sectionTitle}`}>Colour · Dark</h2>
        <div className={s.grid}>
          {colors.map((t) => (
            <div key={t.path} className={s.row} title={t.description}>
              <span className={s.swatch}>
                <span className={s.swatchFill} style={{ background: `var(${t.cssVar})` }} />
              </span>
              <span className={`type-label-xs ${s.name}`}>{t.path.replace("color.", "")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={`type-label-sm ${s.sectionTitle}`}>Typography</h2>
        {TYPE_STYLES.map((name) => (
          <div key={name} className={s.typeRow}>
            <span className={`type-label-xs ${s.typeName}`}>{name.replace("-", "/")}</span>
            <span className={`type-${name}`}>{name.startsWith("value") ? "$68,420.5 · 0.0500 BTC" : "Est. liquidation price"}</span>
          </div>
        ))}
      </section>

      <section className={s.section}>
        <h2 className={`type-label-sm ${s.sectionTitle}`}>Space</h2>
        <div className={s.grid}>
          {space.map((t) => (
            <div key={t.path} className={s.row}>
              <span className={s.bar} style={{ width: `var(${t.cssVar})` }} />
              <span className={`type-label-xs ${s.name}`}>{t.path.replace("space.", "")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={`type-label-sm ${s.sectionTitle}`}>Radius · Theme</h2>
        <div className={s.grid}>
          {radius.map((t) => (
            <div key={t.path} className={s.row}>
              <span className={s.radiusBox} style={{ borderRadius: `var(${t.cssVar})` }} />
              <span className={`type-label-xs ${s.name}`}>{t.path.replace("radius.", "")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={`type-label-sm ${s.sectionTitle}`}>Motion · hover a track (Reduced mode drops travel to 0 ms)</h2>
        <div className={s.grid}>
          {durations.flatMap((d) =>
            easings.slice(0, 1).map((e) => (
              <div key={d.path} className={s.row}>
                <div className={s.track}>
                  <div className={s.mover} style={{ transitionDuration: `var(${d.cssVar})`, transitionTimingFunction: `var(${e.cssVar})` }} />
                </div>
                <span className={`type-label-xs ${s.name}`}>{d.path.replace("motion.duration.", "")}</span>
              </div>
            )),
          )}
        </div>
      </section>
    </main>
  );
}
