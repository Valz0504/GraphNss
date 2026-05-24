import Image from "next/image";

const FEATURES = [
  {
    label: "Basic Graph",
    algorithms: ["DFS", "BFS", "Dijkstra", "Prim MST", "Kruskal MST", "Ford-Fulkerson", "Hungarian"],
    description: "Visualisasi interaktif algoritma graf klasik pada graf berbobot tak berarah maupun berarah.",
  },
  {
    label: "TSP Map",
    algorithms: ["Nearest Neighbour", "Christofides"],
    description: "Pemecahan Travelling Salesman Problem pada peta nyata dengan animasi rute step-by-step.",
  },
  {
    label: "Grid Island",
    algorithms: ["BFS Flood-fill"],
    description: "Deteksi pulau pada grid matriks biner dengan traversal BFS dan konsol output real-time.",
  },
  {
    label: "Timetabling",
    algorithms: ["DSATUR", "Welsh-Powell"],
    description: "Penjadwalan kuliah berbasis graph coloring — slot waktu dialokasikan tanpa konflik dosen atau semester.",
  },
] as const;

const TECH = ["Next.js 15", "TypeScript", "Tailwind CSS v4", "FastAPI", "Python 3.12", "Leaflet", "NetworkX"] as const;

const MEMBERS = [
  { name: "Emilio Justin", nim: "13524043", photo: "/emilio.jpeg" },
  { name: "Tria Sania Oktavia", nim: "10122036", photo: null },
] as const;

export default function AboutShell() {
  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg-base)" }}>
      <div className="mx-auto max-w-2xl px-6 py-14 flex flex-col gap-16">

        {/* ── Hero ── */}
        <section className="flex flex-col items-center gap-5 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-base)" }}>
              Graph<span style={{ color: "var(--primary-light)" }}>Nss</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: "var(--text-subtle)" }}>
              Visualisator algoritma teori graf interaktif. Dibuat sebagai proyek mata kuliah
              Teori Graf Algoritmik — setiap fitur menampilkan animasi step-by-step agar
              alur kerja algoritma mudah dipahami.
            </p>
          </div>

          {/* Tech badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {TECH.map((t) => (
              <span
                key={t}
                className="rounded-md px-2.5 py-1 text-[11px] font-medium"
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Features ── */}
        <section className="flex flex-col items-center gap-6">
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
              <div
                key={f.label}
                className="flex flex-col gap-3 rounded-xl p-5"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <span className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>
                  {f.label}
                </span>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-subtle)" }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── Team ── */}
        <section className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary-light)" }}>
              Tim Pengembang
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Proyek Teori Graf Algoritmik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {MEMBERS.map((m) => (
              <div
                key={m.nim}
                className="flex flex-col items-center gap-4 rounded-xl py-8 px-6"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Photo */}
                {m.photo ? (
                  <Image
                    src={m.photo}
                    alt={m.name}
                    width={112}
                    height={112}
                    className="rounded-full object-cover"
                    style={{ border: "2px solid var(--border-strong)" }}
                    unoptimized
                  />
                ) : (
                  <div
                    className="h-28 w-28 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background: "var(--bg-raised)",
                      border: "2px dashed var(--border-strong)",
                      color: "var(--text-muted)",
                    }}
                  >
                    foto
                  </div>
                )}
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>
                    {m.name}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {m.nim}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer note ── */}
        <p className="text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
          GraphNss v1.0 — Institut Teknologi Bandung
        </p>

      </div>
    </div>
  );
}
