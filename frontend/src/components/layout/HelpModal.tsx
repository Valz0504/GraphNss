"use client";

export interface HelpSection {
  title: string;
  items: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  sections: HelpSection[];
}

export default function HelpModal({ isOpen, onClose, pageTitle, sections }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div
        className="relative flex w-full max-w-lg flex-col rounded-2xl shadow-2xl animate-fade-in"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)", color: "var(--primary-light)" }}
            >
              ?
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text-base)" }}>Cara Pakai</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{pageTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:brightness-125"
            style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--primary-light)" }}
              >
                {section.title}
              </p>
              <ul className="flex flex-col gap-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--text-muted)" }}
                    />
                    <span className="text-[13px] leading-relaxed" style={{ color: "var(--text-subtle)" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-5 py-3 flex justify-end"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:brightness-125"
            style={{ background: "var(--bg-raised)", color: "var(--text-subtle)", border: "1px solid var(--border)" }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
