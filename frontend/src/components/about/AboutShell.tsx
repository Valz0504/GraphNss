"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const FEATURES = [
  {
    label: "Basic Graph",
    icon: "⬡",
    href: "/basic-graph",
    color: { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.3)", text: "#f87171", glow: "rgba(220,38,38,0.15)" },
    algorithms: ["DFS", "BFS", "Dijkstra", "Prim MST", "Kruskal MST", "Ford-Fulkerson", "Hungarian"],
    description: "Visualisasi interaktif algoritma graf klasik pada graf berbobot tak berarah maupun berarah.",
  },
  {
    label: "TSP Map",
    icon: "🗺",
    href: "/tsp-map",
    color: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", text: "#60a5fa", glow: "rgba(59,130,246,0.15)" },
    algorithms: ["Nearest Neighbour", "2-Opt", "Held-Karp"],
    description: "Pemecahan Travelling Salesman Problem pada peta nyata dengan animasi rute step-by-step.",
  },
  {
    label: "Grid Island",
    icon: "▦",
    href: "/grid-island",
    color: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.3)", text: "#4ade80", glow: "rgba(34,197,94,0.15)" },
    algorithms: ["BFS Flood-fill", "DFS Flood-fill"],
    description: "Deteksi pulau pada grid matriks biner dengan traversal BFS dan konsol output real-time.",
  },
  {
    label: "Timetabling",
    icon: "▤",
    href: "/timetabling",
    color: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", text: "#fbbf24", glow: "rgba(245,158,11,0.15)" },
    algorithms: ["DSATUR", "Welsh-Powell"],
    description: "Penjadwalan kuliah berbasis graph coloring — slot waktu dialokasikan tanpa konflik dosen atau semester.",
  },
] as const;

const TECH = [
  { label: "Next.js 15",    color: "rgba(255,255,255,0.08)" },
  { label: "TypeScript",    color: "rgba(59,130,246,0.12)"  },
  { label: "Tailwind CSS v4", color: "rgba(14,165,233,0.1)" },
  { label: "FastAPI",       color: "rgba(5,150,105,0.12)"   },
  { label: "Python 3.12",   color: "rgba(234,179,8,0.12)"   },
  { label: "Leaflet",       color: "rgba(34,197,94,0.1)"    },
  { label: "NetworkX",      color: "rgba(168,85,247,0.1)"   },
] as const;

const MEMBERS = [
  { name: "Emilio Justin",      nim: "13524043", photo: "/emilio.webp", role: "Full-stack Dev" },
  { name: "Tria Sania Oktavia", nim: "10122036", photo: "/tria.webp",   role: "Graph Algorithm Dev" },
] as const;

function LogoImage() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-16 w-16 rounded-2xl"
      style={{ boxShadow: "0 0 32px rgba(220,38,38,0.18)" }}>
      {/* Skeleton shown until image loads */}
      {!loaded && (
        <div className="absolute inset-0 rounded-2xl animate-pulse-soft"
          style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)" }} />
      )}
      <Image
        src="/logo.webp"
        alt="GraphNss logo"
        width={64}
        height={64}
        priority
        unoptimized
        onLoad={() => setLoaded(true)}
        className="rounded-2xl transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}

export default function AboutShell() {
  return (
    <div className="bg-dot-grid relative h-full overflow-y-auto" style={{ background: "var(--bg-base)" }}>

      {/* Radial ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(220,38,38,0.07) 0%, transparent 65%)" }} />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-14 flex flex-col gap-16">

        {/* ── Hero ── */}
        <section className="animate-fade-in flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <LogoImage />

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-base)" }}>
              Graph<span style={{ color: "var(--primary-light)" }}>Nss</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: "var(--text-subtle)" }}>
              Visualisator algoritma teori graf interaktif. Dibuat sebagai proyek mata kuliah
              Teori Graf Algoritmik.
            </p>
          </div>

          {/* Tech badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {TECH.map((t) => (
              <span key={t.label}
                className="rounded-md px-2.5 py-1 text-[11px] font-medium transition-all hover:brightness-125"
                style={{ background: t.color, border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {t.label}
              </span>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Features ── */}
        <section className="animate-fade-in flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary-light)" }}>
              Fitur
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Empat modul visualisasi dengan algoritma berbeda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {FEATURES.map((f) => (
              <Link key={f.label} href={f.href}
                className="group flex flex-col gap-3 rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}>
                {/* Card header */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all group-hover:scale-110"
                    style={{ background: f.color.bg, border: `1px solid ${f.color.border}`, boxShadow: `0 0 12px ${f.color.glow}` }}>
                    <span className="text-sm" style={{ color: f.color.text }}>{f.icon}</span>
                  </div>
                  <span className="text-sm font-semibold transition-colors" style={{ color: "var(--text-base)" }}>
                    {f.label}
                  </span>
                  <svg className="ml-auto opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: f.color.text }} aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-subtle)" }}>
                  {f.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Team ── */}
        <section className="animate-fade-in flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary-light)" }}>
              Team
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Proyek Teori Graf Algoritmik — Institut Teknologi Bandung
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {MEMBERS.map((m) => (
              <div key={m.nim}
                className="group relative flex flex-col items-center gap-4 rounded-xl py-8 px-6 transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(220,38,38,0.3), 0 0 24px rgba(220,38,38,0.08)" }} />

                {/* Photo */}
                {m.photo ? (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ background: "rgba(220,38,38,0.15)", filter: "blur(8px)" }} />
                    <Image src={m.photo} alt={m.name} width={112} height={112}
                      className="relative rounded-full object-cover transition-all group-hover:scale-105"
                      style={{ border: "2px solid var(--border-strong)" }}
                      unoptimized />
                  </div>
                ) : (
                  <div className="h-28 w-28 rounded-full flex items-center justify-center text-xs"
                    style={{ background: "var(--bg-raised)", border: "2px dashed var(--border-strong)", color: "var(--text-muted)" }}>
                    foto
                  </div>
                )}

                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>{m.name}</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--primary-light)" }}>
                    {m.role}
                  </span>
                  <span className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{m.nim}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer note ── */}
        <p className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
          GraphNss v1.1 — Institut Teknologi Bandung
        </p>

      </div>
    </div>
  );
}
