"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ConsolePanel from "@/components/basic-graph/ConsolePanel";
import type { ConsoleLine } from "@/components/basic-graph/types";
import {
  countIslands,
  simulateIslands,
  type IslandAlgorithm,
  type IslandTraversalStep,
} from "@/lib/gridIslandApi";

import { createGrid, parseGridText, type GridCell, type GridModel } from "./gridParsing";

function Divider() {
  return <div style={{ height: "1px", background: "var(--border)", flexShrink: 0 }} />;
}

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

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function cellKey(r: number, c: number) {
  return `${r},${c}`;
}

function CellButton({
  value,
  size,
  isVisited,
  isActive,
  disabled,
  onClick,
  title,
}: {
  value: GridCell;
  size: number;
  isVisited: boolean;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
  title: string;
}) {
  const isLand = value === 1;
  const baseBorder = isLand ? "var(--primary)" : "var(--border)";
  const visitedBorder = isVisited && isLand ? "var(--primary-light)" : baseBorder;
  const border = isActive ? "var(--accent)" : visitedBorder;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-sm transition-colors"
      style={{
        width: size,
        height: size,
        background: isLand ? "var(--primary-dark)" : "var(--bg-raised)",
        border: `1px solid ${border}`,
        outline: isActive ? `2px solid var(--accent)` : "none",
        outlineOffset: isActive ? 1 : 0,
        opacity: disabled ? 0.72 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    />
  );
}

/* ─── Sidebar content (shared between desktop aside and mobile drawer) ─── */
function GridIslandSidebar({
  gridText,
  onGridTextChange,
  rowsInput,
  colsInput,
  onRowsChange,
  onColsChange,
  islandAlgo,
  onAlgoChange,
  islandCount,
  islandError,
  isCounting,
  isSimulating,
  stats,
  grid,
  onFileUpload,
  onGenerateFromText,
  onCreateManualGrid,
  onSimulateTraversal,
  onCountIslands,
  onReset,
  onClose,
}: {
  gridText: string;
  onGridTextChange: (v: string) => void;
  rowsInput: string;
  colsInput: string;
  onRowsChange: (v: string) => void;
  onColsChange: (v: string) => void;
  islandAlgo: IslandAlgorithm;
  onAlgoChange: (v: IslandAlgorithm) => void;
  islandCount: number | null;
  islandError: string | null;
  isCounting: boolean;
  isSimulating: boolean;
  stats: { rows: number; cols: number; land: number; water: number };
  grid: GridModel | null;
  onFileUpload: (text: string) => void;
  onGenerateFromText: () => void;
  onCreateManualGrid: () => void;
  onSimulateTraversal: () => void;
  onCountIslands: () => void;
  onReset: () => void;
  onClose?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="flex h-full flex-col overflow-y-auto"
      style={{ width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded"
            style={{ background: "rgba(220,38,38,0.15)" }}
          >
            <span className="text-[13px]" style={{ color: "var(--primary-light)" }}>▦</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>
            Grid Island
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ color: "var(--text-muted)", background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            Editor
          </span>
          {onClose && (
            <button onClick={onClose} className="text-lg leading-none" style={{ color: "var(--text-muted)" }}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        <SidebarSection title="Input Grid (.txt)">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="grid-input" className="text-[12px] font-medium" style={{ color: "var(--text-subtle)" }}>
                Grid Text
              </label>
              <button
                type="button"
                onClick={() => onGridTextChange("")}
                className="text-[11px] transition-colors hover:text-red-400"
                style={{ color: "var(--text-muted)" }}
              >
                Clear
              </button>
            </div>
            <textarea
              id="grid-input"
              rows={8}
              value={gridText}
              onChange={(e) => onGridTextChange(e.target.value)}
              placeholder={"0 1 0\n1 1 0\n0 0 1\n\nAtau tanpa spasi:\n010\n110\n001"}
              className="w-full resize-none rounded-md px-3 py-2.5 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            />
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Format: 0 = air, 1 = daratan. Bisa dipisah spasi atau tanpa spasi.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const text = (ev.target?.result as string) ?? "";
                onGridTextChange(text.trim());
                onFileUpload(text);
              };
              reader.readAsText(file);
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all hover:brightness-125 active:scale-[0.98]"
            style={{ color: "var(--text-subtle)", background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            Upload File .txt
          </button>

          <button
            type="button"
            onClick={onGenerateFromText}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              boxShadow: "0 4px 16px rgba(220,38,38,0.4)",
            }}
          >
            Generate Grid
          </button>
        </SidebarSection>

        <Divider />

        <SidebarSection title="Ukuran Grid (Manual)">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: "var(--text-subtle)" }}>Rows</label>
              <input
                type="number"
                min={1}
                max={80}
                value={rowsInput}
                onChange={(e) => onRowsChange(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: "var(--text-subtle)" }}>Cols</label>
              <input
                type="number"
                min={1}
                max={80}
                value={colsInput}
                onChange={(e) => onColsChange(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onCreateManualGrid}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            style={{
              color: "var(--primary-light)",
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.4)",
            }}
          >
            Buat Grid Kosong
          </button>
        </SidebarSection>

        <Divider />

        <SidebarSection title="Info">
          <div
            className="rounded-md px-3 py-2 text-[12px]"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <span>Ukuran</span>
              <span style={{ color: "var(--text-base)" }}>{stats.rows} x {stats.cols}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>Daratan (1)</span>
              <span style={{ color: "var(--text-base)" }}>{stats.land}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>Air (0)</span>
              <span style={{ color: "var(--text-base)" }}>{stats.water}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-[3px]" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Air (0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-[3px]" style={{ background: "var(--primary-dark)", border: "1px solid var(--primary)" }} />
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Daratan (1)</span>
            </div>
          </div>

          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Klik sel untuk toggle nilai 0/1.
          </p>
        </SidebarSection>

        <Divider />

        <SidebarSection title="Hitung Islands">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: "var(--text-subtle)" }}>Algoritma</label>
              <select
                value={islandAlgo}
                onChange={(e) => onAlgoChange(e.target.value as IslandAlgorithm)}
                className="w-full rounded-md px-3 py-2 text-sm"
                disabled={isCounting || isSimulating}
              >
                <option value="bfs">BFS</option>
                <option value="dfs">DFS</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onSimulateTraversal}
              disabled={!grid || isCounting || isSimulating}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                boxShadow: "0 4px 16px rgba(220,38,38,0.4)",
                opacity: !grid || isCounting || isSimulating ? 0.55 : 1,
                cursor: !grid || isCounting || isSimulating ? "not-allowed" : "pointer",
              }}
            >
              {isSimulating ? "Menyimulasikan..." : "▶ Run Traversal"}
            </button>

            <button
              type="button"
              onClick={onCountIslands}
              disabled={!grid || isCounting || isSimulating}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              style={{
                color: "var(--primary-light)",
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.4)",
                opacity: !grid || isCounting || isSimulating ? 0.55 : 1,
                cursor: !grid || isCounting || isSimulating ? "not-allowed" : "pointer",
              }}
            >
              {isCounting ? "Menghitung..." : "▶ Run Hitung Island"}
            </button>

            {islandCount != null && (
              <div
                className="rounded-md px-3 py-2 text-[12px]"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-subtle)" }}
              >
                <div className="flex items-center justify-between">
                  <span>Jumlah island</span>
                  <span style={{ color: "var(--text-base)" }}>{islandCount}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span>Metode</span>
                  <span style={{ color: "var(--text-base)" }}>{islandAlgo.toUpperCase()}</span>
                </div>
              </div>
            )}

            {islandError && (
              <div
                className="rounded-md px-3 py-2 text-[11px]"
                style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.32)", color: "var(--text-subtle)" }}
              >
                {islandError}
              </div>
            )}
          </div>
        </SidebarSection>

        <Divider />

        <SidebarSection title="Actions">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-lg py-2 text-sm font-medium transition-all duration-150 hover:brightness-125 active:scale-[0.98]"
            style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
          >
            Reset Grid
          </button>
        </SidebarSection>
      </div>

      <div className="mt-auto px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Input .txt + editor manual grid
        </p>
      </div>
    </div>
  );
}

