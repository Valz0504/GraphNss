"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import ConsolePanel from "@/components/basic-graph/ConsolePanel";
import type { ConsoleLine } from "@/components/basic-graph/types";
import { COUNTRY_DATA, INDONESIA_ISLANDS } from "@/lib/cityData";
import { solveTsp, type TspAlgorithm, type TspCity } from "@/lib/tspApi";
import type { AnimatedEdge } from "./TspLeafletMap";
import HelpModal from "@/components/layout/HelpModal";
import type { HelpSection } from "@/components/layout/HelpModal";

const HELP_SECTIONS: HelpSection[] = [
  {
    title: "Tambah Kota Satu per Satu",
    items: [
      "Pilih Negara → Provinsi → Kota dari dropdown, lalu klik + Tambah untuk menambahkan ke peta.",
      "Klik tombol + Tambah Semua (N kota) untuk langsung memasukkan seluruh kota di provinsi yang dipilih.",
      "Atau klik langsung di mana saja pada peta untuk menambah titik dengan koordinat tersebut.",
      "Klik marker kota di peta untuk menghapusnya.",
    ],
  },
  {
    title: "Tambah per Wilayah",
    items: [
      "Di section Tambah per Wilayah, pilih negara lalu klik + Tambah Semua untuk memuat semua kota negara tersebut sekaligus.",
      "Khusus Indonesia: muncul tombol per pulau (Sumatera, Jawa, Kalimantan, dll.) — klik pulau mana saja untuk memuat seluruh kotanya.",
      "Kota yang sudah ada di peta otomatis dilewati (tidak duplikat).",
    ],
  },
  {
    title: "Pilih Algoritma",
    items: [
      "Nearest Neighbor: greedy, cepat, cocok untuk banyak kota.",
      "2-Opt: perbaikan dari Nearest Neighbor, rute lebih optimal.",
      "Held-Karp: solusi eksak (optimal), tapi dibatasi maksimal 15 kota karena kompleksitas eksponensial.",
    ],
  },
  {
    title: "Selesaikan TSP",
    items: [
      "Tekan Selesaikan TSP untuk menghitung rute terpendek.",
      "Seluruh rute langsung ditampilkan di peta sekaligus beserta detail tiap langkah di konsol bawah.",
      "Total jarak rute (km) ditampilkan di pojok kanan atas peta.",
      "Tekan Reset Rute untuk menghapus rute, atau Hapus Semua untuk mulai ulang dari nol.",
    ],
  },
];

const TspLeafletMap = dynamic(() => import("./TspLeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: "#e8e8e8", color: "#666" }}>
      Memuat peta…
    </div>
  ),
});

/* ── Haversine (km) — duplicate detection ── */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function isDuplicate(cities: TspCity[], lat: number, lng: number, name?: string) {
  return cities.some((c) => {
    if (name && c.name.trim().toLowerCase() === name.trim().toLowerCase()) return true;
    return haversineKm(c.lat, c.lng, lat, lng) < 1;
  });
}

const ALGORITHM_OPTIONS: { id: TspAlgorithm; label: string; desc: string }[] = [
  { id: "nearest-neighbor", label: "Nearest Neighbor", desc: "Greedy heuristic — O(n²)" },
  { id: "two-opt",          label: "2-Opt",            desc: "NN + improvement" },
  { id: "held-karp",        label: "Held-Karp (Exact)", desc: "DP exact — maks 15 kota" },
];

let cityCounter = 0;

