"use client";

import { useRef, useState } from "react";

import AlgorithmPickerModal, { ALL_ALGORITHMS } from "./AlgorithmPickerModal";
import GraphGeneratorModal from "./GraphGeneratorModal";
import type { AlgorithmId } from "./types";
import type { GeneratedGraph } from "@/lib/graphGenerators";

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-subtle)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "var(--border)", flexShrink: 0 }} />;
}

interface LabeledInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}
function LabeledInput({ label, id, value, onChange, placeholder, hint }: LabeledInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[12px] font-medium"
        style={{ color: "var(--text-base)" }}
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md px-3 py-2 text-sm"
        style={{ fontFamily: "var(--font-mono, monospace)" }}
      />
      {hint && (
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Toggle Chip
───────────────────────────────────────────── */
function ToggleChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
      style={{
        background: active ? "rgba(220,38,38,0.1)" : "var(--bg-raised)",
        color: active ? "var(--primary)" : "var(--text-base)",
        border: `1px solid ${active ? "rgba(220,38,38,0.45)" : "var(--border-strong)"}`,
        boxShadow: active ? "0 1px 4px rgba(220,38,38,0.12)" : "none",
      }}
    >
      <span
        className="h-2 w-2 rounded-full transition-colors"
        style={{ background: active ? "var(--primary)" : "#d1d5db" }}
      />
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Main Sidebar
───────────────────────────────────────────── */
interface ControlSidebarProps {
  onClose?: () => void;
  isBusy?: boolean;
  // Graph input state — lifted to BasicGraphShell for auto-render
  graphInput: string;
  onGraphInputChange: (v: string) => void;
  isDirected: boolean;
  onDirectedChange: (v: boolean) => void;
  isWeighted: boolean;
  onWeightedChange: (v: boolean) => void;
  onSimulate: (payload: {
    algorithm: AlgorithmId;
    startNode?: string;
    nodeA?: string;
    nodeB?: string;
  }) => void;
  onResetAll?: () => void;
  onGenerateDefaultGraph?: (graph: GeneratedGraph) => void;
}

export default function ControlSidebar({
  onClose,
  isBusy,
  graphInput,
  onGraphInputChange,
  isDirected,
  onDirectedChange,
  isWeighted,
  onWeightedChange,
  onSimulate,
  onResetAll,
  onGenerateDefaultGraph,
}: ControlSidebarProps) {
  /* Algorithm state */
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmId>("dfs");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);

  /* Conditional input state */
  const [startNode, setStartNode]   = useState<string>("");
  const [nodeA, setNodeA]           = useState<string>("");
  const [nodeB, setNodeB]           = useState<string>("");

  const currentAlgo = ALL_ALGORITHMS.find((a) => a.id === selectedAlgo)!;

  const handleSimulate = () => {
    onSimulate({
      algorithm: selectedAlgo,
      startNode,
      nodeA,
      nodeB,
    });
  };

  const handleReset = () => {
    onGraphInputChange("");
    setStartNode("");
    setNodeA("");
    setNodeB("");
    onResetAll?.();
  };

  /* .txt file upload */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onGraphInputChange(text.trim());
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-uploading the same file
  };

  return (
    <>
      <AlgorithmPickerModal
        isOpen={pickerOpen}
        currentId={selectedAlgo}
        onSelect={(id) => setSelectedAlgo(id)}
        onClose={() => setPickerOpen(false)}
      />

      <GraphGeneratorModal
        isOpen={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onGenerate={(graph) => {
          onGenerateDefaultGraph?.(graph);
        }}
      />

      <aside
        className="flex h-full shrink-0 flex-col overflow-y-auto"
        style={{
          width: "320px",
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* ── Sidebar Header ── */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ background: "rgba(220,38,38,0.15)" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>
              Controls
            </span>
          </div>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              color: "var(--text-muted)",
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
            }}
          >
            Basic Graph
          </span>
          {/* Close button — only shown in mobile drawer */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup panel"
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:brightness-125"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-subtle)" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="1" y1="1" x2="11" y2="11" />
                <line x1="11" y1="1" x2="1" y2="11" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Sidebar Body ── */}
        <div className="flex flex-col gap-5 px-5 py-5">

          {/* ── SECTION: Graph Input ── */}
          <SidebarSection title="Graph Input">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="edge-input"
                  className="text-[12px] font-medium"
                  style={{ color: "var(--text-subtle)" }}
                >
                  Edge List
                </label>
                <button
                  type="button"
                  onClick={() => onGraphInputChange("")}
                  className="text-[11px] transition-colors hover:text-red-400"
                  style={{ color: "var(--text-muted)" }}
                >
                  Clear
                </button>
              </div>
              <textarea
                id="edge-input"
                rows={10}
                value={graphInput}
                onChange={(e) => onGraphInputChange(e.target.value)}
                placeholder={"u v [w]\n\nContoh:\n1 2 5\n1 3 2\n3 4 8\n2 4 1"}
                className="w-full resize-none rounded-md px-3 py-2.5 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              />
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Format: <code style={{ color: "var(--accent)" }}>u v [w]</code> — satu edge per baris.
                Graf otomatis ditampilkan saat mengetik.
              </p>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex gap-2">
                {/* Generate Default Graph button */}
                <button
                  type="button"
                  onClick={() => setGeneratorOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all hover:brightness-125 active:scale-[0.98]"
                  style={{
                    color: "var(--text-base)",
                    background: "rgba(220,38,38,0.15)",
                    border: "1px solid rgba(220,38,38,0.4)",
                  }}
                >
                  Graph Library
                </button>
                {/* Upload .txt button */}
                <button
                  id="btn-upload"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all hover:bg-gray-100 active:scale-[0.98]"
                  style={{
                    color: "var(--text-base)",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-strong)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload File .txt
                </button>
              </div>
            </div>

            {/* Graph type toggles */}
            <div className="flex gap-2">
              <ToggleChip
                label="Directed"
                active={isDirected}
                onToggle={() => onDirectedChange(!isDirected)}
              />
              <ToggleChip
                label="Weighted"
                active={isWeighted}
                onToggle={() => onWeightedChange(!isWeighted)}
              />
            </div>
          </SidebarSection>

          <Divider />

          {/* ── SECTION: Algorithm ── */}
          <SidebarSection title="Algorithm">
            {/* Algorithm picker button */}
            <button
              id="btn-pick-algo"
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 hover:border-red-300 hover:shadow-sm active:scale-[0.98]"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-strong)",
              }}
            >
              {/* Info */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px] font-semibold truncate"
                    style={{ color: "var(--primary)" }}
                  >
                    {currentAlgo.label}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold shrink-0"
                    style={{
                      background: "rgba(220,38,38,0.12)",
                      color: "var(--primary-light)",
                      border: "1px solid rgba(220,38,38,0.25)",
                    }}
                  >
                    #{currentAlgo.number}
                  </span>
                </div>
                <span
                  className="text-[11px] truncate"
                  style={{ color: "var(--text-subtle)" }}
                >
                  {currentAlgo.description}
                </span>
              </div>

              {/* Chevron */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                className="shrink-0"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <p
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              Klik untuk membuka daftar {ALL_ALGORITHMS.length} algoritma yang tersedia
            </p>

            {/* ── Conditional Inputs ── */}
            {currentAlgo.inputType === "start-node" && (
              <LabeledInput
                id="start-node"
                label="Start Node"
                value={startNode}
                onChange={setStartNode}
                placeholder="e.g.  1"
                hint="Simpul awal traversal"
              />
            )}

            {currentAlgo.inputType === "node-pair" && (
              <div className="flex gap-3">
                <LabeledInput
                  id="node-a"
                  label={currentAlgo.id === "dijkstra" ? "Source" : "Node A"}
                  value={nodeA}
                  onChange={setNodeA}
                  placeholder="e.g.  1"
                />
                <LabeledInput
                  id="node-b"
                  label={currentAlgo.id === "dijkstra" ? "Target" : "Node B"}
                  value={nodeB}
                  onChange={setNodeB}
                  placeholder="e.g.  4"
                />
              </div>
            )}

            {currentAlgo.inputType === "none" && (
              <p
                className="rounded-md px-3 py-2 text-[11px]"
                style={{
                  color: "var(--text-muted)",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                }}
              >
                Algoritma ini tidak memerlukan parameter tambahan.
              </p>
            )}
          </SidebarSection>

          <Divider />

          {/* ── SECTION: Actions ── */}
          <SidebarSection title="Actions">
            {/* Simulate button — run algorithm */}
            <button
              id="btn-simulate"
              type="button"
              onClick={handleSimulate}
              disabled={!!isBusy}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                boxShadow: "0 4px 16px rgba(220,38,38,0.4)",
                opacity: isBusy ? 0.55 : 1,
                cursor: isBusy ? "not-allowed" : "pointer",
              }}
            >
              ▶ Run
            </button>

            {/* Secondary button */}
            <button
              id="btn-reset"
              type="button"
              onClick={handleReset}
              className="w-full rounded-lg py-2 text-sm font-medium transition-all duration-150 hover:bg-gray-100 active:scale-[0.98]"
              style={{
                background: "var(--bg-raised)",
                color: "var(--text-base)",
                border: "1px solid var(--border-strong)",
              }}
            >
              Reset
            </button>
          </SidebarSection>
        </div>

        {/* ── Sidebar Footer ── */}
        <div
          className="mt-auto px-5 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Proyek Teori Graf Algoritmik - 2026
          </p>
        </div>
      </aside>
    </>
  );
}
