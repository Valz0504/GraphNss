import type { Metadata } from "next";

import GridIslandShell from "@/components/grid-island/GridIslandShell";

export const metadata: Metadata = { title: "Grid Island" };

export default function GridIslandPage() {
  return <GridIslandShell />;
}

