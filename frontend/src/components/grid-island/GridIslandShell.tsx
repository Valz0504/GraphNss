"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
      className="rounded-[4px] transition-colors"
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

  const timersRef = useRef<number[]>([]);
  const runTokenRef = useRef(0);

  useEffect(() => {
    return () => {
      runTokenRef.current += 1;
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const [rowsInput, setRowsInput] = useState<string>("10");
  const [colsInput, setColsInput] = useState<string>("14");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewportRef = useRef<HTMLElement | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const stats = useMemo(() => {
    const rows = grid?.length ?? 0;
    const cols = rows > 0 ? grid![0]!.length : 0;

    let land = 0;
    let water = 0;
    if (grid) {
      grid.forEach((r) =>
        r.forEach((c) => {
          if (c === 1) land += 1;
          else water += 1;
        })
      );
    }

    return { rows, cols, land, water };
  }, [grid]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      setViewport({ w: el.clientWidth, h: el.clientHeight });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    const PADDING = 24; // matches p-6
    const GAP = 4; // matches gap-1
    const DEFAULT_SIZE = 24;
    const MIN_SIZE = 18;
    const MAX_SIZE = 64;

    if (!grid || stats.rows === 0 || stats.cols === 0) {
      return {
        cellSize: DEFAULT_SIZE,
        gap: GAP,
        padding: PADDING,
        shouldCenter: true,
      };
    }

    const availW = Math.max(0, viewport.w - 2 * PADDING);
    const availH = Math.max(0, viewport.h - 2 * PADDING);

    if (availW === 0 || availH === 0) {
      return {
        cellSize: DEFAULT_SIZE,
        gap: GAP,
        padding: PADDING,
        shouldCenter: true,
      };
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
  };

  const handleCreateManualGrid = () => {
    resetTraversal();
    const rows = clampInt(Number(rowsInput), 1, 80);
    const cols = clampInt(Number(colsInput), 1, 80);
    setErrors([]);
    setGrid(createGrid(rows, cols, 0));
    setIslandCount(null);
    setIslandError(null);
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

    try {
      const res = await countIslands({ algorithm: islandAlgo, grid });
      setIslandCount(res.islands);
    } catch (err) {
      setIslandError(err instanceof Error ? err.message : "Gagal menghitung islands.");
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

    try {
      const res = await simulateIslands({ algorithm: islandAlgo, grid });
      if (token !== runTokenRef.current) return;

      setIslandCount(res.islands);

      const steps = res.steps ?? [];
      if (steps.length === 0) {
        setIsSimulating(false);
        return;
      }

      const tickMs = 40;
      const targetDurationMs = 8000;
      const maxTicks = Math.max(1, Math.floor(targetDurationMs / tickMs));
      const stepsPerTick = Math.max(1, Math.ceil(steps.length / maxTicks));

      let idx = 0;

      const tick = () => {
        if (token !== runTokenRef.current) return;

        const end = Math.min(steps.length, idx + stepsPerTick);
        const chunk: IslandTraversalStep[] = steps.slice(idx, end);
        idx = end;

        const last = chunk[chunk.length - 1]!;
        setActiveCell({ r: last.r, c: last.c });
        setActiveIsland(last.island);

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
      setIslandError(err instanceof Error ? err.message : "Gagal simulasi traversal.");
      setIsSimulating(false);
      setActiveCell(null);
      setActiveIsland(null);
    }
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Main grid area */}
      <main ref={viewportRef} className="bg-dot-grid relative flex min-w-0 flex-1 overflow-hidden">
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
                style={{
                  gridTemplateColumns: `repeat(${stats.cols}, ${layout.cellSize}px)`,
                  gap: layout.gap,
                }}
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
          <div className="flex flex-1 items-center justify-center px-8 text-center">
            <div className="flex max-w-md flex-col gap-2">
              <p className="text-sm font-medium" style={{ color: "var(--text-subtle)" }}>
                Belum ada grid
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Upload file <span style={{ color: "var(--primary-light)" }}>.txt</span> atau buat grid dari ukuran, lalu klik sel untuk toggle
                <span style={{ color: "var(--text-subtle)" }}> air(0) </span>
                dan
                <span style={{ color: "var(--text-subtle)" }}> daratan(1)</span>.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Sidebar */}
      <aside
        className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto"
        style={{
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ background: "rgba(220,38,38,0.15)" }}
            >
              <span className="text-[13px]" style={{ color: "var(--primary-light)" }}>
                ▦
              </span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>
              Grid Island
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
            Editor
          </span>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          <SidebarSection title="Input Grid (.txt)">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="grid-input"
                  className="text-[12px] font-medium"
                  style={{ color: "var(--text-subtle)" }}
                >
                  Grid Text
                </label>
                <button
                  type="button"
                  onClick={() => setGridText("")}
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
                onChange={(e) => setGridText(e.target.value)}
                placeholder={"0 1 0\n1 1 0\n0 0 1\n\nAtau tanpa spasi:\n010\n110\n001"}
                className="w-full resize-none rounded-md px-3 py-2.5 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              />
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Format: 0 = air, 1 = daratan. Bisa dipisah spasi atau tanpa spasi.
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                resetTraversal();

                const reader = new FileReader();
                reader.onload = (ev) => {
                  const text = (ev.target?.result as string) ?? "";
                  setGridText(text.trim());

                  const res = parseGridText(text);
                  setErrors(res.errors);
                  setGrid(res.grid);
                  setIslandCount(null);
                  setIslandError(null);
                };
                reader.readAsText(file);
                e.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all hover:brightness-125 active:scale-[0.98]"
              style={{
                color: "var(--text-subtle)",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
              }}
            >
              Upload File .txt
            </button>

            <button
              type="button"
              onClick={handleGenerateFromText}
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
                <label className="text-[12px] font-medium" style={{ color: "var(--text-subtle)" }}>
                  Rows
                </label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={rowsInput}
                  onChange={(e) => setRowsInput(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium" style={{ color: "var(--text-subtle)" }}>
                  Cols
                </label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={colsInput}
                  onChange={(e) => setColsInput(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreateManualGrid}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
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
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-subtle)",
              }}
            >
              <div className="flex items-center justify-between">
                <span>Ukuran</span>
                <span style={{ color: "var(--text-base)" }}>
                  {stats.rows} x {stats.cols}
                </span>
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
                <div
                  className="h-4 w-4 rounded-[3px]"
                  style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
                />
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Air (0)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-[3px]"
                  style={{ background: "var(--primary-dark)", border: "1px solid var(--primary)" }}
                />
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Daratan (1)
                </span>
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
                <label className="text-[12px] font-medium" style={{ color: "var(--text-subtle)" }}>
                  Algoritma
                </label>
                <select
                  value={islandAlgo}
                  onChange={(e) => setIslandAlgo(e.target.value as IslandAlgorithm)}
                  className="w-full rounded-md px-3 py-2 text-sm"
                  disabled={isCounting || isSimulating}
                >
                  <option value="bfs">BFS</option>
                  <option value="dfs">DFS</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSimulateTraversal}
                disabled={!grid || isCounting || isSimulating}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  boxShadow: "0 4px 16px rgba(220,38,38,0.4)",
                  opacity: !grid || isCounting || isSimulating ? 0.55 : 1,
                  cursor: !grid || isCounting || isSimulating ? "not-allowed" : "pointer",
                }}
              >
                {isSimulating ? "Menyimulasikan..." : "Simulasikan Traversal"}
              </button>

              <button
                type="button"
                onClick={handleCountIslands}
                disabled={!grid || isCounting || isSimulating}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                style={{
                  color: "var(--primary-light)",
                  background: "rgba(220,38,38,0.1)",
                  border: "1px solid rgba(220,38,38,0.4)",
                  opacity: !grid || isCounting || isSimulating ? 0.55 : 1,
                  cursor: !grid || isCounting || isSimulating ? "not-allowed" : "pointer",
                }}
              >
                {isCounting ? "Menghitung..." : "Hitung Jumlah Island"}
              </button>

              {islandCount != null && (
                <div
                  className="rounded-md px-3 py-2 text-[12px]"
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-subtle)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>Jumlah island</span>
                    <span style={{ color: "var(--text-base)" }}>{islandCount}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Metode</span>
                    <span style={{ color: "var(--text-base)" }}>{islandAlgo.toUpperCase()}</span>
                  </div>
                  {isSimulating && activeIsland != null && (
                    <div className="mt-1 flex items-center justify-between">
                      <span>Island aktif</span>
                      <span style={{ color: "var(--text-base)" }}>{activeIsland}</span>
                    </div>
                  )}
                </div>
              )}

              {islandError && (
                <div
                  className="rounded-md px-3 py-2 text-[11px]"
                  style={{
                    background: "rgba(220,38,38,0.12)",
                    border: "1px solid rgba(220,38,38,0.32)",
                    color: "var(--text-subtle)",
                  }}
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
              onClick={() => {
                resetTraversal();
                setErrors([]);
                setGrid(null);
                setIslandCount(null);
                setIslandError(null);
              }}
              className="w-full rounded-lg py-2 text-sm font-medium transition-all duration-150 hover:brightness-125 active:scale-[0.98]"
              style={{
                background: "var(--bg-raised)",
                color: "var(--text-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              Reset Grid
            </button>
          </SidebarSection>

          {errors.length > 0 && (
            <div
              className="rounded-md px-3 py-2"
              style={{
                background: "rgba(220,38,38,0.12)",
                border: "1px solid rgba(220,38,38,0.32)",
              }}
            >
              <p className="text-[12px] font-medium" style={{ color: "var(--primary-light)" }}>
                Error parsing
              </p>
              <ul className="mt-1 list-disc pl-5">
                {errors.slice(0, 6).map((e) => (
                  <li key={e} className="text-[11px]" style={{ color: "var(--text-subtle)" }}>
                    {e}
                  </li>
                ))}
              </ul>
              {errors.length > 6 && (
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  (+{errors.length - 6} error lain)
                </p>
              )}
            </div>
          )}
        </div>

        <div
          className="mt-auto px-5 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Input .txt + editor manual grid
          </p>
        </div>
      </aside>
    </div>
  );
}
