"use client";

import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/workspace" },
      { label: "New Architecture", href: "/workspace/generate?new=1" },
      { label: "Projects", href: "/workspace/projects" },
      { label: "History", href: "/workspace/history" },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Studio Canvas", href: "/workspace/generate" },
      { label: "UML Generator", href: "/workspace/uml" },
      { label: "Template Library", href: "/workspace/templates" },
      { label: "AI Research", href: "/workspace/research" },
    ],
  },
  {
    title: "Info",
    items: [
      { label: "Settings", href: "/workspace/settings" },
      {
        label: "GitHub",
        href: "https://github.com/Aditya-Vardh/ASE-2420090094",
        external: true,
      },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer
      className="border-t bg-[var(--background)]"
      style={{ borderColor: "rgba(242,239,232,0.08)" }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Main grid */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="sm:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border"
                style={{ borderColor: "rgba(var(--accent-rgb,214,173,105),0.30)", background: "#101216" }}>
                <Image
                  src="/icon.svg"
                  alt="Arqin AI"
                  width={20}
                  height={20}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[15px] font-bold leading-tight text-[var(--text-primary)]">
                  Arqin <span className="text-[var(--accent)]">AI</span>
                </span>
                <span
                  className="font-sans text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: "#8B949E" }}
                >
                  Architecture Engine
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed"
              style={{ color: "#8B949E" }}>
              Turn system descriptions into exportable UML diagrams, microservice
              maps, and architectural specifications.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <p
                className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#8B949E" }}
              >
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    {"external" in item && item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-sm transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D6AD69]"
                        style={{ color: "#8B949E" }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="font-sans text-sm transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D6AD69]"
                        style={{ color: "#8B949E" }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col items-start justify-between gap-4 border-t py-6 sm:flex-row sm:items-center"
          style={{ borderColor: "rgba(242,239,232,0.08)" }}
        >
          <p className="font-sans text-xs tracking-[0.10em] uppercase"
            style={{ color: "#8B949E" }}>
            &copy; {new Date().getFullYear()} Arqin AI &middot; Built by Aditya Vardhan
          </p>
          <div
            className="flex items-center gap-2 font-sans text-xs"
            style={{ color: "#8B949E" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#65A884]"
              aria-hidden="true"
            />
            Architecture engine ready
          </div>
        </div>
      </div>
    </footer>
  );
}
