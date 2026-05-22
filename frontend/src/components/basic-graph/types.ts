export type AlgorithmId =
  | "dfs"
  | "bfs"
  | "cek-lintasan"
  | "cek-keterhubungan"
  | "cari-komponen"
  | "komponen-terbesar"
  | "cek-bipartite"
  | "diameter"
  | "deteksi-siklus"
  | "girth";

export interface GraphEdgeInput {
  u: string;
  v: string;
  w?: number | null;
}

export interface GraphEdgeModel {
  id: string;
  from: string;
  to: string;
  weight?: number | null;
}

export interface GraphNodeModel {
  id: string;
  x: number;
  y: number;
}

export interface GraphModel {
  directed: boolean;
  weighted: boolean;
  nodes: GraphNodeModel[];
  edges: GraphEdgeModel[];
}

export interface ConsoleLine {
  type: "info" | "output" | "error" | "muted";
  text: string;
}