/* ═══════════════════════════════════════════════
   Sidebar — used for both desktop & mobile drawer
═══════════════════════════════════════════════ */
function TspControlSidebar({
  cities,
  algorithm,
  isBusy,
  canSolve,
  selectedCountryIdx,
  selectedRegionIdx,
  selectedCityIdx,
  onAlgorithmChange,
  onAddFromDropdown,
  onAddAllFromRegion,
  onAddBulk,
  onCountryChange,
  onRegionChange,
  onCityChange,
  onRenameCity,
  onRemoveCity,
  onSolve,
  onReset,
  onClearAll,
  onClose,
}: {
  cities: TspCity[];
  algorithm: TspAlgorithm;
  isBusy: boolean;
  canSolve: boolean;
  selectedCountryIdx: number;
  selectedRegionIdx: number;
  selectedCityIdx: number;
  onAlgorithmChange: (a: TspAlgorithm) => void;
  onAddFromDropdown: () => void;
  onAddAllFromRegion: () => void;
  onAddBulk: (countryIdx: number, regionNames?: string[]) => void;
  onCountryChange: (idx: number) => void;
  onRegionChange: (idx: number) => void;
  onCityChange: (idx: number) => void;
  onRenameCity: (id: string, name: string) => void;
  onRemoveCity: (id: string) => void;
  onSolve: () => void;
  onReset: () => void;
  onClearAll: () => void;
  onClose?: () => void;
}) {
  const country = COUNTRY_DATA[selectedCountryIdx];
  const region  = country.regions[selectedRegionIdx];

  const [bulkCountryIdx, setBulkCountryIdx] = useState(0);
  const bulkCountry   = COUNTRY_DATA[bulkCountryIdx];
  const bulkIsIndo    = bulkCountry.name === "Indonesia";
  const bulkTotalCities = bulkCountry.regions.reduce((s, r) => s + r.cities.length, 0);

  const selectStyle: React.CSSProperties = {
    background: "var(--bg-raised)",
    color:      "var(--text-base)",
    border:     "1px solid var(--border)",
    outline:    "none",
  };

  return (
    <div
      className="flex h-full flex-col overflow-y-auto"
      style={{ width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border)", boxShadow: "-4px 0 24px rgba(0,0,0,0.06)" }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">🗺️</span>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-base)" }}>TSP Map</p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Travelling Salesman Problem</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-base leading-none transition-all hover:brightness-150 active:scale-90"
            style={{ color: "var(--text-muted)", background: "var(--bg-raised)", border: "1px solid var(--border)" }}>✕</button>
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 py-4">

        {/* ── Algoritma ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
            Algoritma
          </p>
          {ALGORITHM_OPTIONS.map((opt) => {
            const active = algorithm === opt.id;
            return (
              <button
                key={opt.id}
                disabled={isBusy}
                onClick={() => onAlgorithmChange(opt.id)}
                className="rounded-lg px-3 py-2 text-left transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: active ? "rgba(220,38,38,0.08)" : "var(--bg-raised)",
                  border:     `1px solid ${active ? "rgba(220,38,38,0.45)" : "var(--border-strong)"}`,
                  boxShadow:  active ? "0 1px 6px rgba(220,38,38,0.12)" : "none",
                  opacity:    isBusy ? 0.5 : 1,
                  cursor:     isBusy ? "not-allowed" : "pointer",
                }}
              >
                <p className="text-[12px] font-semibold" style={{ color: active ? "var(--primary)" : "var(--text-base)" }}>
                  {opt.label}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{opt.desc}</p>
              </button>
            );
          })}
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Tambah dari daftar ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
            Tambah dari Daftar
          </p>

          {/* Level 1: Negara */}
          <select
            disabled={isBusy}
            value={selectedCountryIdx}
            onChange={(e) => onCountryChange(Number(e.target.value))}
            className="w-full rounded-lg px-2 py-1.5 text-[12px]"
            style={selectStyle}
          >
            {COUNTRY_DATA.map((c, i) => (
              <option key={c.name} value={i}>{c.emoji} {c.name}</option>
            ))}
          </select>

          {/* Level 2: Provinsi / Wilayah */}
          <select
            disabled={isBusy}
            value={selectedRegionIdx}
            onChange={(e) => onRegionChange(Number(e.target.value))}
            className="w-full rounded-lg px-2 py-1.5 text-[12px]"
            style={selectStyle}
          >
            {country.regions.map((r, i) => (
              <option key={r.name} value={i}>{r.name}</option>
            ))}
          </select>

          {/* Level 3: Kota + tombol tambah */}
          <div className="flex gap-2">
            <select
              disabled={isBusy}
              value={selectedCityIdx}
              onChange={(e) => onCityChange(Number(e.target.value))}
              className="flex-1 min-w-0 rounded-lg px-2 py-1.5 text-[12px]"
              style={selectStyle}
            >
              {region.cities.map((city, i) => (
                <option key={city.name} value={i}>{city.name}</option>
              ))}
            </select>
            <button
              disabled={isBusy}
              onClick={onAddFromDropdown}
              className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:brightness-110 active:scale-[0.95]"
              style={{
                background: "rgba(220,38,38,0.15)",
                color:      "var(--primary-light)",
                border:     "1px solid rgba(220,38,38,0.3)",
                opacity:    isBusy ? 0.5 : 1,
                cursor:     isBusy ? "not-allowed" : "pointer",
              }}
            >
              + Tambah
            </button>
          </div>

          {/* Tambah semua kota di provinsi ini */}
          <button
            disabled={isBusy}
            onClick={onAddAllFromRegion}
            className="w-full rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:brightness-110 active:scale-[0.95]"
            style={{
              background: "rgba(220,38,38,0.08)",
              color:      "var(--primary-light)",
              border:     "1px solid rgba(220,38,38,0.2)",
              opacity:    isBusy ? 0.5 : 1,
              cursor:     isBusy ? "not-allowed" : "pointer",
            }}
          >
            + Tambah Semua ({region.cities.length} kota)
          </button>

          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Atau klik peta untuk tambah · klik marker untuk hapus
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Tambah per Wilayah ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
            Tambah per Wilayah
          </p>

          {/* Pilih negara */}
          <select
            disabled={isBusy}
            value={bulkCountryIdx}
            onChange={(e) => setBulkCountryIdx(Number(e.target.value))}
            className="w-full rounded-lg px-2 py-1.5 text-[12px]"
            style={selectStyle}
          >
            {COUNTRY_DATA.map((c, i) => (
              <option key={c.name} value={i}>{c.emoji} {c.name}</option>
            ))}
          </select>

          {/* Indonesia: island group pills */}
          {bulkIsIndo && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Pilih pulau:</p>
              <div className="flex flex-wrap gap-1.5">
                {INDONESIA_ISLANDS.map((island) => {
                  const count = island.regionNames.reduce((s, rn) => {
                    const r = bulkCountry.regions.find((x) => x.name === rn);
                    return s + (r?.cities.length ?? 0);
                  }, 0);
                  return (
                    <button
                      key={island.name}
                      disabled={isBusy}
                      onClick={() => onAddBulk(bulkCountryIdx, island.regionNames)}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all hover:brightness-110 active:scale-[0.95]"
                      style={{
                        background: "rgba(220,38,38,0.08)",
                        color:      "var(--primary-light)",
                        border:     "1px solid rgba(220,38,38,0.2)",
                        opacity:    isBusy ? 0.5 : 1,
                        cursor:     isBusy ? "not-allowed" : "pointer",
                      }}
                    >
                      {island.emoji} {island.name} <span style={{ opacity: 0.65 }}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tambah semua negara */}
          <button
            disabled={isBusy}
            onClick={() => onAddBulk(bulkCountryIdx)}
            className="w-full rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:brightness-110 active:scale-[0.95]"
            style={{
              background: "linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.06))",
              color:      "var(--primary-light)",
              border:     "1px solid rgba(220,38,38,0.3)",
              opacity:    isBusy ? 0.5 : 1,
              cursor:     isBusy ? "not-allowed" : "pointer",
            }}
          >
            + Tambah Semua ({bulkTotalCities} kota)
          </button>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Daftar Kota ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
            Daftar Kota ({cities.length})
          </p>

          {cities.length === 0 ? (
            <p className="text-[12px] italic" style={{ color: "var(--text-muted)" }}>Belum ada kota.</p>
          ) : (
            <div className="flex flex-col gap-1" style={{ maxHeight: 240, overflowY: "auto" }}>
              {cities.map((city, idx) => (
                <div
                  key={city.id}
                  className="flex items-start gap-2 rounded-lg px-2 py-2"
                  style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5"
                    style={{ background: "var(--primary)", color: "#fff" }}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <input
                      value={city.name}
                      disabled={isBusy}
                      onChange={(e) => onRenameCity(city.id, e.target.value)}
                      className="w-full bg-transparent text-[12px] font-medium outline-none"
                      style={{ color: "var(--text-base)", border: "none", padding: 0 }}
                    />
                    <p className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                    </p>
                  </div>
                  <button
                    disabled={isBusy}
                    onClick={() => onRemoveCity(city.id)}
                    className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded text-[10px] transition-all hover:bg-red-500/20 hover:text-red-400 active:scale-90"
                    style={{ color: "var(--text-muted)", opacity: isBusy ? 0.4 : 1 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Controls ── */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            {canSolve && !isBusy && (
              <span className="pointer-events-none absolute inset-0 rounded-lg animate-pulse-soft"
                style={{ boxShadow: "0 0 0 3px rgba(220,38,38,0.25)" }} />
            )}
            <button
              disabled={!canSolve}
              onClick={onSolve}
              className="relative w-full rounded-lg py-2.5 text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: canSolve
                  ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
                  : "var(--bg-overlay)",
                color:      canSolve ? "#fff" : "var(--text-muted)",
                cursor:     canSolve ? "pointer" : "not-allowed",
                boxShadow:  canSolve ? "0 4px 14px rgba(220,38,38,0.4)" : "none",
              }}
            >
              {isBusy ? "Menjalankan…" : "Selesaikan TSP"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: "var(--bg-raised)", color: "var(--text-base)", border: "1px solid var(--border-strong)" }}
            >
              Reset Rute
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: "var(--bg-raised)", color: "var(--text-base)", border: "1px solid var(--border-strong)" }}
            >
              Hapus Semua
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Shell
═══════════════════════════════════════════════ */
export default function TspMapShell() {
  const [cities,          setCities]          = useState<TspCity[]>([]);
  const [algorithm,       setAlgorithm]       = useState<TspAlgorithm>("nearest-neighbor");
  const [animatedEdges,   setAnimatedEdges]   = useState<AnimatedEdge[]>([]);
  const [activeCityIds,   setActiveCityIds]   = useState<Set<string>>(new Set());
  const [totalDistance,   setTotalDistance]   = useState<number | null>(null);
  const [lines,           setLines]           = useState<ConsoleLine[]>([
    { type: "info",  text: "TSP Map siap." },
    { type: "muted", text: "Tambah kota dari dropdown atau klik peta, lalu tekan Selesaikan TSP." },
  ]);
  const [isBusy,          setIsBusy]          = useState(false);
  const [drawerOpen,      setDrawerOpen]      = useState(false);
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [helpOpen,       setHelpOpen]       = useState(false);

  /* dropdown */
  const [selectedCountryIdx, setSelectedCountryIdx] = useState(0);
  const [selectedRegionIdx,  setSelectedRegionIdx]  = useState(0);
  const [selectedCityIdx,    setSelectedCityIdx]    = useState(0);

  function appendLine(line: ConsoleLine) {
    setLines((prev) => [...prev, line]);
  }

  /* ── Map click → add city ── */
  function handleMapClick(lat: number, lng: number) {
    if (isBusy) return;
    if (isDuplicate(cities, lat, lng)) {
      appendLine({ type: "error", text: "Kota dengan lokasi serupa sudah ada." });
      return;
    }
    cityCounter += 1;
    setCities((prev) => [...prev, { id: `city-${cityCounter}`, name: `Kota ${cityCounter}`, lat, lng }]);
  }

  /* ── Delete city (click marker, right-click, or sidebar ✕) ── */
  function handleDeleteCity(cityId: string) {
    if (isBusy) return;
    setCities((prev) => prev.filter((c) => c.id !== cityId));
    setAnimatedEdges((prev) => prev.filter((e) => e.from.id !== cityId && e.to.id !== cityId));
  }

  function handleRenameCity(cityId: string, newName: string) {
    setCities((prev) => prev.map((c) => (c.id === cityId ? { ...c, name: newName } : c)));
  }

  /* ── Dropdown: add single city ── */
  function handleAddFromDropdown() {
    if (isBusy) return;
    const city = COUNTRY_DATA[selectedCountryIdx].regions[selectedRegionIdx].cities[selectedCityIdx];
    if (isDuplicate(cities, city.lat, city.lng, city.name)) {
      appendLine({ type: "error", text: `"${city.name}" sudah ada di daftar.` });
      return;
    }
    cityCounter += 1;
    setCities((prev) => [...prev, { id: `city-${cityCounter}`, name: city.name, lat: city.lat, lng: city.lng }]);
  }

  /* ── Bulk-add: all cities in a country (or filtered by island regionNames) ── */
  function handleAddBulk(countryIdx: number, regionNames?: string[]) {
    if (isBusy) return;
    const country = COUNTRY_DATA[countryIdx];
    const regions = regionNames
      ? country.regions.filter((r) => regionNames.includes(r.name))
      : country.regions;
    const newCities: TspCity[] = [];
    setCities((prev) => {
      const merged = [...prev];
      for (const region of regions) {
        for (const city of region.cities) {
          if (!isDuplicate([...merged, ...newCities], city.lat, city.lng, city.name)) {
            cityCounter += 1;
            newCities.push({ id: `city-${cityCounter}`, name: city.name, lat: city.lat, lng: city.lng });
          }
        }
      }
      return [...merged, ...newCities];
    });
    setTimeout(() => {
      const label = regionNames
        ? INDONESIA_ISLANDS.find((g) => g.regionNames === regionNames)?.name ?? "wilayah terpilih"
        : country.name;
      if (newCities.length === 0) {
        appendLine({ type: "error", text: `Semua kota dari ${label} sudah ada.` });
      } else {
        appendLine({ type: "info", text: `Ditambahkan ${newCities.length} kota dari ${label}.` });
      }
    }, 0);
  }

  /* ── Dropdown: add ALL cities in selected region ── */
  function handleAddAllFromRegion() {
    if (isBusy) return;
    const region = COUNTRY_DATA[selectedCountryIdx].regions[selectedRegionIdx];
    const newCities: TspCity[] = [];
    setCities((prev) => {
      const merged = [...prev];
      for (const city of region.cities) {
        if (!isDuplicate([...merged, ...newCities], city.lat, city.lng, city.name)) {
          cityCounter += 1;
          newCities.push({ id: `city-${cityCounter}`, name: city.name, lat: city.lat, lng: city.lng });
        }
      }
      return [...merged, ...newCities];
    });
    // log after state update via a microtask so count is accurate
    setTimeout(() => {
      if (newCities.length === 0) {
        appendLine({ type: "error", text: `Semua kota di ${region.name} sudah ditambahkan.` });
      } else {
        appendLine({ type: "info", text: `Ditambahkan ${newCities.length} kota dari ${region.name}.` });
      }
    }, 0);
  }

  function handleCountryChange(idx: number) {
    setSelectedCountryIdx(idx);
    setSelectedRegionIdx(0);
    setSelectedCityIdx(0);
  }

  function handleRegionChange(idx: number) {
    setSelectedRegionIdx(idx);
    setSelectedCityIdx(0);
  }

  /* ── Reset / clear ── */
  function handleReset() {
    setIsBusy(false);
    setAnimatedEdges([]);
    setActiveCityIds(new Set());
    setTotalDistance(null);
    setLines([{ type: "muted", text: "Rute direset." }]);
  }

  function handleClearAll() {
    handleReset();
    setCities([]);
    cityCounter = 0;
    setLines([{ type: "muted", text: "Semua kota dihapus." }]);
  }

  /* ── Solve ── */
  async function handleSolve() {
    if (cities.length < 2 || isBusy) return;
    if (algorithm === "held-karp" && cities.length > 15) {
      appendLine({ type: "error", text: "Held-Karp maksimal 15 kota." });
      return;
    }

    setAnimatedEdges([]);
    setActiveCityIds(new Set());
    setTotalDistance(null);
    setIsBusy(true);

    const algoLabel = ALGORITHM_OPTIONS.find((a) => a.id === algorithm)?.label ?? algorithm;
    setLines([
      { type: "info",  text: `Algoritma : ${algoLabel}` },
      { type: "muted", text: `Jumlah kota : ${cities.length}` },
      { type: "muted", text: "─────────────────────────────" },
    ]);

    try {
      const res = await solveTsp(cities, algorithm);
      const cityMap = Object.fromEntries(cities.map((c) => [c.id, c]));

      const edges: AnimatedEdge[] = res.steps
        .map((s) => ({ from: cityMap[s.from_city], to: cityMap[s.to_city] }))
        .filter((e) => e.from && e.to);

      const stepLines: ConsoleLine[] = res.steps
        .filter((s) => cityMap[s.from_city] && cityMap[s.to_city])
        .map((s) => ({
          type: "output",
          text: `${cityMap[s.from_city].name} → ${cityMap[s.to_city].name}   +${s.distance_added.toFixed(2)} km   (Σ ${s.cumulative_distance.toFixed(2)} km)`,
        }));

      const routeNames = [...res.tour.map((id) => cityMap[id]?.name ?? id), cityMap[res.tour[0]]?.name ?? ""];

      setAnimatedEdges(edges);
      setActiveCityIds(new Set());
      setTotalDistance(res.total_distance);
      setLines((prev) => [
        ...prev,
        ...stepLines,
        { type: "muted", text: "─────────────────────────────" },
        { type: "info",  text: `Rute: ${routeNames.join(" → ")}` },
        { type: "info",  text: `Total jarak: ${res.total_distance.toFixed(2)} km` },
      ]);
      setIsBusy(false);
    } catch (err) {
      appendLine({ type: "error", text: `Error: ${String(err)}` });
      setIsBusy(false);
    }
  }

  const canSolve = cities.length >= 2 && !isBusy;

  const sidebarProps = {
    cities,
    algorithm,
    isBusy,
    canSolve,
    selectedCountryIdx,
    selectedRegionIdx,
    selectedCityIdx,
    onAlgorithmChange:  setAlgorithm,
    onAddFromDropdown:  handleAddFromDropdown,
    onAddAllFromRegion: handleAddAllFromRegion,
    onAddBulk:          handleAddBulk,
    onCountryChange:    handleCountryChange,
    onRegionChange:     handleRegionChange,
    onCityChange:       setSelectedCityIdx,
    onRenameCity:       handleRenameCity,
    onRemoveCity:       handleDeleteCity,
    onSolve:            handleSolve,
    onReset:            handleReset,
    onClearAll:         handleClearAll,
  };

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* ── Main: Map + Console ── */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Map area — z-0 creates a stacking context so Leaflet panes (z:200–1000) are contained */}
        <div className="relative z-0 flex-1 overflow-hidden">

          {/* Empty-state overlay */}
          {cities.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-400 flex items-center justify-center">
              <div
                className="rounded-xl px-6 py-4 text-center"
                style={{ background: "rgba(255,255,255,0.88)", border: "1px solid var(--border)", backdropFilter: "blur(8px)" }}
              >
                <p className="text-2xl mb-1">🗺️</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>Klik di peta untuk menambah kota</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  atau pilih dari dropdown · klik marker untuk hapus
                </p>
              </div>
            </div>
          )}

          {/* Total distance badge */}
          {totalDistance !== null && (
            <div
              className="absolute top-3 right-3 z-400 rounded-xl px-4 py-2 shadow-lg"
              style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(220,38,38,0.3)", backdropFilter: "blur(8px)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Total Jarak</p>
              <p className="text-xl font-bold" style={{ color: "var(--primary-light)" }}>{totalDistance.toFixed(2)} km</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {cities.length} kota · {ALGORITHM_OPTIONS.find((a) => a.id === algorithm)?.label}
              </p>
            </div>
          )}

          <TspLeafletMap
            cities={cities}
            animatedEdges={animatedEdges}
            activeCityIds={activeCityIds}
            onMapClick={handleMapClick}
            onCityDelete={handleDeleteCity}
            disabled={isBusy}
          />
        </div>

        {/* Console (same style as basic-graph) */}
        <ConsolePanel lines={lines} />

        {/* Desktop right-edge button group: toggle + help */}
        <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 flex-col gap-1">
          <button
            type="button"
            onClick={() => setSidebarOpen((p) => !p)}
            className="flex items-center justify-center rounded-l-lg transition-all hover:brightness-125 active:scale-95"
            title={sidebarOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
            style={{ width: 18, height: 44, background: "var(--bg-surface)", borderTop: "1px solid var(--border-strong)", borderBottom: "1px solid var(--border-strong)", borderLeft: "1px solid var(--border-strong)", color: "var(--text-muted)", boxShadow: "-2px 2px 8px rgba(0,0,0,0.12)" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen ? <polyline points="3,2 7,5 3,8" /> : <polyline points="7,2 3,5 7,8" />}
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex items-center justify-center rounded-l-lg transition-all hover:brightness-125 active:scale-95"
            title="Cara pakai"
            style={{ width: 18, height: 28, background: "var(--bg-surface)", borderTop: "1px solid var(--border-strong)", borderBottom: "1px solid var(--border-strong)", borderLeft: "1px solid var(--border-strong)", color: "var(--text-muted)", boxShadow: "-2px 2px 8px rgba(0,0,0,0.12)", fontSize: 10 }}
          >
            ?
          </button>
        </div>
      </main>

      {/* ── Desktop sidebar (right, collapsible lg+) ── */}
      <div
        className="hidden lg:flex overflow-hidden shrink-0"
        style={{
          maxWidth: sidebarOpen ? "320px" : "0px",
          transition: "max-width 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <TspControlSidebar {...sidebarProps} />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ top: "var(--navbar-h)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="lg:hidden fixed inset-y-0 right-0 z-50 overflow-y-auto"
            style={{ top: "var(--navbar-h)", width: "min(320px, 90vw)", animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) forwards" }}
          >
            <TspControlSidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Mobile/Tablet: floating button group ── */}
      <div className="lg:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-lg transition-all hover:brightness-110 active:scale-95"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", color: "var(--text-base)", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
        >
          ?
        </button>
        {!drawerOpen && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", boxShadow: "0 4px 20px rgba(220,38,38,0.5)" }}
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

      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        pageTitle="TSP Map"
        sections={HELP_SECTIONS}
      />
    </div>
  );
}
