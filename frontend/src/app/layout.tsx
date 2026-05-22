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
        className="overflow-hidden"
        style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
      >
        {/* Fixed top navbar */}
        <Navbar />

        {/* Page content pushed below navbar */}
        <div
          className="overflow-hidden"
          style={{
            marginTop: "var(--navbar-h)",
            height: "calc(100vh - var(--navbar-h))",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
