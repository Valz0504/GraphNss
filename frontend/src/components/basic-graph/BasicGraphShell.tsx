"use client";

import { useCallback, useRef, useState } from "react";

import { checkBipartite, checkConnectivity, checkPath, detectCycle, findComponents, getDiameter, getGirth, getLargestComponent, simulateBfs, simulateDfs } from "@/lib/graphApi";
import ControlSidebar from "./ControlSidebar";
import ConsolePanel from "./ConsolePanel";
import GraphCanvas from "./GraphCanvas";
import { buildEdgeModels, computeInitialLayout, parseEdgeList } from "./graphParsing";
import type { AlgorithmId, ConsoleLine, GraphModel } from "./types";

const INITIAL_LINES: ConsoleLine[] = [
  { type: "info", text: "GraphNss" },
  {
    type: "muted",
    text: "Masukkan edge list dan pilih algoritma untuk memulai simulasi.",
  },
];

function edgeKey(from: string, to: string, directed: boolean) {
  return directed ? `${from}->${to}` : [from, to].sort().join("--");
}

/* ── Canvas area — graph renderer + placeholder ── */
function CanvasArea({
  graph,
  onMoveNode,
  onOpenControls,
  highlight,
}: {
  graph: GraphModel | null;
  onMoveNode: (id: string, pos: { x: number; y: number }) => void;
  onOpenControls?: () => void;
  highlight: {
    activeNodeId: string | null;
    visitedNodeIds: Set<string>;
    pathNodeIds: Set<string>;
    edgeHighlights: Set<string>;
    activeEdgeKey: string | null;
  };
}) {
  return (
    <div
      className="bg-dot-grid relative flex flex-1 items-center justify-center overflow-hidden"
    >
      {/* Radial ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(220,38,38,0.08) 0%, transparent 70%)",
        }}
      />

      {graph && graph.nodes.length > 0 ? (
        <div className="absolute inset-0">
          <GraphCanvas
            graph={graph}
            onMoveNode={onMoveNode}
            highlight={{
              activeNodeId: highlight.activeNodeId,
              visitedNodeIds: highlight.visitedNodeIds,
              pathNodeIds: highlight.pathNodeIds,
              edgeHighlights: highlight.edgeHighlights,
              activeEdgeKey: highlight.activeEdgeKey,
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 px-6 text-center animate-fade-in">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium" style={{ color: "var(--text-subtle)" }}>
              Graph Canvas Visualization
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Masukkan edge list, lalu klik{" "}
              <span style={{ color: "var(--primary-light)" }}>Tampilkan Graf</span>
            </p>
          </div>

          {/* Mobile/Tablet: open controls button */}
          {onOpenControls && (
            <button
              type="button"
              onClick={onOpenControls}
              className="lg:hidden flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(220,38,38,0.4)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
              Buka Panel Kontrol
            </button>
          )}

          <span
            className="rounded px-2 py-0.5 text-[10px] font-mono"
            style={{
              background: "var(--bg-raised)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            [Graph Canvas]
          </span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BasicGraphShell — manages responsive sidebar
───────────────────────────────────────────── */
export default function BasicGraphShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [graph, setGraph] = useState<GraphModel | null>(null);
  const [lines, setLines] = useState<ConsoleLine[]>(INITIAL_LINES);

  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeEdgeKey, setActiveEdgeKey] = useState<string | null>(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState<Set<string>>(new Set());
  const [pathNodeIds, setPathNodeIds] = useState<Set<string>>(new Set());
  const [edgeHighlights, setEdgeHighlights] = useState<Set<string>>(new Set());

  const [isBusy, setIsBusy] = useState(false);
  const timersRef = useRef<number[]>([]);
  const runTokenRef = useRef(0);

  const appendLine = useCallback((line: ConsoleLine) => {
    setLines((prev) => [...prev, line]);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const resetHighlights = useCallback(() => {
    clearTimers();
    setActiveNodeId(null);
    setActiveEdgeKey(null);
    setVisitedNodeIds(new Set());
    setPathNodeIds(new Set());
    setEdgeHighlights(new Set());
  }, [clearTimers]);

  const setGraphFromInput = useCallback(
    (payload: { graphInput: string; directed: boolean; weighted: boolean }) => {
      const parsed = parseEdgeList(payload.graphInput);
      if (parsed.errors.length > 0) {
        parsed.errors.forEach((msg) => appendLine({ type: "error", text: msg }));
        return { ok: false as const };
      }

      if (parsed.nodes.length === 0) {
        setGraph(null);
        appendLine({ type: "error", text: "Graf kosong — masukkan minimal 1 edge." });
        return { ok: false as const };
      }

      setGraph((prev) => {
        const nextNodes = computeInitialLayout(parsed.nodes, prev?.nodes);
        const nextEdges = buildEdgeModels(parsed.edges, payload.directed);
        return {
          directed: payload.directed,
          weighted: payload.weighted,
          nodes: nextNodes,
          edges: nextEdges,
        };
      });

      appendLine({
        type: "output",
        text: `Graf ditampilkan: ${parsed.nodes.length} node, ${parsed.edges.length} edge.`,
      });

      return { ok: true as const, edges: parsed.edges };
    },
    [appendLine]
  );

  const onMoveNode = useCallback((id: string, pos: { x: number; y: number }) => {
    setGraph((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...pos } : n)),
      };
    });
  }, []);

  const handleResetAll = useCallback(() => {
    runTokenRef.current += 1;
    clearTimers();
    setIsBusy(false);
    setGraph(null);
    setLines(INITIAL_LINES);
    setActiveNodeId(null);
    setActiveEdgeKey(null);
    setVisitedNodeIds(new Set());
    setPathNodeIds(new Set());
    setEdgeHighlights(new Set());
  }, [clearTimers]);

  const handleVisualise = useCallback(
    (payload: { graphInput: string; directed: boolean; weighted: boolean }) => {
      runTokenRef.current += 1;
      resetHighlights();
      setGraphFromInput(payload);
    },
    [resetHighlights, setGraphFromInput]
  );

  const animateNodeSequence = useCallback(
    (
      nodeSequence: string[],
      token: number,
      options: {
        labelPrefix: string;
        directed: boolean;
        parentByNode?: Map<string, string>;
      }
    ) => {
      const { labelPrefix, directed, parentByNode } = options;
      const stepMs = 520;

      nodeSequence.forEach((nodeId, idx) => {
        const t = window.setTimeout(() => {
          if (token !== runTokenRef.current) return;

          setActiveNodeId(nodeId);
          const parent = parentByNode?.get(nodeId);
          setActiveEdgeKey(parent ? edgeKey(parent, nodeId, directed) : null);
          setVisitedNodeIds((prev) => {
            const next = new Set(prev);
            next.add(nodeId);
            return next;
          });
          appendLine({ type: "output", text: `${labelPrefix} ${idx + 1}: visit ${nodeId}` });
        }, idx * stepMs);

        timersRef.current.push(t);
      });

      const doneTimer = window.setTimeout(() => {
        if (token !== runTokenRef.current) return;
        setActiveNodeId(null);
        setActiveEdgeKey(null);
        setIsBusy(false);
        appendLine({ type: "info", text: "Simulasi selesai." });
      }, nodeSequence.length * stepMs + 20);

      timersRef.current.push(doneTimer);
    },
    [appendLine]
  );

  const handleSimulate = useCallback(
    async (payload: {
      graphInput: string;
      directed: boolean;
      weighted: boolean;
      algorithm: AlgorithmId;
      startNode?: string;
      nodeA?: string;
      nodeB?: string;
    }) => {
      const token = (runTokenRef.current += 1);
      clearTimers();
      resetHighlights();
      setIsBusy(true);

      const graphRes = setGraphFromInput({
        graphInput: payload.graphInput,
        directed: payload.directed,
        weighted: payload.weighted,
      });

      if (!graphRes.ok) {
        setIsBusy(false);
        return;
      }

      const edges = graphRes.edges;

      try {
        if (payload.algorithm === "dfs" || payload.algorithm === "bfs") {
          const start = (payload.startNode ?? "").trim();
          if (!start) {
            appendLine({ type: "error", text: "Start Node wajib diisi." });
            setIsBusy(false);
            return;
          }

          appendLine({
            type: "info",
            text: `Menjalankan ${payload.algorithm.toUpperCase()} dari node ${start}...`,
          });

          const res = payload.algorithm === "dfs"
            ? await simulateDfs({ directed: payload.directed, edges, start })
            : await simulateBfs({ directed: payload.directed, edges, start });

          if (token !== runTokenRef.current) return;

          appendLine({
            type: "output",
            text: `Urutan: ${res.visited_order.join(" -> ")}`,
          });

          setPathNodeIds(new Set());
          setEdgeHighlights(
            new Set(res.tree_edges.map((e) => edgeKey(e.u, e.v, payload.directed)))
          );

          const parentByNode = new Map<string, string>();
          res.tree_edges.forEach((e) => parentByNode.set(e.v, e.u));

          animateNodeSequence(res.visited_order, token, {
            labelPrefix: res.algorithm.toUpperCase(),
            directed: payload.directed,
            parentByNode,
          });

          return; // busy ends via animation
        }

        if (payload.algorithm === "cek-lintasan") {
          const source = (payload.nodeA ?? "").trim();
          const target = (payload.nodeB ?? "").trim();
          if (!source || !target) {
            appendLine({ type: "error", text: "Node A dan Node B wajib diisi." });
            setIsBusy(false);
            return;
          }

          appendLine({
            type: "info",
            text: `Mengecek lintasan dari ${source} ke ${target}...`,
          });

          const res = await checkPath({
            directed: payload.directed,
            edges,
            source,
            target,
          });

          if (token !== runTokenRef.current) return;

          if (!res.exists || !res.path) {
            setEdgeHighlights(new Set());
            setVisitedNodeIds(new Set());
            setPathNodeIds(new Set());
            setActiveEdgeKey(null);
            appendLine({ type: "output", text: "Tidak ada lintasan." });
            setIsBusy(false);
            return;
          }

          const path = res.path;

          appendLine({ type: "output", text: `Lintasan: ${path.join(" -> ")}` });
          setPathNodeIds(new Set(path));
          setVisitedNodeIds(new Set());

          const pathEdgeKeys = new Set<string>();
          for (let i = 0; i < path.length - 1; i++) {
            pathEdgeKeys.add(edgeKey(path[i]!, path[i + 1]!, payload.directed));
          }
          setEdgeHighlights(pathEdgeKeys);

          // Animate along the found path
          const stepMs = 520;
          path.forEach((nodeId, idx) => {
            const t = window.setTimeout(() => {
              if (token !== runTokenRef.current) return;
              setActiveNodeId(nodeId);
              if (idx === 0) {
                setActiveEdgeKey(null);
              } else {
                const prev = path[idx - 1]!;
                setActiveEdgeKey(edgeKey(prev, nodeId, payload.directed));
              }
            }, idx * stepMs);
            timersRef.current.push(t);
          });

          const done = window.setTimeout(() => {
            if (token !== runTokenRef.current) return;
            setActiveNodeId(null);
            setActiveEdgeKey(null);
            setIsBusy(false);
          }, path.length * stepMs + 20);

          timersRef.current.push(done);
          return;
        }

        if (payload.algorithm === "cek-keterhubungan") {
          appendLine({ type: "info", text: "Mengecek keterhubungan graf..." });
          const res = await checkConnectivity({ directed: payload.directed, edges });
          if (token !== runTokenRef.current) return;

          const modeNote = res.mode === "weak" ? " (weak — abaikan arah edge)" : "";

          appendLine({
            type: "output",
            text: res.is_connected
              ? `Graf terhubung (connected)${modeNote}.`
              : `Graf tidak terhubung${modeNote}. Jumlah komponen: ${res.components.length}`,
          });
          setIsBusy(false);
          return;
        }

        if (payload.algorithm === "cari-komponen") {
          appendLine({ type: "info", text: "Mencari komponen terhubung..." });
          const res = await findComponents({ directed: payload.directed, edges });
          if (token !== runTokenRef.current) return;

          const modeNote = res.mode === "weak" ? " (weak — abaikan arah edge)" : "";

          appendLine({
            type: "output",
            text: `Komponen${modeNote}: ${res.components.length}`,
          });
          res.components.forEach((c, idx) => {
            appendLine({ type: "output", text: `  ${idx + 1}. { ${c.join(", ")} }` });
          });

          setIsBusy(false);
          return;
        }

        if (payload.algorithm === "komponen-terbesar") {
          appendLine({ type: "info", text: "Mencari komponen terbesar..." });
          const res = await getLargestComponent({ directed: payload.directed, edges });
          if (token !== runTokenRef.current) return;

          const modeNote = res.mode === "weak" ? " (weak)" : "";
          if (res.size === 0) {
            appendLine({ type: "output", text: "Graf kosong — tidak ada komponen." });
          } else {
            appendLine({
              type: "output",
              text: `Komponen terbesar${modeNote}: ${res.size} node dari ${res.total_components} komponen.`,
            });
            appendLine({ type: "output", text: `  Node: { ${res.largest_component.join(", ")} }` });
            // Highlight the largest component
            setPathNodeIds(new Set(res.largest_component));
            setVisitedNodeIds(new Set());
            setEdgeHighlights(new Set());
          }
          setIsBusy(false);
          return;
        }

        if (payload.algorithm === "cek-bipartite") {
          appendLine({ type: "info", text: "Mengecek apakah graf bipartite..." });
          const res = await checkBipartite({ directed: payload.directed, edges });
          if (token !== runTokenRef.current) return;

          if (res.is_bipartite) {
            appendLine({ type: "output", text: "Graf adalah BIPARTITE ✓" });
            appendLine({ type: "output", text: `  Grup A: { ${res.group_a.join(", ")} }` });
            appendLine({ type: "output", text: `  Grup B: { ${res.group_b.join(", ")} }` });
            // Highlight group_a as path (blue-ish), group_b as visited (red-ish)
            setPathNodeIds(new Set(res.group_a));
            setVisitedNodeIds(new Set(res.group_b));
            setEdgeHighlights(new Set());
          } else {
            appendLine({ type: "output", text: "Graf BUKAN bipartite ✗ (mengandung siklus ganjil)" });
            setPathNodeIds(new Set());
            setVisitedNodeIds(new Set());
            setEdgeHighlights(new Set());
          }
          setIsBusy(false);
          return;
        }

        if (payload.algorithm === "diameter") {
          appendLine({ type: "info", text: "Menghitung diameter graf..." });
          const res = await getDiameter({ directed: payload.directed, edges });
          if (token !== runTokenRef.current) return;

          if (!res.is_connected) {
            appendLine({
              type: "output",
              text: "Diameter = ∞ (graf tidak terhubung — ada node yang tidak bisa dicapai)",
            });
          } else if (res.diameter === null) {
            appendLine({ type: "output", text: "Graf kosong — diameter tidak terdefinisi." });
          } else {
            appendLine({ type: "output", text: `Diameter graf = ${res.diameter}` });
          }
          setIsBusy(false);
          return;
        }

        if (payload.algorithm === "deteksi-siklus") {
          appendLine({ type: "info", text: "Mendeteksi siklus dalam graf..." });
          const res = await detectCycle({ directed: payload.directed, edges });
          if (token !== runTokenRef.current) return;

          if (res.has_cycle) {
            appendLine({ type: "output", text: "Graf MENGANDUNG siklus ✓" });
            if (res.example_cycle.length > 0) {
              appendLine({
                type: "output",
                text: `  Contoh siklus: ${res.example_cycle.join(" → ")}`,
              });
              // Highlight cycle nodes
              const cycleNodes = new Set(res.example_cycle);
              setVisitedNodeIds(cycleNodes);
              // Highlight cycle edges
              const cycleEdgeKeys = new Set<string>();
              for (let i = 0; i < res.example_cycle.length - 1; i++) {
                const u = res.example_cycle[i]!;
                const v = res.example_cycle[i + 1]!;
                cycleEdgeKeys.add(edgeKey(u, v, payload.directed));
              }
              setEdgeHighlights(cycleEdgeKeys);
              setPathNodeIds(new Set());
            }
          } else {
            appendLine({ type: "output", text: "Graf TIDAK mengandung siklus ✗" });
            setVisitedNodeIds(new Set());
            setEdgeHighlights(new Set());
          }
          setIsBusy(false);
          return;
        }

        if (payload.algorithm === "girth") {
          appendLine({ type: "info", text: "Menghitung girth (siklus terkecil)..." });
          const res = await getGirth({ directed: payload.directed, edges });
          if (token !== runTokenRef.current) return;

          if (res.girth === null) {
            appendLine({ type: "output", text: "Girth = ∞ (tidak ada siklus dalam graf)" });
          } else {
            appendLine({ type: "output", text: `Girth = ${res.girth} (panjang siklus terkecil)` });
          }
          setIsBusy(false);
          return;
        }
      } catch (err) {
        if (token !== runTokenRef.current) return;
        appendLine({
          type: "error",
          text: err instanceof Error ? err.message : "Terjadi error saat memanggil backend.",
        });
        setIsBusy(false);
      }
    },
    [
      animateNodeSequence,
      appendLine,
      clearTimers,
      resetHighlights,
      setGraphFromInput,
    ]
  );

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* ── Main area: Canvas + Console ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CanvasArea
          graph={graph}
          onMoveNode={onMoveNode}
          onOpenControls={() => setDrawerOpen(true)}
          highlight={{
            activeNodeId,
            visitedNodeIds,
            pathNodeIds,
            edgeHighlights,
            activeEdgeKey,
          }}
        />
        <ConsolePanel lines={lines} />
      </main>

      {/* ── Desktop sidebar (lg+): always visible ── */}
      <div className="hidden lg:flex">
        <ControlSidebar
          isBusy={isBusy}
          onVisualise={handleVisualise}
          onSimulate={handleSimulate}
          onResetAll={handleResetAll}
        />
      </div>

      {/* ── Mobile / Tablet (< lg): drawer overlay ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ top: "var(--navbar-h)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Slide-in panel from right */}
          <aside
            className="lg:hidden fixed inset-y-0 right-0 z-50 overflow-y-auto"
            style={{
              top: "var(--navbar-h)",
              width: "min(320px, 90vw)",
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border)",
              animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          >
            <ControlSidebar
              onClose={() => setDrawerOpen(false)}
              isBusy={isBusy}
              onVisualise={handleVisualise}
              onSimulate={handleSimulate}
              onResetAll={handleResetAll}
            />
          </aside>
        </>
      )}

      {/* ── Mobile/Tablet: floating toggle button (when drawer is closed) ── */}
      {!drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            boxShadow: "0 4px 20px rgba(220,38,38,0.5)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <line x1="3"  y1="6"  x2="21" y2="6"  />
            <line x1="3"  y1="12" x2="21" y2="12" />
            <line x1="3"  y1="18" x2="15" y2="18" />
          </svg>
          Kontrol
        </button>
      )}
    </div>
  );
}
