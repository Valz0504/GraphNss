import type { Metadata } from "next";

export const metadata: Metadata = { title: "TSP Map" };

export default function TspMapPage() {
  return (
    <div className="flex h-full items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)" }}
        >
          🗺️
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-base)" }}>TSP Map</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Tugas 5 — Coming soon</p>
        </div>
        <p className="max-w-xs text-sm" style={{ color: "var(--text-subtle)" }}>
          Travelling Salesman Problem visualizer akan tersedia di sini.
        </p>
      </div>
    </div>
  );
}
