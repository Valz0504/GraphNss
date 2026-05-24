import type { Metadata } from "next";
import TspMapShell from "@/components/tsp-map/TspMapShell";

export const metadata: Metadata = { title: "TSP Map" };

export default function TspMapPage() {
  return <TspMapShell />;
}
