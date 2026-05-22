const DEFAULT_BASE_URL = "http://localhost:8000";

function getBaseUrl() {
  // In Next.js client components, NEXT_PUBLIC_* is inlined at build time.
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, "");
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { detail?: unknown };
      if (typeof data?.detail === "string") detail = data.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return (await res.json()) as T;
}

export type IslandAlgorithm = "bfs" | "dfs";

export interface IslandCountResponse {
  algorithm: IslandAlgorithm;
  rows: number;
  cols: number;
  islands: number;
}

export interface IslandTraversalStep {
  r: number;
  c: number;
  island: number;
}

export interface IslandTraversalResponse {
  algorithm: IslandAlgorithm;
  rows: number;
  cols: number;
  islands: number;
  steps: IslandTraversalStep[];
}

export function countIslands(params: { algorithm: IslandAlgorithm; grid: number[][] }) {
  return postJson<IslandCountResponse>("/api/v1/grid-island/islands/count", params);
}

export function simulateIslands(params: { algorithm: IslandAlgorithm; grid: number[][] }) {
  return postJson<IslandTraversalResponse>(
    "/api/v1/grid-island/islands/simulate",
    params
  );
}
