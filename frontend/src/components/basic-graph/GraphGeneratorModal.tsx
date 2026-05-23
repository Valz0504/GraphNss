"use client";

import { useEffect, useState } from "react";
import {
  generateBipartiteGraph,
  generateCirculant,
  generateCompleteGraph,
  generateCycle,
  generateGeneralizedPetersen,
  generateGrid,
  generateHypercube,
  generatePath,
  generatePetersen,
  generatePrism,
  generateTree,
  generateWheel,
} from "@/lib/graphGenerators";
import type { GeneratedGraph } from "@/lib/graphGenerators";

type GeneratorId =
  | "complete"
  | "bipartite"
  | "tree"
  | "cycle"
  | "path"
  | "wheel"
  | "prism"
  | "petersen"
  | "gen-petersen"
  | "circulant"
  | "hypercube"
  | "grid";

interface GeneratorMeta {
  id: GeneratorId;
  name: string;
  description: string;
  params: { key: string; label: string; default: number; min: number; max: number }[];
}

const GENERATORS: GeneratorMeta[] = [
  { id: "complete", name: "Graf Lengkap (K_n)", description: "Semua node terhubung ke semua node lain.", params: [{ key: "n", label: "Jumlah node (n)", default: 5, min: 1, max: 30 }] },
  { id: "bipartite", name: "Bipartit Lengkap (K_{m,n})", description: "Dua grup node di mana setiap node grup A terhubung ke semua node grup B.", params: [{ key: "m", label: "Grup A (m)", default: 3, min: 1, max: 15 }, { key: "n", label: "Grup B (n)", default: 4, min: 1, max: 15 }] },
  { id: "tree", name: "Pohon Acak (T_n)", description: "Graf terhubung tanpa siklus.", params: [{ key: "n", label: "Jumlah node (n)", default: 10, min: 1, max: 50 }] },
  { id: "cycle", name: "Siklus (C_n)", description: "Graf berbentuk cincin tunggal.", params: [{ key: "n", label: "Jumlah node (n)", default: 8, min: 3, max: 40 }] },
  { id: "path", name: "Lintasan (P_n)", description: "Graf garis lurus panjang.", params: [{ key: "n", label: "Jumlah node (n)", default: 6, min: 2, max: 20 }] },
  { id: "wheel", name: "Graf Roda (W_n)", description: "Satu node pusat terhubung ke siklus luar.", params: [{ key: "n", label: "Jumlah node (n)", default: 6, min: 4, max: 30 }] },
  { id: "prism", name: "Graf Prisma", description: "Dua siklus konsentris yang saling terhubung (kerangka prisma).", params: [{ key: "n", label: "Sisi alas (n)", default: 5, min: 3, max: 20 }] },
  { id: "petersen", name: "Petersen Graph", description: "Graf kubik beraturan dengan 10 node (tanpa parameter).", params: [] },
  { id: "gen-petersen", name: "Generalized Petersen P(n,k)", description: "Generalisasi dari graf Petersen.", params: [{ key: "n", label: "Node lingkar luar (n)", default: 5, min: 3, max: 20 }, { key: "k", label: "Lompatan dalam (k)", default: 2, min: 1, max: 10 }] },
  { id: "circulant", name: "Circulant Graph C_n(a, b)", description: "Setiap node i terhubung ke i+a dan i+b.", params: [{ key: "n", label: "Jumlah node (n)", default: 12, min: 3, max: 40 }, { key: "a", label: "Lompatan 1 (a)", default: 1, min: 1, max: 20 }, { key: "b", label: "Lompatan 2 (b)", default: 2, min: 0, max: 20 }] },
  { id: "hypercube", name: "Hypercube (H_n)", description: "Proyeksi tesseract dimensi n.", params: [{ key: "n", label: "Dimensi (n)", default: 4, min: 1, max: 6 }] },
  { id: "grid", name: "Grid Graph G(m,n)", description: "Graf kotak dua dimensi.", params: [{ key: "m", label: "Baris (m)", default: 4, min: 1, max: 10 }, { key: "n", label: "Kolom (n)", default: 5, min: 1, max: 10 }] },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (graph: GeneratedGraph) => void;
}

