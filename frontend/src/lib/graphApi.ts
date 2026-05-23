import type { GraphEdgeInput } from "@/components/basic-graph/types";

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

export interface TraversalResponse {
  algorithm: "dfs" | "bfs";
  directed: boolean;
  start: string;
  visited_order: string[];
  tree_edges: Array<{ u: string; v: string; w?: number | null }>;
}

export interface PathResponse {
  directed: boolean;
  source: string;
  target: string;
  exists: boolean;
  path: string[] | null;
}

export interface ConnectivityResponse {
  directed: boolean;
  mode: "undirected" | "weak";
  is_connected: boolean;
  components: string[][];
}

export interface ComponentsResponse {
  directed: boolean;
  mode: "undirected" | "weak";
  components: string[][];
}

export function simulateDfs(params: {
  directed: boolean;
  edges: GraphEdgeInput[];
  start: string;
}) {
  return postJson<TraversalResponse>("/api/v1/graph/dfs", params);
}

export function simulateBfs(params: {
  directed: boolean;
  edges: GraphEdgeInput[];
  start: string;
}) {
  return postJson<TraversalResponse>("/api/v1/graph/bfs", params);
}

export function checkPath(params: {
  directed: boolean;
  edges: GraphEdgeInput[];
  source: string;
  target: string;
}) {
  return postJson<PathResponse>("/api/v1/graph/path", params);
}

export function checkConnectivity(params: {
  directed: boolean;
  edges: GraphEdgeInput[];
}) {
  return postJson<ConnectivityResponse>("/api/v1/graph/connectivity", params);
}

export function findComponents(params: { directed: boolean; edges: GraphEdgeInput[] }) {
  return postJson<ComponentsResponse>("/api/v1/graph/components", params);
}

export interface LargestComponentResponse {
  directed: boolean;
  mode: "undirected" | "weak";
  largest_component: string[];
  size: number;
  total_components: number;
}

export interface BipartiteResponse {
  directed: boolean;
  is_bipartite: boolean;
  group_a: string[];
  group_b: string[];
}

export interface DiameterResponse {
  directed: boolean;
  diameter: number | null;
  is_connected: boolean;
}

export interface CycleResponse {
  directed: boolean;
  has_cycle: boolean;
  example_cycle: string[];
}

export interface GirthResponse {
  directed: boolean;
  girth: number | null;
}

export function getLargestComponent(params: { directed: boolean; edges: GraphEdgeInput[] }) {
  return postJson<LargestComponentResponse>("/api/v1/graph/largest-component", params);
}

export function checkBipartite(params: { directed: boolean; edges: GraphEdgeInput[] }) {
  return postJson<BipartiteResponse>("/api/v1/graph/bipartite", params);
}

export function getDiameter(params: { directed: boolean; edges: GraphEdgeInput[] }) {
  return postJson<DiameterResponse>("/api/v1/graph/diameter", params);
}

export function detectCycle(params: { directed: boolean; edges: GraphEdgeInput[] }) {
  return postJson<CycleResponse>("/api/v1/graph/cycle", params);
}

export function getGirth(params: { directed: boolean; edges: GraphEdgeInput[] }) {
  return postJson<GirthResponse>("/api/v1/graph/girth", params);
}

// ── Weighted / MST API functions ─────────────────────────────────────────────

export interface ShortestPathResponse {
  directed: boolean;
  source: string;
  target: string;
  exists: boolean;
  path: string[];
  cost: number | null;
}

export interface MSTResponse {
  mst_edges: Array<{ u: string; v: string; w: number | null }>;
  total_weight: number;
  node_count: number;
  is_spanning: boolean;
}

export function runDijkstra(params: {
  directed: boolean;
  edges: GraphEdgeInput[];
  source: string;
  target: string;
}) {
  return postJson<ShortestPathResponse>("/api/v1/graph/dijkstra", params);
}

export function runPrim(params: { directed: boolean; edges: GraphEdgeInput[] }) {
  return postJson<MSTResponse>("/api/v1/graph/prim", params);
}

export function runKruskal(params: { directed: boolean; edges: GraphEdgeInput[] }) {
  return postJson<MSTResponse>("/api/v1/graph/kruskal", params);
}
