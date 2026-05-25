import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GraphNss — Graph Theory Visualizer",
    template: "%s | GraphNss",
  },
  description:
    "Interactive graph theory algorithm visualizer. Explore DFS, BFS, Dijkstra, MST, and more with step-by-step animation.",
  keywords: ["graph theory", "algorithm visualizer", "DFS", "BFS", "Dijkstra"],
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="flex flex-col h-dvh overflow-hidden"
        style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
      >
        <Navbar />

        {/* Page content takes remaining height */}
        <main className="flex-1 min-h-0 relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
