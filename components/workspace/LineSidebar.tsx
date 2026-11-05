"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FolderOpen,
  History,
  LayoutTemplate,
  Search,
  Settings,
  Plus,
  X,
  Menu,
  Layers,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
};

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "CORE",
    items: [
      {
        href: "/workspace",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/workspace/generate?new=1",
        label: "New Architecture",
        icon: Plus,
        badge: "AI",
      },
      {
        href: "/workspace/projects",
        label: "Projects",
        icon: FolderOpen,
      },
      {
        href: "/workspace/history",
        label: "History",
        icon: History,
      },
    ],
  },
  {
    title: "DESIGN",
    items: [
      {
        href: "/workspace/generate",
        label: "Studio Canvas",
        icon: Layers,
      },
      {
        href: "/workspace/uml",
        label: "UML Generator",
        icon: GitBranch,
      },
      {
        href: "/workspace/templates",
        label: "Template Library",
        icon: LayoutTemplate,
      },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      {
        href: "/workspace/research",
        label: "AI Research",
        icon: Search,
      },
      {
        href: "/workspace/settings",
        label: "Settings",
        icon: Settings,
      },
    ],
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LineSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string, exact?: boolean) {
    const [base, queryStr] = href.split("?");
    const matchesPath = pathname === base;

    if (!matchesPath) return false;

    if (queryStr) {
      const requiredParams = new URLSearchParams(queryStr);

      for (const [key, val] of requiredParams.entries()) {
        if (searchParams.get(key) !== val) {
          return false;
        }
      }

      return true;
    }

    if (exact) {
      return pathname === base;
    }

    if (base === "/workspace/generate") {
      return (
        !searchParams.get("new") &&
        !searchParams.get("project") &&
        !searchParams.get("template") &&
        !searchParams.get("journey")
      );
    }

    return true;
  }

  const width = collapsed ? "w-[72px]" : "w-[260px]";

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`${width} ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-[var(--background-2)]/[0.72] backdrop-blur-xl transition-all duration-300 lg:static`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-80px] top-[-80px] h-[220px] w-[220px] rounded-full bg-[var(--accent)]/[0.04] blur-[80px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(48,54,64,0.55)_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        <div className="relative flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--surface)] p-[1px] shadow-[0_0_18px_rgba(0,0,0,0.15)]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[var(--background)]">
                <Image
                  src="/icon.svg"
                  alt="Arqin AI Logo"
                  width={20}
                  height={20}
                  className="rounded"
                />
              </div>
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-[var(--text-primary)]">
                  ARQIN AI
                </p>

                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Architecture Engine
                </p>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)]/60 transition-all hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] lg:flex"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)]/60 hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="relative flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="mb-2 px-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map(
                  ({ href, label, icon: Icon, exact, badge }) => {
                    const active = isActive(href, exact);

                    return (
                      <Link
                        key={`${section.title}-${label}`}
                        href={href}
                        onClick={onClose}
                        title={collapsed ? label : undefined}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                          active
                            ? "border border-[var(--accent)]/28 bg-[var(--accent)]/16 text-[var(--text-primary)]"
                            : "border border-transparent text-[var(--text-muted)] hover:bg-[var(--accent)]/10 hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
                        )}

                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            active
                              ? "text-[var(--accent)]"
                              : "text-[var(--text-muted)]/70 group-hover:text-[var(--text-primary)]"
                          }`}
                        />

                        {!collapsed && (
                          <span className="truncate">{label}</span>
                        )}

                        {!collapsed && badge && (
                          <span className="ml-auto rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[var(--accent)]">
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="relative border-t border-[var(--border)] p-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{                    variables: { colorPrimary: "#D6AD69" },
                    elements: { avatarBox: "w-8 h-8 rounded-xl" },
                  }}                />

                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[var(--text-primary)]">
                    Architect Workspace
                  </p>

                  <p className="flex items-center gap-1 truncate text-[10px] text-[var(--accent)]">
                    <Sparkles className="h-3 w-3" />
                    AI Engine Ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export function SidebarToggle({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)] lg:hidden"
      aria-label="Open navigation"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}