import type { Metadata } from "next";
import AboutShell from "@/components/about/AboutShell";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <AboutShell />;
}
