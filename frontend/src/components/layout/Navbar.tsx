"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/basic-graph", label: "Basic Graph"  },
  { href: "/tsp-map",     label: "TSP Map"      },
  { href: "/grid-island", label: "Grid Island"  },
  { href: "/timetabling", label: "Timetabling"  },
  { href: "/about",       label: "About"        },
] as const;

export default function Navbar() {
  const pathname        = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="relative shrink-0 z-50 flex items-center px-4 md:px-6"
        style={{ height: "var(--navbar-h)", background: "#111827", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* ── Logo ── */}
        <Link href="/basic-graph" className="flex shrink-0 items-center gap-2.5 w-36 md:w-44">
          <Image
            src="/logo.png"
            alt="GraphNss Logo"
            width={28}
            height={28}
            className="rounded-md"
            priority
            unoptimized
          />
          <span className="text-sm font-bold tracking-tight" style={{ color: "#f9fafb" }}>
            Graph<span style={{ color: "#f87171" }}>Nss</span>
          </span>
        </Link>

        {/* ── Desktop / Tablet nav (md+) ── */}
        <nav className="hidden md:flex flex-1 justify-center gap-0.5">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-150"
                style={{
                  background: isActive ? "rgba(248,113,113,0.15)" : "transparent",
                  color: isActive ? "#f87171" : "rgba(255,255,255,0.6)",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: version (desktop only) ── */}
        <div className="hidden md:flex w-44 justify-end">
          <span
            className="rounded px-2 py-0.5 text-[11px] font-medium"
            style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            v1.0
          </span>
        </div>

        {/* ── Mobile: spacer + hamburger ── */}
        <div className="flex md:hidden flex-1 justify-end">
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            style={{
              background: mobileOpen ? "rgba(248,113,113,0.15)" : "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="3" y1="3" x2="15" y2="15" />
                  <line x1="15" y1="3" x2="3" y2="15" />
                </>
              ) : (
                <>
                  <line x1="2" y1="5"  x2="16" y2="5"  />
                  <line x1="2" y1="9"  x2="16" y2="9"  />
                  <line x1="2" y1="13" x2="16" y2="13" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* ── Mobile dropdown menu ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ top: "var(--navbar-h)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu panel */}
          <nav
            className="md:hidden fixed inset-x-0 z-40 flex flex-col gap-1 px-4 py-3"
            style={{
              top: "var(--navbar-h)",
              background: "#1f2937",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: isActive ? "rgba(248,113,113,0.15)" : "transparent",
                    color: isActive ? "#f87171" : "rgba(255,255,255,0.65)",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </>
  );
}
