"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

import ConsolePanel from "@/components/basic-graph/ConsolePanel";
import type { ConsoleLine } from "@/components/basic-graph/types";
import { COUNTRY_DATA } from "@/lib/cityData";
import { solveTsp, type TspAlgorithm, type TspCity } from "@/lib/tspApi";
import type { AnimatedEdge } from "./TspLeafletMap";

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

  const selectStyle: React.CSSProperties = {
    background: "var(--bg-raised)",
    color:      "var(--text-base)",
    border:     "1px solid var(--border)",
    outline:    "none",
  };

  return (
    <div
      className="flex h-full flex-col overflow-y-auto"
      style={{ width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border)" }}
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
          <button onClick={onClose} className="text-lg leading-none" style={{ color: "var(--text-muted)" }}>✕</button>
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 py-4">

        {/* ── Algoritma ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Algoritma
          </p>
          {ALGORITHM_OPTIONS.map((opt) => {
            const active = algorithm === opt.id;
            return (
              <button
                key={opt.id}
                disabled={isBusy}
                onClick={() => onAlgorithmChange(opt.id)}
                className="rounded-lg px-3 py-2 text-left transition-all"
                style={{
                  background: active ? "rgba(220,38,38,0.14)" : "var(--bg-raised)",
                  border:     `1px solid ${active ? "rgba(220,38,38,0.40)" : "var(--border)"}`,
                  opacity:    isBusy ? 0.5 : 1,
                  cursor:     isBusy ? "not-allowed" : "pointer",
                }}
              >
                <p className="text-[12px] font-semibold" style={{ color: active ? "var(--primary-light)" : "var(--text-base)" }}>
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
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
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
              className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all"
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

          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Atau klik peta untuk tambah · klik marker untuk hapus
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Daftar Kota ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
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
                    className="shrink-0 mt-0.5 text-[11px] hover:brightness-150 transition-all"
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
          <button
            disabled={!canSolve}
            onClick={onSolve}
            className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all"
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
          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium hover:brightness-110"
              style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
            >
              Reset Rute
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 rounded-lg py-1.5 text-xs font-medium hover:brightness-110"
              style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
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
    { type: "muted", text: "Tambah kota dari dropdown atau klik peta, lalu tekan ⚡ Selesaikan TSP." },
  ]);
  const [isBusy,          setIsBusy]          = useState(false);
  const [drawerOpen,      setDrawerOpen]      = useState(false);

  /* dropdown */
  const [selectedCountryIdx, setSelectedCountryIdx] = useState(0);
  const [selectedRegionIdx,  setSelectedRegionIdx]  = useState(0);
  const [selectedCityIdx,    setSelectedCityIdx]    = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  /* ── Dropdown: add from list ── */
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
  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function handleReset() {
    clearTimers();
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

    clearTimers();
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

      res.steps.forEach((step, i) => {
        const t = setTimeout(() => {
          const from = cityMap[step.from_city];
          const to   = cityMap[step.to_city];
          if (!from || !to) return;

          setAnimatedEdges((prev) => [...prev, { from, to }]);
          setActiveCityIds(new Set([step.from_city, step.to_city]));
          setLines((prev) => [
            ...prev,
            {
              type: "output",
              text: `${from.name} → ${to.name}   +${step.distance_added.toFixed(2)} km   (Σ ${step.cumulative_distance.toFixed(2)} km)`,
            },
          ]);

          if (i === res.steps.length - 1) {
            const routeNames = [...res.tour.map((id) => cityMap[id]?.name ?? id), cityMap[res.tour[0]]?.name ?? ""];
            setActiveCityIds(new Set());
            setTotalDistance(res.total_distance);
            setLines((prev) => [
              ...prev,
              { type: "muted", text: "─────────────────────────────" },
              { type: "info",  text: `Rute: ${routeNames.join(" → ")}` },
              { type: "info",  text: `Total jarak: ${res.total_distance.toFixed(2)} km` },
            ]);
            setIsBusy(false);
          }
        }, i * 550);
        timersRef.current.push(t);
      });
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
    onAlgorithmChange: setAlgorithm,
    onAddFromDropdown: handleAddFromDropdown,
    onCountryChange:   handleCountryChange,
    onRegionChange:    handleRegionChange,
    onCityChange:      setSelectedCityIdx,
    onRenameCity:      handleRenameCity,
    onRemoveCity:      handleDeleteCity,
    onSolve:           handleSolve,
    onReset:           handleReset,
    onClearAll:        handleClearAll,
  };

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* ── Main: Map + Console ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Map area */}
        <div className="relative flex-1 overflow-hidden">

          {/* Empty-state overlay */}
          {cities.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-400 flex items-center justify-center">
              <div
                className="rounded-xl px-6 py-4 text-center"
                style={{ background: "rgba(14,7,7,0.72)", border: "1px solid var(--border)", backdropFilter: "blur(8px)" }}
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
              style={{ background: "rgba(14,7,7,0.88)", border: "1px solid rgba(220,38,38,0.4)", backdropFilter: "blur(8px)" }}
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
      </main>

      {/* ── Desktop sidebar (right, always visible lg+) ── */}
      <div className="hidden lg:flex">
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

      {/* ── Mobile toggle button ── */}
      {!drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
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
  );
}
