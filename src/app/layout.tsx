import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

// Words: Gellix in production. Gellix is a licensed font, so the public build falls back to Inter
// (see --font-family-gellix in globals.css); machines with Gellix installed still render it.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: "500" });

// Numbers use Geist Mono in the Modern theme only (Semantic · Theme). Classic uses the label font.
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: "500" });

export const metadata: Metadata = {
  title: "Ondo Perps · Order form",
  description: "Ondo Perps order form rebuilt from the design system: tokens, components and every state.",
};

// viewport-fit=cover lets the mobile decision bar pad itself above the home indicator (safe-area-inset-bottom).
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
