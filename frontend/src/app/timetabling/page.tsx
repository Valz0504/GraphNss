import type { Metadata } from "next";

export const metadata: Metadata = { title: "Timetabling" };

export default function TimetablingPage() {
  return (
    <div className="flex h-full items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          📅
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-base)" }}>Timetabling</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Tugas 7 — Coming soon</p>
        </div>
        <p className="max-w-xs text-sm" style={{ color: "var(--text-subtle)" }}>
          Graph coloring untuk penjadwalan ujian akan tersedia di sini.
        </p>
      </div>
    </div>
  );
}
