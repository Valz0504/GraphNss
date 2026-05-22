"use client";

import { useState } from "react";
import ControlSidebar from "./ControlSidebar";
import ConsolePanel   from "./ConsolePanel";

/* ── Canvas placeholder — shared between shell and page ── */
function CanvasArea({ onOpenControls }: { onOpenControls?: () => void }) {
  return (
    <div
      className="bg-dot-grid relative flex flex-1 items-center justify-center overflow-hidden"
    >
      {/* Radial ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(220,38,38,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Placeholder content */}
      <div className="flex flex-col items-center gap-5 px-6 text-center animate-fade-in">
        {/* Graph SVG illustration */}
        <svg
          width="180"
          height="144"
          viewBox="0 0 200 160"
          fill="none"
          className="opacity-30"
          aria-hidden
        >
          <line x1="40"  y1="80"  x2="100" y2="30"  stroke="#dc2626" strokeWidth="1.5" />
          <line x1="40"  y1="80"  x2="100" y2="130" stroke="#dc2626" strokeWidth="1.5" />
          <line x1="100" y1="30"  x2="160" y2="80"  stroke="#dc2626" strokeWidth="1.5" />
          <line x1="100" y1="130" x2="160" y2="80"  stroke="#dc2626" strokeWidth="1.5" />
          <line x1="100" y1="30"  x2="100" y2="130" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx="40"  cy="80"  r="12" fill="#0e0707" stroke="#dc2626" strokeWidth="1.5" />
          <circle cx="100" cy="30"  r="12" fill="#0e0707" stroke="#dc2626" strokeWidth="1.5" />
          <circle cx="100" cy="130" r="12" fill="#0e0707" stroke="#f97316" strokeWidth="1.5" />
          <circle cx="160" cy="80"  r="12" fill="#0e0707" stroke="#dc2626" strokeWidth="1.5" />
          <text x="40"  y="84"  textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">1</text>
          <text x="100" y="34"  textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">2</text>
          <text x="100" y="134" textAnchor="middle" fill="#fb923c" fontSize="10" fontFamily="monospace">3</text>
          <text x="160" y="84"  textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">4</text>
        </svg>

        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium" style={{ color: "var(--text-subtle)" }}>
            Graph Canvas Visualization
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Input graf di panel kontrol, lalu klik{" "}
            <span style={{ color: "var(--primary-light)" }}>Simulasikan</span>
          </p>
        </div>

        {/* Mobile/Tablet: open controls button */}
        {onOpenControls && (
          <button
            type="button"
            onClick={onOpenControls}
            className="lg:hidden flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:brightness-110 active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(220,38,38,0.4)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            Buka Panel Kontrol
          </button>
        )}

        <span
          className="rounded px-2 py-0.5 text-[10px] font-mono"
          style={{
            background: "var(--bg-raised)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          [Graph Canvas Placeholder]
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BasicGraphShell — manages responsive sidebar
───────────────────────────────────────────── */
export default function BasicGraphShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* ── Main area: Canvas + Console ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CanvasArea onOpenControls={() => setDrawerOpen(true)} />
        <ConsolePanel />
      </main>

      {/* ── Desktop sidebar (lg+): always visible ── */}
      <div className="hidden lg:flex">
        <ControlSidebar />
      </div>

      {/* ── Mobile / Tablet (< lg): drawer overlay ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ top: "var(--navbar-h)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Slide-in panel from right */}
          <aside
            className="lg:hidden fixed inset-y-0 right-0 z-50 overflow-y-auto"
            style={{
              top: "var(--navbar-h)",
              width: "min(320px, 90vw)",
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border)",
              animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          >
            <ControlSidebar onClose={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Mobile/Tablet: floating toggle button (when drawer is closed) ── */}
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
            <line x1="3"  y1="6"  x2="21" y2="6"  />
            <line x1="3"  y1="12" x2="21" y2="12" />
            <line x1="3"  y1="18" x2="15" y2="18" />
          </svg>
          Kontrol
        </button>
      )}
    </div>
  );
}
