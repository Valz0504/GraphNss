"use client";

import { useEffect, useRef, useState } from "react";

const MIN_HEIGHT    = 36;   // collapsed — just the header bar
const DEFAULT_HEIGHT = 220;
const MAX_HEIGHT    = 560;

interface ConsoleLine {
  type: "info" | "output" | "error" | "muted";
  text: string;
}

const INITIAL_LINES: ConsoleLine[] = [
  { type: "info",  text: "GraphNss v0.1.0 — siap." },
  { type: "muted", text: "Masukkan edge list dan pilih algoritma untuk memulai simulasi." },
];

/* ── macOS-style traffic light dots ── */
function TrafficLights({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onClose}
        title="Tutup konsol"
        className="group flex h-3 w-3 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        style={{ background: "#ff5f57" }}
      >
        <span className="text-[7px] font-bold leading-none opacity-0 group-hover:opacity-100" style={{ color: "#7a1f1f" }}>
          ✕
        </span>
      </button>
      <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
      <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
    </div>
  );
}

export default function ConsolePanel() {
  const [height, setHeight]   = useState(DEFAULT_HEIGHT);
  const [isOpen, setIsOpen]   = useState(true);
  const [lines]               = useState<ConsoleLine[]>(INITIAL_LINES);

  const prevHeight    = useRef(DEFAULT_HEIGHT);
  const isDragging    = useRef(false);
  const dragStartY    = useRef(0);
  const dragStartH    = useRef(0);

  /* ── Drag-to-resize logic ── */
  const onDragHandleMouseDown = (e: React.MouseEvent) => {
    if (!isOpen) return;
    isDragging.current  = true;
    dragStartY.current  = e.clientY;
    dragStartH.current  = height;
    e.preventDefault(); // prevent text selection
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      // dragging UP (clientY decreases) → console grows
      const delta  = dragStartY.current - e.clientY;
      const newH   = Math.max(80, Math.min(MAX_HEIGHT, dragStartH.current + delta));
      setHeight(newH);
    };
    const onMouseUp = () => { isDragging.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, []);

  /* ── Toggle open/closed ── */
  const close = () => {
    prevHeight.current = height;
    setIsOpen(false);
  };
  const open = () => {
    setIsOpen(true);
    setHeight(prevHeight.current);
  };

  /* ── Text colors per line type ── */
  const lineColor: Record<ConsoleLine["type"], string> = {
    info:   "#4ade80",
    output: "var(--text-base)",
    error:  "#f87171",
    muted:  "var(--text-muted)",
  };

  return (
    <div
      style={{
        height:      isOpen ? height : MIN_HEIGHT,
        background:  "#060504",
        borderTop:   "1px solid var(--border)",
        flexShrink:  0,
        display:     "flex",
        flexDirection: "column",
        overflow:    "hidden",
        transition:  isDragging.current ? "none" : "height 0.2s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* ── Drag handle + Header bar ── */}
      <div
        onMouseDown={onDragHandleMouseDown}
        style={{
          cursor:        isOpen ? "ns-resize" : "default",
          flexShrink:    0,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          height:        "36px",
          padding:       "0 14px",
          borderBottom:  isOpen ? "1px solid rgba(255,140,60,0.07)" : "none",
          userSelect:    "none",
          background:    "#080604",
        }}
      >
        {/* Left: traffic lights + title */}
        <div className="flex items-center gap-3">
          <TrafficLights onClose={close} />
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Output Console
          </span>
        </div>

        {/* Right: collapse / expand button */}
        {isOpen ? (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()} // don't trigger drag
            onClick={close}
            title="Perkecil konsol"
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-all hover:brightness-125"
            style={{
              color:      "var(--text-muted)",
              background: "var(--bg-raised)",
              border:     "1px solid var(--border)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M1 7h8M3 5l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tutup
          </button>
        ) : (
          <button
            type="button"
            onClick={open}
            title="Buka konsol"
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-all hover:brightness-125"
            style={{
              color:      "var(--primary-light)",
              background: "rgba(220,38,38,0.12)",
              border:     "1px solid rgba(220,38,38,0.25)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M1 3h8M3 5l2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Buka Konsol
          </button>
        )}
      </div>

      {/* ── Console body ── */}
      {isOpen && (
        <div
          className="flex-1 overflow-y-auto px-4 py-3"
          style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
        >
          {lines.map((line, i) => (
            <div key={i} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
              <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                {line.type === "info" ? "$" : ">>"}
              </span>
              <span style={{ color: lineColor[line.type] }}>{line.text}</span>
            </div>
          ))}
          {/* Blinking cursor */}
          <div className="mt-1 flex items-center gap-2 text-[12.5px]">
            <span style={{ color: "var(--text-muted)" }}>$</span>
            <span
              className="inline-block h-[14px] w-[7px] animate-pulse-soft"
              style={{ background: "var(--primary)", borderRadius: "1px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
