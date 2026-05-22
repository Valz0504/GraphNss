import type { Metadata } from "next";
import BasicGraphShell from "@/components/basic-graph/BasicGraphShell";

export const metadata: Metadata = {
  title: "Basic Graph",
  description: "DFS, BFS, path checking, connectivity, and component finding on a custom graph.",
};

export default function BasicGraphPage() {
  return <BasicGraphShell />;
}
