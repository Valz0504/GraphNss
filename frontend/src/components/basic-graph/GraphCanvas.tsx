"use client";

import { useMemo, useRef, useState } from "react";

import type { GraphModel, GraphNodeModel } from "./types";

const VIEWBOX = { w: 1000, h: 600 };

function edgeKey(from: string, to: string, directed: boolean) {
  return directed ? `${from}->${to}` : [from, to].sort().join("--");
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function clientPointToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  transform: Transform
) {
  const rect = svg.getBoundingClientRect();
  const rawX = (clientX - rect.left) / rect.width;
  const rawY = (clientY - rect.top) / rect.height;

  // Convert from screen fraction → viewbox coords, then undo pan/zoom
  const svgX = rawX * VIEWBOX.w;
  const svgY = rawY * VIEWBOX.h;

  // Undo pan + zoom: world = (svgCoord - pan) / scale
  const worldX = (svgX - transform.panX) / transform.scale;
  const worldY = (svgY - transform.panY) / transform.scale;
  return { x: worldX, y: worldY };
}

interface Transform {
  scale: number;
  panX: number;
  panY: number;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 4.0;

export interface GraphCanvasHighlight {
  activeNodeId?: string | null;
  visitedNodeIds?: Set<string>;
  pathNodeIds?: Set<string>;
  edgeHighlights?: Set<string>; // keys from edgeKey()
  activeEdgeKey?: string | null;
  nodeLabels?: Record<string, string>; // for temporarily overriding node display labels
}

export default function GraphCanvas(props: {
  graph: GraphModel;
  highlight?: GraphCanvasHighlight;
  onMoveNode?: (id: string, pos: Pick<GraphNodeModel, "x" | "y">) => void;
}) {
  const { graph, onMoveNode } = props;
  const highlight = props.highlight ?? {};

  const svgRef = useRef<SVGSVGElement | null>(null);

  const nodeById = useMemo(() => {
    const m = new Map<string, GraphNodeModel>();
    graph.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [graph.nodes]);

  // ── Transform state (zoom + pan) ──────────────────────────────────────────
  const [transform, setTransform] = useState<Transform>({ scale: 1, panX: 0, panY: 0 });

  // ── Drag state: either panning the canvas or dragging a node ─────────────
  const [nodeDrag, setNodeDrag] = useState<{
    nodeId: string;
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [panDrag, setPanDrag] = useState<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const rafRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{ nodeId: string; x: number; y: number } | null>(null);

  const visited = highlight.visitedNodeIds ?? new Set<string>();
  const pathNodes = highlight.pathNodeIds ?? new Set<string>();
  const edgeHL = highlight.edgeHighlights ?? new Set<string>();

  // ── Zoom via mouse wheel ──────────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    // cursor in SVG-viewbox coords (before current transform)
    const cursorSvgX = ((e.clientX - rect.left) / rect.width) * VIEWBOX.w;
    const cursorSvgY = ((e.clientY - rect.top) / rect.height) * VIEWBOX.h;

    const delta = e.deltaY < 0 ? 1.12 : 1 / 1.12;

    setTransform((prev) => {
      const nextScale = clamp(prev.scale * delta, MIN_SCALE, MAX_SCALE);
      const ratio = nextScale / prev.scale;

      // Keep the cursor world-point fixed:
      // newPan = cursor - (cursor - oldPan) * ratio
      const nextPanX = cursorSvgX - (cursorSvgX - prev.panX) * ratio;
      const nextPanY = cursorSvgY - (cursorSvgY - prev.panY) * ratio;

      return { scale: nextScale, panX: nextPanX, panY: nextPanY };
    });
  };

  // ── Pointer events on the SVG background (pan) ───────────────────────────
  const handleBgPointerDown = (e: React.PointerEvent<SVGRectElement>) => {
    if (nodeDrag) return; // node drag takes priority
    e.currentTarget.setPointerCapture(e.pointerId);
    setPanDrag({
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPanX: transform.panX,
      startPanY: transform.panY,
    });
  };

  // ── Pointer move — handle both node drag and pan ──────────────────────────
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // Node drag
    if (nodeDrag && e.pointerId === nodeDrag.pointerId) {
      if (!svgRef.current || !onMoveNode) return;
      e.preventDefault();
      const p = clientPointToSvg(svgRef.current, e.clientX, e.clientY, transform);
      const nextX = clamp(p.x - nodeDrag.offsetX, 26, VIEWBOX.w - 26);
      const nextY = clamp(p.y - nodeDrag.offsetY, 26, VIEWBOX.h - 26);
      pendingMoveRef.current = { nodeId: nodeDrag.nodeId, x: nextX, y: nextY };
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const pending = pendingMoveRef.current;
        if (!pending) return;
        onMoveNode(pending.nodeId, { x: pending.x, y: pending.y });
      });
      return;
    }

