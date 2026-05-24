"use client";

import { useEffect, useRef } from "react";
import type { AlgorithmId } from "./types";

/* ─────────────────────────────────────────────
   Algorithm Registry with categories
───────────────────────────────────────────── */
type InputType = "start-node" | "node-pair" | "none";

export interface AlgorithmMeta {
  id: AlgorithmId;
  label: string;
  number: number;
  inputType: InputType;
  description: string;
}

export type AlgorithmCategory = {
  name: string;
  color: string; // CSS color for the category badge
  algorithms: AlgorithmMeta[];
};

export const ALGORITHM_CATEGORIES: AlgorithmCategory[] = [
  {
    name: "Traversal",
    color: "rgba(99,102,241,0.8)",
    algorithms: [
      {
        id: "dfs",
        label: "DFS",
        number: 1,
        inputType: "start-node",
        description: "Traversal mendalam dari simpul awal secara rekursif",
      },
      {
        id: "bfs",
        label: "BFS",
        number: 2,
        inputType: "start-node",
        description: "Traversal melebar level-by-level dari simpul awal",
      },
    ],
  },
  {
    name: "Jalur",
    color: "rgba(16,185,129,0.8)",
    algorithms: [
      {
        id: "cek-lintasan",
        label: "Cek Lintasan",
        number: 3,
        inputType: "node-pair",
        description: "Apakah ada jalur antara dua simpul?",
      },
      {
        id: "dijkstra",
        label: "Dijkstra",
        number: 11,
        inputType: "node-pair",
        description: "Lintasan terpendek berbobot antara dua simpul",
      },
    ],
  },
  {
    name: "Komponen",
    color: "rgba(245,158,11,0.8)",
    algorithms: [
      {
        id: "cek-keterhubungan",
        label: "Cek Keterhubungan",
        number: 4,
        inputType: "none",
        description: "Apakah seluruh graf terhubung (connected)?",
      },
      {
        id: "cari-komponen",
        label: "Cari Komponen",
        number: 5,
        inputType: "none",
        description: "Temukan semua komponen terhubung dalam graf",
      },
      {
        id: "komponen-terbesar",
        label: "Komponen Terbesar",
        number: 6,
        inputType: "none",
        description: "Tentukan komponen terhubung terbesar dalam graf",
      },
    ],
  },
  {
    name: "Properti Graf",
    color: "rgba(220,38,38,0.8)",
    algorithms: [
      {
        id: "cek-bipartite",
        label: "Cek Bipartite",
        number: 7,
        inputType: "none",
        description: "Apakah graf dapat dibagi menjadi dua kelompok (bipartite)?",
      },
      {
        id: "diameter",
        label: "Diameter Graf",
        number: 8,
        inputType: "none",
        description: "Jarak terpanjang dari semua pasangan simpul terhubung",
      },
      {
        id: "deteksi-siklus",
        label: "Deteksi Siklus",
        number: 9,
        inputType: "none",
        description: "Apakah terdapat siklus dalam graf?",
      },
      {
        id: "girth",
        label: "Girth",
        number: 10,
        inputType: "none",
        description: "Panjang siklus terkecil dalam graf",
      },
      {
        id: "matching",
        label: "Max Bipartite Matching",
        number: 14,
        inputType: "none",
        description: "Pencarian pasangan maksimal pada graf bipartit",
      },
      {
        id: "bandwidth",
        label: "Graph Bandwidth (Cuthill-McKee)",
        number: 15,
        inputType: "none",
        description: "Reduksi bandwidth dan pertukaran posisi node dengan algoritma RCM",
      },
    ],
  },
  {
    name: "Pohon Pembangun Minimal (MST)",
    color: "rgba(6,182,212,0.8)",
    algorithms: [
      {
        id: "prim",
        label: "MST Prim",
        number: 12,
        inputType: "none",
        description: "Pohon pembangun minimal — algoritma Prim (greedy dari simpul awal)",
      },
      {
        id: "kruskal",
        label: "MST Kruskal",
        number: 13,
        inputType: "none",
        description: "Pohon pembangun minimal — algoritma Kruskal (union-find, urutkan edge)",
      },
    ],
  },
];

// Flatten for easy lookup
export const ALL_ALGORITHMS: AlgorithmMeta[] = ALGORITHM_CATEGORIES.flatMap(
  (cat) => cat.algorithms
);

/* ─────────────────────────────────────────────
   AlgorithmPickerModal component
───────────────────────────────────────────── */
interface AlgorithmPickerModalProps {
  isOpen: boolean;
  currentId: AlgorithmId;
  onSelect: (id: AlgorithmId) => void;
  onClose: () => void;
}

export default function AlgorithmPickerModal({
  isOpen,
  currentId,
  onSelect,
  onClose,
}: AlgorithmPickerModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.15s ease",
      }}
    >
      {/* Modal panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Pilih Algoritma"
        className="flex flex-col overflow-hidden rounded-2xl"
        style={{
          width: "min(680px, 95vw)",
          maxHeight: "min(700px, 90vh)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          animation: "modalSlideIn 0.2s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>
              Pilih Algoritma
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {ALL_ALGORITHMS.length} algoritma tersedia dalam {ALGORITHM_CATEGORIES.length} kategori
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:brightness-125"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              color: "var(--text-subtle)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          {ALGORITHM_CATEGORIES.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-2.5">
              {/* Category label */}
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                  style={{ background: cat.color }}
                >
                  {cat.name}
                </span>
                <div className="h-px flex-1" style={{ background: "var(--border)" }} />
              </div>

              {/* Algorithm cards grid */}
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {cat.algorithms.map((algo) => {
                  const isSelected = algo.id === currentId;
                  return (
                    <button
                      key={algo.id}
                      type="button"
                      id={`algo-pick-${algo.id}`}
                      onClick={() => {
                        onSelect(algo.id);
                        onClose();
                      }}
                      className="flex flex-col gap-1.5 rounded-xl p-3 text-left transition-all duration-100 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: isSelected
                          ? "rgba(220,38,38,0.12)"
                          : "var(--bg-raised)",
                        border: `1px solid ${isSelected ? "rgba(220,38,38,0.5)" : "var(--border)"}`,
                        boxShadow: isSelected
                          ? "0 0 0 1px rgba(220,38,38,0.2)"
                          : "none",
                        cursor: "pointer",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold"
                          style={{
                            background: isSelected ? "rgba(220,38,38,0.2)" : "var(--bg-base)",
                            color: isSelected ? "var(--primary-light)" : "var(--text-muted)",
                            border: `1px solid ${isSelected ? "rgba(220,38,38,0.3)" : "var(--border)"}`,
                          }}
                        >
                          #{algo.number}
                        </span>
                      </div>
                      <span
                        className="text-[13px] font-semibold leading-tight"
                        style={{ color: isSelected ? "var(--primary-light)" : "var(--text-base)" }}
                      >
                        {algo.label}
                      </span>
                      <span
                        className="text-[11px] leading-relaxed"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {algo.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