export default function GraphGeneratorModal({ isOpen, onClose, onGenerate }: Props) {
  const [selectedId, setSelectedId] = useState<GeneratorId>("complete");
  const [paramVals, setParamVals] = useState<Record<string, number>>({});

  const currentMeta = GENERATORS.find((g) => g.id === selectedId)!;

  // Initialize params when switching graphs
  useEffect(() => {
    const p: Record<string, number> = {};
    currentMeta.params.forEach((param) => {
      p[param.key] = param.default;
    });
    setParamVals(p);
  }, [currentMeta]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    let result: GeneratedGraph;
    try {
      switch (selectedId) {
        case "complete":
          result = generateCompleteGraph(paramVals["n"]!);
          break;
        case "bipartite":
          result = generateBipartiteGraph(paramVals["m"]!, paramVals["n"]!);
          break;
        case "tree":
          result = generateTree(paramVals["n"]!);
          break;
        case "cycle":
          result = generateCycle(paramVals["n"]!);
          break;
        case "path":
          result = generatePath(paramVals["n"]!);
          break;
        case "wheel":
          result = generateWheel(paramVals["n"]!);
          break;
        case "prism":
          result = generatePrism(paramVals["n"]!);
          break;
        case "petersen":
          result = generatePetersen();
          break;
        case "gen-petersen":
          result = generateGeneralizedPetersen(paramVals["n"]!, paramVals["k"]!);
          break;
        case "circulant":
          result = generateCirculant(paramVals["n"]!, [paramVals["a"]!, paramVals["b"]!]);
          break;
        case "hypercube":
          result = generateHypercube(paramVals["n"]!);
          break;
        case "grid":
          result = generateGrid(paramVals["m"]!, paramVals["n"]!);
          break;
        default:
          return;
      }
      onGenerate(result);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal membuat graf: Parameter tidak valid");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div
        className="relative flex w-full max-w-2xl flex-col rounded-2xl shadow-2xl animate-fade-in"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-base)" }}>
              Special Graph
            </h2>
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              Pilih kelas graf dan sesuaikan parameternya.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:brightness-125"
            style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: List */}
          <div className="w-1/2 overflow-y-auto border-r p-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-col gap-1">
              {GENERATORS.map((g) => {
                const isActive = g.id === selectedId;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedId(g.id)}
                    className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all"
                    style={{
                      background: isActive ? "rgba(220,38,38,0.12)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(220,38,38,0.3)" : "transparent"}`,
                    }}
                  >
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: isActive ? "var(--primary-light)" : "var(--text-base)" }}
                    >
                      {g.name}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {g.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Params */}
          <div className="flex w-1/2 flex-col justify-between p-6">
            <div className="flex flex-col gap-5">
              <h3 className="text-base font-semibold text-white">{currentMeta.name}</h3>

              {currentMeta.params.length === 0 ? (
                <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                  Graf ini tidak memiliki parameter yang bisa diubah.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {currentMeta.params.map((p) => (
                    <div key={p.key} className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium" style={{ color: "var(--text-subtle)" }}>
                        {p.label} (Min: {p.min}, Max: {p.max})
                      </label>
                      <input
                        type="number"
                        min={p.min}
                        max={p.max}
                        value={paramVals[p.key] ?? p.default}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setParamVals((prev) => ({ ...prev, [p.key]: isNaN(val) ? p.default : val }));
                        }}
                        className="w-full rounded-md px-3 py-2 text-sm"
                        style={{
                          background: "var(--bg-raised)",
                          border: "1px solid var(--border)",
                          color: "var(--text-base)",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium transition-all hover:brightness-125"
                style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
              >
                Batal
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
              >
                Buat Graf
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
