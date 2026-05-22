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
        className="glass fixed inset-x-0 top-0 z-50 flex items-center px-4 md:px-6"
        style={{ height: "var(--navbar-h)", borderBottom: "1px solid var(--border)" }}
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
          <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-base)" }}>
            Graph<span style={{ color: "var(--primary-light)" }}>Nss</span>
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
                  background: isActive ? "rgba(220,38,38,0.14)" : "transparent",
                  color: isActive ? "var(--primary-light)" : "var(--text-subtle)",
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
            style={{ color: "var(--text-muted)", background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            v0.1.0
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
              background: mobileOpen ? "rgba(220,38,38,0.14)" : "transparent",
              border: "1px solid var(--border)",
            }}
          >
            {/* Hamburger / X icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--text-subtle)" strokeWidth="1.8" strokeLinecap="round">
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
            style={{ top: "var(--navbar-h)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu panel */}
          <nav
            className="md:hidden fixed inset-x-0 z-40 flex flex-col gap-1 px-4 py-3"
            style={{
              top: "var(--navbar-h)",
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border)",
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
                    background: isActive ? "rgba(220,38,38,0.14)" : "transparent",
                    color: isActive ? "var(--primary-light)" : "var(--text-subtle)",
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
