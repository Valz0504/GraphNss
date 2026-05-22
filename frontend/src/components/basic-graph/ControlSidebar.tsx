"use client";

import { useRef, useState } from "react";

import type { AlgorithmId } from "./types";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type InputType = "start-node" | "node-pair" | "none";

interface AlgorithmOption {
  id: AlgorithmId;
  label: string;
  inputType: InputType;
  description: string;
}

/* ─────────────────────────────────────────────
   Algorithm Registry
───────────────────────────────────────────── */
const ALGORITHMS: AlgorithmOption[] = [
  {
    id: "dfs",
    label: "1. DFS — Depth-First Search",
    inputType: "start-node",
    description: "Traversal mendalam dari simpul awal",
  },
  {
    id: "bfs",
    label: "2. BFS — Breadth-First Search",
    inputType: "start-node",
    description: "Traversal melebar level-by-level",
  },
  {
    id: "cek-lintasan",
    label: "3. Cek Lintasan",
    inputType: "node-pair",
    description: "Cek apakah ada jalur antara dua simpul",
  },
  {
    id: "cek-keterhubungan",
    label: "4. Cek Keterhubungan",
    inputType: "none",
    description: "Apakah graf terhubung (connected)?",
  },
  {
    id: "cari-komponen",
    label: "5. Cari Komponen",
    inputType: "none",
    description: "Temukan semua komponen terhubung",
  },
];

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
        style={{ color: "var(--text-muted)" }}
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
        style={{ color: "var(--text-subtle)" }}
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
      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150"
      style={{
        background: active ? "rgba(220,38,38,0.15)" : "var(--bg-raised)",
        color: active ? "var(--primary-light)" : "var(--text-subtle)",
        border: `1px solid ${active ? "rgba(220,38,38,0.4)" : "var(--border)"}`,
      }}
    >
      <span
        className="h-2 w-2 rounded-full transition-colors"
        style={{ background: active ? "var(--primary)" : "var(--text-muted)" }}
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
  onVisualise: (payload: { graphInput: string; directed: boolean; weighted: boolean }) => void;
  onSimulate: (payload: {
    graphInput: string;
    directed: boolean;
    weighted: boolean;
    algorithm: AlgorithmId;
    startNode?: string;
    nodeA?: string;
    nodeB?: string;
  }) => void;
  onResetAll?: () => void;
}

export default function ControlSidebar({ onClose, isBusy, onVisualise, onSimulate, onResetAll }: ControlSidebarProps) {
  /* Graph input state */
  const [graphInput, setGraphInput] = useState<string>("");
  const [isDirected, setIsDirected] = useState<boolean>(false);
  const [isWeighted, setIsWeighted] = useState<boolean>(false);

  /* Algorithm state */
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmId>("dfs");

  /* Conditional input state */
  const [startNode, setStartNode]   = useState<string>("");
  const [nodeA, setNodeA]           = useState<string>("");
  const [nodeB, setNodeB]           = useState<string>("");

  const currentAlgo = ALGORITHMS.find((a) => a.id === selectedAlgo)!;

  const handleSimulate = () => {
    onSimulate({
      graphInput,
      directed: isDirected,
      weighted: isWeighted,
      algorithm: selectedAlgo,
      startNode,
      nodeA,
      nodeB,
    });
  };

  const handleReset = () => {
    setGraphInput("");
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
      setGraphInput(text.trim());
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-uploading the same file
  };

  /* Placeholder visualise handler */
  const handleVisualise = () => {
    onVisualise({ graphInput, directed: isDirected, weighted: isWeighted });
  };

  return (
    <aside
      className="flex h-full shrink-0 flex-col overflow-y-auto"
      style={{
        width: "320px",
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--border)",
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
                onClick={() => setGraphInput("")}
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
              onChange={(e) => setGraphInput(e.target.value)}
              placeholder={"u v [w]\n\nContoh:\n1 2 5\n1 3 2\n3 4 8\n2 4 1"}
              className="w-full resize-none rounded-md px-3 py-2.5 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            />
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Format: <code style={{ color: "var(--accent)" }}>u v [w]</code> — satu edge per baris.
              Weight opsional.
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
            {/* Upload .txt button */}
            <button
              id="btn-upload"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all hover:brightness-125 active:scale-[0.98]"
              style={{
                color: "var(--text-subtle)",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
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

          {/* Graph type toggles */}
          <div className="flex gap-2">
            <ToggleChip
              label="Directed"
              active={isDirected}
              onToggle={() => setIsDirected((p) => !p)}
            />
            <ToggleChip
              label="Weighted"
              active={isWeighted}
              onToggle={() => setIsWeighted((p) => !p)}
            />
          </div>
        </SidebarSection>

        <Divider />

        {/* ── SECTION: Algorithm ── */}
        <SidebarSection title="Algorithm">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="algo-select"
              className="text-[12px] font-medium"
              style={{ color: "var(--text-subtle)" }}
            >
              Pilih Algoritma
            </label>
            <select
              id="algo-select"
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value as AlgorithmId)}
              className="w-full rounded-md px-3 py-2 text-sm"
            >
              {ALGORITHMS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
            {/* Description */}
            <p
              className="rounded-md px-3 py-2 text-[12px] leading-relaxed"
              style={{
                background: "var(--bg-raised)",
                color: "var(--text-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              {currentAlgo.description}
            </p>
          </div>

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
                label="Node A"
                value={nodeA}
                onChange={setNodeA}
                placeholder="e.g.  1"
              />
              <LabeledInput
                id="node-b"
                label="Node B"
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
          {/* Visualise button — render graph on canvas */}
          <button
            id="btn-visualise"
            type="button"
            onClick={handleVisualise}
            disabled={!!isBusy}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            style={{
              color: "var(--primary-light)",
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.4)",
              opacity: isBusy ? 0.55 : 1,
              cursor: isBusy ? "not-allowed" : "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="5"  cy="12" r="2" />
              <circle cx="19" cy="5"  r="2" />
              <circle cx="19" cy="19" r="2" />
              <line x1="6.9"  y1="11.1" x2="17.1" y2="6.3"  />
              <line x1="6.9"  y1="12.9" x2="17.1" y2="17.7" />
            </svg>
            Tampilkan Graf
          </button>

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
            ▶ Simulasikan
          </button>

          {/* Secondary button */}
          <button
            id="btn-reset"
            type="button"
            onClick={handleReset}
            className="w-full rounded-lg py-2 text-sm font-medium transition-all duration-150 hover:brightness-125 active:scale-[0.98]"
            style={{
              background: "var(--bg-raised)",
              color: "var(--text-subtle)",
              border: "1px solid var(--border)",
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
  );
}