/* ─── Shell ─── */
export default function GridIslandShell() {
  const [gridText, setGridText] = useState<string>("1 1 0 0\n1 0 0 1\n0 0 1 1\n0 1 1 0");
  const [grid, setGrid] = useState<GridModel | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const [islandAlgo, setIslandAlgo] = useState<IslandAlgorithm>("bfs");
  const [islandCount, setIslandCount] = useState<number | null>(null);
  const [islandError, setIslandError] = useState<string | null>(null);
  const [isCounting, setIsCounting] = useState(false);

  const [isSimulating, setIsSimulating] = useState(false);
  const [visitedCellKeys, setVisitedCellKeys] = useState<Set<string>>(() => new Set());
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [activeIsland, setActiveIsland] = useState<number | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [lines, setLines] = useState<ConsoleLine[]>([
    { type: "info",  text: "Grid Island siap." },
    { type: "muted", text: "Generate grid dari input atau ukuran, lalu jalankan traversal." },
  ]);

  const timersRef = useRef<number[]>([]);
  const runTokenRef = useRef(0);

  function appendLine(line: ConsoleLine) {
    setLines((prev) => [...prev, line]);
  }

  useEffect(() => {
    return () => {
      runTokenRef.current += 1;
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const [rowsInput, setRowsInput] = useState<string>("10");
  const [colsInput, setColsInput] = useState<string>("14");

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const stats = useMemo(() => {
    const rows = grid?.length ?? 0;
    const cols = rows > 0 ? grid![0]!.length : 0;
    let land = 0;
    let water = 0;
    if (grid) {
      grid.forEach((r) => r.forEach((c) => { if (c === 1) land++; else water++; }));
    }
    return { rows, cols, land, water };
  }, [grid]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    const PADDING = 24;
    const GAP = 4;
    const DEFAULT_SIZE = 24;
    const MIN_SIZE = 18;
    const MAX_SIZE = 64;

    if (!grid || stats.rows === 0 || stats.cols === 0) {
      return { cellSize: DEFAULT_SIZE, gap: GAP, padding: PADDING, shouldCenter: true };
    }

    const availW = Math.max(0, viewport.w - 2 * PADDING);
    const availH = Math.max(0, viewport.h - 2 * PADDING);

    if (availW === 0 || availH === 0) {
      return { cellSize: DEFAULT_SIZE, gap: GAP, padding: PADDING, shouldCenter: true };
    }

    const fitW = Math.floor((availW - (stats.cols - 1) * GAP) / stats.cols);
    const fitH = Math.floor((availH - (stats.rows - 1) * GAP) / stats.rows);
    const fit = Math.min(fitW, fitH);
    const cellSize = clampInt(fit, MIN_SIZE, MAX_SIZE);

    const gridW = stats.cols * cellSize + (stats.cols - 1) * GAP;
    const gridH = stats.rows * cellSize + (stats.rows - 1) * GAP;
    const shouldCenter = gridW <= availW && gridH <= availH;

    return { cellSize, gap: GAP, padding: PADDING, shouldCenter };
  }, [grid, stats.rows, stats.cols, viewport.w, viewport.h]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const resetTraversal = () => {
    runTokenRef.current += 1;
    clearTimers();
    setIsSimulating(false);
    setVisitedCellKeys(new Set());
    setActiveCell(null);
    setActiveIsland(null);
  };

  const handleGenerateFromText = () => {
    resetTraversal();
    const res = parseGridText(gridText);
    setErrors(res.errors);
    setGrid(res.grid);
    setIslandCount(null);
    setIslandError(null);
    if (res.grid && res.errors.length === 0) {
      const r = res.grid.length;
      const c = res.grid[0]?.length ?? 0;
      setLines([
        { type: "info",  text: `Grid ${r}×${c} berhasil di-generate.` },
        { type: "muted", text: "Klik sel untuk toggle, lalu jalankan traversal atau hitung island." },
      ]);
    } else if (res.errors.length > 0) {
      setLines([{ type: "error", text: `Parsing error: ${res.errors[0]}` }]);
    }
  };

  const handleFileUpload = (text: string) => {
    resetTraversal();
    const res = parseGridText(text);
    setErrors(res.errors);
    setGrid(res.grid);
    setIslandCount(null);
    setIslandError(null);
    if (res.grid && res.errors.length === 0) {
      const r = res.grid.length;
      const c = res.grid[0]?.length ?? 0;
      setLines([{ type: "info", text: `File berhasil diupload. Grid ${r}×${c}.` }]);
    }
  };

  const handleCreateManualGrid = () => {
    resetTraversal();
    const rows = clampInt(Number(rowsInput), 1, 80);
    const cols = clampInt(Number(colsInput), 1, 80);
    setErrors([]);
    setGrid(createGrid(rows, cols, 0));
    setIslandCount(null);
    setIslandError(null);
    setLines([
      { type: "info",  text: `Grid kosong ${rows}×${cols} dibuat.` },
      { type: "muted", text: "Klik sel untuk toggle daratan/air." },
    ]);
  };

  const toggleCell = (r: number, c: number) => {
    if (isCounting || isSimulating) return;
    setGrid((prev) => {
      if (!prev) return prev;
      const next = prev.map((row) => row.slice()) as GridModel;
      next[r]![c] = next[r]![c] === 1 ? 0 : 1;
      return next;
    });
    resetTraversal();
    setIslandCount(null);
    setIslandError(null);
  };

  const handleCountIslands = async () => {
    if (!grid) {
      setIslandError("Grid belum ada. Generate dulu dari input/ukuran.");
      return;
    }
    resetTraversal();
    setIsCounting(true);
    setIslandError(null);
    setLines([
      { type: "info",  text: `Menghitung islands dengan ${islandAlgo.toUpperCase()}...` },
      { type: "muted", text: `Grid ${stats.rows}×${stats.cols} · ${stats.land} daratan` },
    ]);
    try {
      const res = await countIslands({ algorithm: islandAlgo, grid });
      setIslandCount(res.islands);
      appendLine({ type: "output", text: `Jumlah island: ${res.islands}` });
      appendLine({ type: "info",   text: "Selesai." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghitung islands.";
      setIslandError(msg);
      appendLine({ type: "error", text: msg });
      setIslandCount(null);
    } finally {
      setIsCounting(false);
    }
  };

  const handleSimulateTraversal = async () => {
    if (!grid) {
      setIslandError("Grid belum ada. Generate dulu dari input/ukuran.");
      return;
    }

    const token = (runTokenRef.current += 1);
    clearTimers();

    setIsSimulating(true);
    setVisitedCellKeys(new Set());
    setActiveCell(null);
    setActiveIsland(null);
    setIslandError(null);
    setIslandCount(null);
    setLines([
      { type: "info",  text: `Traversal ${islandAlgo.toUpperCase()} pada grid ${stats.rows}×${stats.cols}` },
      { type: "muted", text: "─────────────────────────────" },
    ]);

    try {
      const res = await simulateIslands({ algorithm: islandAlgo, grid });
      if (token !== runTokenRef.current) return;

      setIslandCount(res.islands);

      const steps = res.steps ?? [];
      if (steps.length === 0) {
        setIsSimulating(false);
        appendLine({ type: "info", text: `Selesai. Tidak ada island.` });
        return;
      }

      const tickMs = 40;
      const targetDurationMs = 8000;
      const maxTicks = Math.max(1, Math.floor(targetDurationMs / tickMs));
      const stepsPerTick = Math.max(1, Math.ceil(steps.length / maxTicks));

      let idx = 0;
      let lastLoggedIsland = -1;

      const tick = () => {
        if (token !== runTokenRef.current) return;

        const end = Math.min(steps.length, idx + stepsPerTick);
        const chunk: IslandTraversalStep[] = steps.slice(idx, end);
        idx = end;

        const last = chunk[chunk.length - 1]!;
        setActiveCell({ r: last.r, c: last.c });
        setActiveIsland(last.island);

        // Log new island discovery
        const chunkNewIsland = chunk.find((s) => s.island !== lastLoggedIsland);
        if (chunkNewIsland && chunkNewIsland.island !== lastLoggedIsland) {
          lastLoggedIsland = chunkNewIsland.island;
          setLines((prev) => [
            ...prev,
            { type: "output", text: `Island #${chunkNewIsland.island} ditemukan di (${chunkNewIsland.r + 1},${chunkNewIsland.c + 1})` },
          ]);
        }

        setVisitedCellKeys((prev) => {
          const next = new Set(prev);
          chunk.forEach((s) => next.add(cellKey(s.r, s.c)));
          return next;
        });

        if (idx >= steps.length) {
          const done = window.setTimeout(() => {
            if (token !== runTokenRef.current) return;
            setIsSimulating(false);
            setActiveCell(null);
            setActiveIsland(null);
            setLines((prev) => [
              ...prev,
              { type: "muted", text: "─────────────────────────────" },
              { type: "info",  text: `Traversal selesai. Ditemukan ${res.islands} island.` },
            ]);
          }, tickMs);
          timersRef.current.push(done);
          return;
        }

        const t = window.setTimeout(tick, tickMs);
        timersRef.current.push(t);
      };

      tick();
    } catch (err) {
      if (token !== runTokenRef.current) return;
      const msg = err instanceof Error ? err.message : "Gagal simulasi traversal.";
      setIslandError(msg);
      appendLine({ type: "error", text: msg });
      setIsSimulating(false);
      setActiveCell(null);
      setActiveIsland(null);
    }
  };

  const handleReset = () => {
    resetTraversal();
    setErrors([]);
    setGrid(null);
    setIslandCount(null);
    setIslandError(null);
    setLines([
      { type: "info",  text: "Grid Island siap." },
      { type: "muted", text: "Generate grid dari input atau ukuran, lalu jalankan traversal." },
    ]);
  };

  const sidebarProps = {
    gridText,
    onGridTextChange: (v: string) => {
      setGridText(v);
    },
    rowsInput,
    colsInput,
    onRowsChange: setRowsInput,
    onColsChange: setColsInput,
    islandAlgo,
    onAlgoChange: setIslandAlgo,
    islandCount,
    islandError,
    isCounting,
    isSimulating,
    stats,
    grid,
    onFileUpload: handleFileUpload,
    onGenerateFromText: handleGenerateFromText,
    onCreateManualGrid: handleCreateManualGrid,
    onSimulateTraversal: handleSimulateTraversal,
    onCountIslands: handleCountIslands,
    onReset: handleReset,
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Main area: grid + console */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Grid viewport */}
        <div
          ref={viewportRef}
          className="bg-dot-grid relative flex-1 overflow-hidden"
        >
          {grid ? (
            <div className="absolute inset-0 overflow-auto">
              <div
                className="min-h-full min-w-full"
                style={{
                  padding: layout.padding,
                  display: "flex",
                  alignItems: layout.shouldCenter ? "center" : "flex-start",
                  justifyContent: layout.shouldCenter ? "center" : "flex-start",
                }}
              >
                <div
                  className="inline-grid"
                  style={{ gridTemplateColumns: `repeat(${stats.cols}, ${layout.cellSize}px)`, gap: layout.gap }}
                >
                  {grid.map((row, r) =>
                    row.map((cell, c) => {
                      const k = cellKey(r, c);
                      const isActive = !!activeCell && activeCell.r === r && activeCell.c === c;
                      return (
                        <CellButton
                          key={k}
                          value={cell}
                          size={layout.cellSize}
                          isVisited={visitedCellKeys.has(k)}
                          isActive={isActive}
                          disabled={isCounting || isSimulating}
                          onClick={() => toggleCell(r, c)}
                          title={`(${r + 1},${c + 1}) = ${cell === 1 ? "daratan" : "air"}`}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <div className="flex max-w-md flex-col gap-2">
                <p className="text-sm font-medium" style={{ color: "var(--text-subtle)" }}>
                  Belum ada grid
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Upload file{" "}
                  <span style={{ color: "var(--primary-light)" }}>.txt</span>{" "}
                  atau buat grid dari ukuran, lalu klik sel untuk toggle{" "}
                  <span style={{ color: "var(--text-subtle)" }}>air(0)</span> dan{" "}
                  <span style={{ color: "var(--text-subtle)" }}>daratan(1)</span>.
                </p>
              </div>
            </div>
          )}

          {/* Parse errors overlay */}
          {errors.length > 0 && (
            <div
              className="absolute bottom-3 left-3 rounded-md px-3 py-2"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.32)", maxWidth: 320 }}
            >
              <p className="text-[12px] font-medium" style={{ color: "var(--primary-light)" }}>Error parsing</p>
              <ul className="mt-1 list-disc pl-5">
                {errors.slice(0, 4).map((e) => (
                  <li key={e} className="text-[11px]" style={{ color: "var(--text-subtle)" }}>{e}</li>
                ))}
              </ul>
              {errors.length > 4 && (
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  (+{errors.length - 4} error lain)
                </p>
              )}
            </div>
          )}
        </div>

        <ConsolePanel lines={lines} />
      </main>

      {/* Desktop sidebar (right, always visible lg+) */}
      <div className="hidden lg:flex">
        <GridIslandSidebar {...sidebarProps} />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ top: "var(--navbar-h)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="lg:hidden fixed inset-y-0 right-0 z-50 overflow-y-auto"
            style={{
              top: "var(--navbar-h)",
              width: "min(320px, 90vw)",
              animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          >
            <GridIslandSidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* Mobile toggle button */}
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
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="15" y2="18" />
          </svg>
          Kontrol
        </button>
      )}
    </div>
  );
}
