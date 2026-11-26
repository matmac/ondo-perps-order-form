import Link from "next/link";

// Placeholder until the order form lands in step 6.
export default function Home() {
  return (
    <main style={{ padding: "var(--space-stack-lg)", display: "grid", gap: "var(--space-stack-sm)" }}>
      <p className="type-label-md" style={{ color: "var(--color-fg-secondary)" }}>Ondo Perps · Order form</p>
      <p className="type-value-lg">$68,420.5</p>
      <Link href="/tokens" className="type-label-sm" style={{ color: "var(--color-fg-info)" }}>Token check →</Link>
    </main>
  );
}