    // Canvas pan
    if (panDrag && e.pointerId === panDrag.pointerId) {
      const dx = e.clientX - panDrag.startClientX;
      const dy = e.clientY - panDrag.startClientY;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      // Convert screen-pixel delta to SVG-viewbox delta
      const svgDx = (dx / rect.width) * VIEWBOX.w;
      const svgDy = (dy / rect.height) * VIEWBOX.h;
      setTransform((prev) => ({
        ...prev,
        panX: panDrag.startPanX + svgDx,
        panY: panDrag.startPanY + svgDy,
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (nodeDrag && e.pointerId === nodeDrag.pointerId) {
      const pending = pendingMoveRef.current;
      if (pending && onMoveNode) {
        onMoveNode(pending.nodeId, { x: pending.x, y: pending.y });
      }
      svgRef.current?.releasePointerCapture?.(nodeDrag.pointerId);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingMoveRef.current = null;
      setNodeDrag(null);
      return;
    }

    if (panDrag && e.pointerId === panDrag.pointerId) {
      setPanDrag(null);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<SVGSVGElement>) => {
    if (nodeDrag && e.pointerId === nodeDrag.pointerId) {
      svgRef.current?.releasePointerCapture?.(nodeDrag.pointerId);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingMoveRef.current = null;
      setNodeDrag(null);
    }
    if (panDrag && e.pointerId === panDrag.pointerId) {
      setPanDrag(null);
    }
  };

  // ── Zoom buttons ──────────────────────────────────────────────────────────
  const zoomBy = (delta: number) => {
    setTransform((prev) => {
      const nextScale = clamp(prev.scale * delta, MIN_SCALE, MAX_SCALE);
      const ratio = nextScale / prev.scale;
      // Zoom toward center of viewbox
      const cx = VIEWBOX.w / 2;
      const cy = VIEWBOX.h / 2;
      return {
        scale: nextScale,
        panX: cx - (cx - prev.panX) * ratio,
        panY: cy - (cy - prev.panY) * ratio,
      };
    });
  };

  const resetTransform = () => setTransform({ scale: 1, panX: 0, panY: 0 });

  // ── Determine if any edge actually has a numeric weight ───────────────────
  const hasWeights = graph.edges.some(
    (e) => typeof e.weight === "number" && Number.isFinite(e.weight)
  );

  return (
    <div className="relative h-full w-full">
      {/* ── Zoom controls ── */}
      <div
        className="absolute right-4 top-4 z-10 flex flex-col gap-1"
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          id="btn-zoom-in"
          title="Zoom In"
          onClick={() => zoomBy(1.25)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all hover:brightness-125 active:scale-95"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-subtle)",
          }}
        >
          +
        </button>
        <button
          type="button"
          id="btn-zoom-out"
          title="Zoom Out"
          onClick={() => zoomBy(1 / 1.25)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all hover:brightness-125 active:scale-95"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-subtle)",
          }}
        >
          −
        </button>
        <button
          type="button"
          id="btn-zoom-reset"
          title="Reset zoom"
          onClick={resetTransform}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-semibold transition-all hover:brightness-125 active:scale-95"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          ⌂
        </button>
      </div>

      {/* Zoom level badge */}
      {transform.scale !== 1 && (
        <div
          className="pointer-events-none absolute left-4 top-4 z-10 rounded px-2 py-0.5 text-[10px] font-mono"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {Math.round(transform.scale * 100)}%
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
        className="h-full w-full"
        role="img"
        aria-label="Graph visualization"
        onWheel={handleWheel}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={() => {
          if (rafRef.current != null) {
            window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          pendingMoveRef.current = null;
          setNodeDrag(null);
          setPanDrag(null);
        }}
        style={{
          touchAction: "none",
          cursor: nodeDrag ? "grabbing" : panDrag ? "grabbing" : "default",
        }}
      >
        <defs>
          <marker
            id="arrow-muted"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
          </marker>

          <marker
            id="arrow-primary"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary-light)" />
          </marker>

          <marker
            id="arrow-accent"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* ── Invisible background rect to capture pan events ── */}
        <rect
          x={0}
          y={0}
          width={VIEWBOX.w}
          height={VIEWBOX.h}
          fill="transparent"
          style={{ cursor: panDrag ? "grabbing" : "grab" }}
          onPointerDown={handleBgPointerDown}
        />

        {/* ── All graph content inside a transform group ── */}
        <g transform={`translate(${transform.panX},${transform.panY}) scale(${transform.scale})`}>
          {/* Edges */}
          {graph.edges.map((e) => {
            const a = nodeById.get(e.from);
            const b = nodeById.get(e.to);
            if (!a || !b) return null;

            const baseKey = edgeKey(e.from, e.to, graph.directed);
            const isActive = highlight.activeEdgeKey ? highlight.activeEdgeKey === baseKey : false;
            const isHL = edgeHL.has(baseKey);

            const stroke = isActive
              ? "var(--accent)"
              : isHL
              ? "var(--primary-light)"
              : "var(--text-muted)";

            const markerEnd = !graph.directed
              ? undefined
              : isActive
              ? "url(#arrow-accent)"
              : isHL
              ? "url(#arrow-primary)"
              : "url(#arrow-muted)";

            const hasWeight = typeof e.weight === "number" && Number.isFinite(e.weight);

            // Mid-point for weight label
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;

            // Perpendicular offset to avoid overlapping edge line
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const perpX = (-dy / len) * 12;
            const perpY = (dx / len) * 12;

            return (
              <g key={e.id}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={stroke}
                  strokeWidth={isActive ? 3.4 : isHL ? 2.6 : 1.2}
                  markerEnd={markerEnd}
                  opacity={isActive || isHL ? 1 : 0.85}
                  strokeLinecap="round"
                  style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />

                {/* Weight label — show whenever the edge has a numeric weight */}
                {hasWeight && (
                  <g>
                    {/* Backdrop pill for readability */}
                    <rect
                      x={mx + perpX - 14}
                      y={my + perpY - 9}
                      width={28}
                      height={16}
                      rx={4}
                      fill="var(--bg-surface)"
                      opacity={0.85}
                    />
                    <text
                      x={mx + perpX}
                      y={my + perpY + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={isHL || isActive ? "700" : "500"}
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fill: isActive
                          ? "var(--accent)"
                          : isHL
                          ? "var(--primary-light)"
                          : "var(--text-subtle)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      {e.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((n) => {
            const isActive = highlight.activeNodeId === n.id;
            const isPath = pathNodes.has(n.id);
            const isVisited = visited.has(n.id);
            const overrideLabel = highlight.nodeLabels?.[n.id];
            const hasOverride = overrideLabel !== undefined && overrideLabel !== n.id;
            const displayLabel = overrideLabel ?? n.id;

            const stroke = isActive
              ? "#fbbf24"   // amber for bandwidth rename active node
              : hasOverride
              ? "rgba(251,191,36,0.6)"
              : isPath
              ? "var(--accent)"
              : isVisited
              ? "var(--primary-light)"
              : "var(--text-muted)";

            const fill = isActive
              ? "var(--bg-raised)"
              : hasOverride
              ? "rgba(251,191,36,0.08)"
              : isPath || isVisited
              ? "var(--bg-raised)"
              : "var(--bg-overlay)";

            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                onPointerDown={(e) => {
                  if (!svgRef.current) return;
                  if (!onMoveNode) return;

                  e.preventDefault();
                  e.stopPropagation(); // don't trigger pan

                  svgRef.current.setPointerCapture?.(e.pointerId);

                  const p = clientPointToSvg(svgRef.current, e.clientX, e.clientY, transform);
                  setNodeDrag({
                    nodeId: n.id,
                    pointerId: e.pointerId,
                    offsetX: p.x - n.x,
                    offsetY: p.y - n.y,
                  });
                }}
                style={{
                  cursor: !onMoveNode ? "default" : nodeDrag?.nodeId === n.id ? "grabbing" : "grab",
                  transition: nodeDrag?.nodeId === n.id ? "none" : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), fill 0.2s, stroke 0.2s",
                }}
              >
                {/* Pulsing outer ring for the currently active rename node */}
                {isActive && (
                  <circle
                    r={28}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                    opacity={0.5}
                    style={{ animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite" }}
                  />
                )}

                <circle
                  r={20}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isActive ? 3.5 : hasOverride ? 2.4 : isPath ? 3.2 : isVisited ? 2.8 : 1.6}
                  style={{ transition: "stroke 0.3s, fill 0.3s, stroke-width 0.3s" }}
                />

                {/* Main label (new name if overriding, else node id) */}
                <text
                  y={4}
                  textAnchor="middle"
                  fontSize={hasOverride ? 13 : 12}
                  fontWeight={hasOverride ? "700" : "400"}
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fill: isActive
                      ? "#fbbf24"
                      : hasOverride
                      ? "#fbbf24"
                      : "var(--text-base)",
                    userSelect: "none",
                    pointerEvents: "none",
                    transition: "fill 0.3s",
                  }}
                >
                  {displayLabel}
                </text>

                {/* "was: X" badge above node when label is being overridden */}
                {hasOverride && (
                  <g>
                    <rect
                      x={-14}
                      y={-38}
                      width={28}
                      height={14}
                      rx={3}
                      fill="rgba(251,191,36,0.15)"
                      stroke="rgba(251,191,36,0.4)"
                      strokeWidth={0.8}
                    />
                    <text
                      y={-28}
                      textAnchor="middle"
                      fontSize={8}
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fill: "rgba(251,191,36,0.9)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      was: {n.id}
                    </text>
                  </g>
                )}
              </g>
            );
          })}


          {/* Hint */}
          <text
            x={16}
            y={24}
            fontSize={11}
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fill: "var(--text-muted)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            {hasWeights
              ? "Scroll untuk zoom · Drag canvas untuk geser · Drag node untuk pindah"
              : "Scroll untuk zoom · Drag canvas untuk geser · Drag node untuk pindah"}
          </text>
        </g>
      </svg>
    </div>
  );
}
