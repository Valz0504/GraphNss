import type { GraphEdgeInput, GraphEdgeModel, GraphNodeModel } from "./types";

export interface ParseEdgeListResult {
  edges: GraphEdgeInput[];
  nodes: string[];
  errors: string[];
}

function isCommentLine(line: string) {
  const t = line.trim();
  return t.startsWith("#") || t.startsWith("//");
}

export function parseEdgeList(input: string): ParseEdgeListResult {
  const edges: GraphEdgeInput[] = [];
  const nodes = new Set<string>();
  const errors: string[] = [];

  const lines = input.split(/\r?\n/);
  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const line = raw.trim();

    if (!line) return;
    if (isCommentLine(line)) return;

    const parts = line.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      errors.push(`Baris ${lineNo}: format harus 'u v [w]'`);
      return;
    }

    const u = parts[0]!;
    const v = parts[1]!;

    let w: number | null | undefined = undefined;
    if (parts.length >= 3) {
      const parsed = Number(parts[2]);
      if (Number.isFinite(parsed)) {
        w = parsed;
      } else {
        errors.push(`Baris ${lineNo}: weight '${parts[2]}' bukan angka`);
        return;
      }
    }

    edges.push({ u, v, w });
    nodes.add(u);
    nodes.add(v);
  });

  return { edges, nodes: Array.from(nodes), errors };
}

const VIEWBOX = { w: 1000, h: 600 };

export function computeInitialLayout(
  nodeIds: string[],
  prevNodes?: GraphNodeModel[],
  customLayout?: Record<string, { x: number; y: number }> | null
): GraphNodeModel[] {
  const prev = new Map<string, GraphNodeModel>();
  prevNodes?.forEach((n) => prev.set(n.id, n));

  const sorted = [...nodeIds].sort((a, b) => a.localeCompare(b));
  const n = sorted.length;

  const cx = VIEWBOX.w / 2;
  const cy = VIEWBOX.h / 2;
  const R = Math.max(140, Math.min(240, 60 + n * 14));

  return sorted.map((id, i) => {
    if (customLayout?.[id]) {
      return { id, x: customLayout[id]!.x, y: customLayout[id]!.y };
    }

    const existing = prev.get(id);
    if (existing) return existing;

    const angle = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2;
    return {
      id,
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
    };
  });
}

export function buildEdgeModels(edges: GraphEdgeInput[], directed: boolean): GraphEdgeModel[] {
  // Keep the input order stable; generate a unique-ish id per edge.
  return edges.map((e, idx) => ({
    id: directed ? `${e.u}->${e.v}#${idx}` : `${[e.u, e.v].sort().join("--")}#${idx}`,
    from: e.u,
    to: e.v,
    weight: e.w ?? null,
  }));
}
