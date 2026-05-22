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

function clientPointToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const sp = pt.matrixTransform(ctm.inverse());
  return { x: sp.x, y: sp.y };
}

export interface GraphCanvasHighlight {
  activeNodeId?: string | null;
  visitedNodeIds?: Set<string>;
  pathNodeIds?: Set<string>;
  edgeHighlights?: Set<string>; // keys from edgeKey()
  activeEdgeKey?: string | null;
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

  const [dragging, setDragging] = useState<
    | {
        nodeId: string;
        pointerId: number;
        offsetX: number;
        offsetY: number;
      }
    | null
  >(null);

  const rafRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<
    | {
        nodeId: string;
        x: number;
        y: number;
      }
    | null
  >(null);

  const visited = highlight.visitedNodeIds ?? new Set<string>();
  const pathNodes = highlight.pathNodeIds ?? new Set<string>();
  const edgeHL = highlight.edgeHighlights ?? new Set<string>();

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      className="h-full w-full"
      role="img"
      aria-label="Graph visualization"
      onPointerMove={(e) => {
        if (!dragging) return;
        if (e.pointerId !== dragging.pointerId) return;
        if (!svgRef.current) return;
        if (!onMoveNode) return;

        e.preventDefault();

        const p = clientPointToSvg(svgRef.current, e.clientX, e.clientY);
        const nextX = clamp(p.x - dragging.offsetX, 26, VIEWBOX.w - 26);
        const nextY = clamp(p.y - dragging.offsetY, 26, VIEWBOX.h - 26);

        pendingMoveRef.current = { nodeId: dragging.nodeId, x: nextX, y: nextY };
        if (rafRef.current != null) return;

        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null;
          const pending = pendingMoveRef.current;
          if (!pending) return;
          onMoveNode(pending.nodeId, { x: pending.x, y: pending.y });
        });
      }}
      onPointerUp={(e) => {
        if (!dragging) return;
        if (e.pointerId !== dragging.pointerId) return;

        const pending = pendingMoveRef.current;
        if (pending && onMoveNode) {
          onMoveNode(pending.nodeId, { x: pending.x, y: pending.y });
        }

        svgRef.current?.releasePointerCapture?.(dragging.pointerId);
        if (rafRef.current != null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        pendingMoveRef.current = null;
        setDragging(null);
      }}
      onPointerCancel={(e) => {
        if (!dragging) return;
        if (e.pointerId !== dragging.pointerId) return;

        svgRef.current?.releasePointerCapture?.(dragging.pointerId);
        if (rafRef.current != null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        pendingMoveRef.current = null;
        setDragging(null);
      }}
      onLostPointerCapture={() => {
        if (rafRef.current != null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        pendingMoveRef.current = null;
        setDragging(null);
      }}
      style={{ touchAction: "none" }}
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
            />

            {graph.weighted && typeof e.weight === "number" && Number.isFinite(e.weight) && (
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 - 8}
                textAnchor="middle"
                fontSize={12}
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fill: "var(--text-muted)",
                  userSelect: "none",
                }}
              >
                {e.weight}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {graph.nodes.map((n) => {
        const isActive = highlight.activeNodeId === n.id;
        const isPath = pathNodes.has(n.id);
        const isVisited = visited.has(n.id);

        const stroke = isActive
          ? "var(--accent)"
          : isPath
          ? "var(--accent)"
          : isVisited
          ? "var(--primary-light)"
          : "var(--text-muted)";

        const fill = isActive || isPath || isVisited ? "var(--bg-raised)" : "var(--bg-overlay)";

        return (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            onPointerDown={(e) => {
              if (!svgRef.current) return;
              if (!onMoveNode) return;

              e.preventDefault();
              e.stopPropagation();

              svgRef.current.setPointerCapture?.(e.pointerId);

              const p = clientPointToSvg(svgRef.current, e.clientX, e.clientY);
              setDragging({
                nodeId: n.id,
                pointerId: e.pointerId,
                offsetX: p.x - n.x,
                offsetY: p.y - n.y,
              });
            }}
            style={{
              cursor: !onMoveNode ? "default" : dragging?.nodeId === n.id ? "grabbing" : "grab",
            }}
          >
            <circle
              r={20}
              fill={fill}
              stroke={stroke}
              strokeWidth={isActive ? 4.2 : isPath ? 3.2 : isVisited ? 2.8 : 1.6}
            />
            <text
              y={4}
              textAnchor="middle"
              fontSize={12}
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fill: "var(--text-base)",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {n.id}
            </text>
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
        }}
      >
        Drag node untuk geser posisi
      </text>
    </svg>
  );
}
