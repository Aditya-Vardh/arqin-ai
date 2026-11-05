"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, LayoutTemplate, FolderOpen, History,
  ArrowRight, Sparkles, Activity, GitBranch, Clock,
} from "lucide-react";
import { useStore } from "@/hooks/UserStoreContext";
import type { Project, HistoryEntry } from "@/lib/storage/types";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";
import { TEMPLATES } from "@/lib/templates";
import { deriveAdaptiveInsights } from "@/lib/adaptive";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Tiny CSS-only stagger wrapper — adds delay via inline style
function Stagger({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <div
      className="animate-page-enter"
      style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

export default function DashboardView() {
  const store = useStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory]   = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!store) return;
    const id = requestAnimationFrame(() => {
      setProjects(store.getProjects().slice(0, 4));
      setHistory(store.getHistory().filter(h => h.status === "success").slice(0, 4));
    });
    return () => cancelAnimationFrame(id);
  }, [store]);

  const latest = projects[0];
  const health = latest?.result ? deriveAdaptiveInsights(latest.result) : null;

  return (
    <div
      className="relative min-h-full w-full"
      style={{ background: "#101216" }}
    >
      {/* Ambient amber glow — premium feel */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        style={{ zIndex: 0 }}
      >
        <div style={{
          position: "absolute", top: "-15%", left: "20%",
          width: "500px", height: "400px",
          background: "radial-gradient(ellipse, rgba(214,173,105,0.06) 0%, transparent 65%)",
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "15%",
          width: "360px", height: "300px",
          background: "radial-gradient(ellipse, rgba(214,173,105,0.03) 0%, transparent 60%)",
          filter: "blur(50px)",
        }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 px-6 pb-16 pt-8 sm:px-10 sm:pt-10 lg:px-12">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <Stagger i={0}>
          <div className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between"
            style={{ borderColor: "rgba(48,54,64,0.85)" }}>
            <div>
              {/* Eyebrow pill */}
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest"
                style={{ borderColor: "rgba(214,173,105,0.25)", background: "rgba(214,173,105,0.08)", color: "#D6AD69" }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#D6AD69" }} />
                Architecture Studio
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "#F0F1F3", letterSpacing: "-0.03em" }}>
                {getGreeting()}, Architect
              </h1>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed" style={{ color: "#B8C0CC" }}>
                Design, analyze, and synthesize production software architecture with AI.
              </p>
            </div>

            <Link
              href="/workspace/generate?journey=1"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all hover:border-[#D6AD69]/40 hover:text-[#F0F1F3]"
              style={{ borderColor: "rgba(48,54,64,0.85)", background: "#171A20", color: "#B8C0CC" }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: "#D6AD69" }} />
              Guided Journey
            </Link>
          </div>
        </Stagger>

        {/* ── Primary row — Create Architecture (8) + Latest Session (4) ─ */}
        <Stagger i={1}>
          <div className="grid gap-5 lg:grid-cols-12">

            {/* Create new — 8 cols */}
            <div
              className="relative overflow-hidden rounded-2xl border lg:col-span-8 flex flex-col justify-between p-7"
              style={{ background: "#171A20", borderColor: "rgba(48,54,64,0.85)" }}
            >
              {/* Glow orb */}
              <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full opacity-40"
                style={{ background: "radial-gradient(circle, rgba(214,173,105,0.18), transparent 70%)" }} />

              <div className="relative z-10">
                <div
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border"
                  style={{ borderColor: "rgba(214,173,105,0.25)", background: "#1D222A" }}
                >
                  <Plus className="h-5 w-5" style={{ color: "#D6AD69" }} />
                </div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: "#F0F1F3", letterSpacing: "-0.02em" }}>
                  Create New Architecture
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed" style={{ color: "#B8C0CC" }}>
                  Describe your platform in natural language. Arqin AI decomposes requirements into nodes, APIs, databases, and Mermaid diagram specs automatically.
                </p>
              </div>

              <div
                className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5"
                style={{ borderColor: "rgba(48,54,64,0.85)" }}
              >
                <div className="flex items-center gap-4 font-mono text-[10px]" style={{ color: "#6A7280" }}>
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5" style={{ color: "#D6AD69" }} />
                    Microservices
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" style={{ color: "#D6AD69" }} />
                    Event-Driven
                  </span>
                </div>

                <Link
                  href="/workspace/generate?new=1"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all hover:brightness-110 active:scale-[0.97]"
                  style={{
                    background: "#D6AD69",
                    color: "#0E1116",
                    boxShadow: "0 0 20px rgba(214,173,105,0.20)",
                  }}
                >
                  Launch Studio Canvas
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Latest session — 4 cols */}
            <div
              className="rounded-2xl border lg:col-span-4 flex flex-col justify-between p-6"
              style={{ background: "#1D222A", borderColor: "rgba(48,54,64,0.85)" }}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: "#D6AD69" }}>
                    Latest Session
                  </span>
                  <span className="h-2 w-2 rounded-full" style={{ background: "#D6AD69" }} />
                </div>

                <h3 className="text-base font-bold leading-snug" style={{ color: "#F0F1F3" }}>
                  {latest ? latest.title : "No Architecture Yet"}
                </h3>
                <p className="mt-2 text-xs leading-relaxed line-clamp-3" style={{ color: "#B8C0CC" }}>
                  {latest?.description || "Open the studio or pick a template to start."}
                </p>

                {health && (
                  <div
                    className="mt-4 rounded-xl border p-3"
                    style={{ borderColor: "rgba(48,54,64,0.85)", background: "#171A20" }}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span style={{ color: "#B8C0CC" }}>Health Score</span>
                      <span className="font-mono font-bold" style={{ color: "#F0F1F3" }}>{health.health}/100</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "#101216" }}>
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${health.health}%`, background: "#D6AD69" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(48,54,64,0.85)" }}>
                <Link
                  href={latest ? `/workspace/generate?project=${latest.id}` : "/workspace/generate"}
                  className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:text-[#D6AD69]"
                  style={{ color: "#B8C0CC" }}
                >
                  {latest ? "Resume Architecture" : "Open Studio"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Stagger>

        {/* ── 2-column grid: Projects + Recent Activity ────────────────── */}
        <Stagger i={2}>
          <div className="grid gap-5 lg:grid-cols-2">

            {/* Projects */}
            <section
              className="rounded-2xl border p-6"
              style={{ background: "#171A20", borderColor: "rgba(48,54,64,0.85)" }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#F0F1F3" }}>
                  <FolderOpen className="h-4 w-4" style={{ color: "#D6AD69" }} />
                  Projects
                </h3>
                <Link href="/workspace/projects" className="text-xs font-bold transition-colors hover:text-[#F0F1F3]" style={{ color: "#D6AD69" }}>
                  View all →
                </Link>
              </div>

              {projects.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center"
                  style={{ borderColor: "rgba(48,54,64,0.85)" }}
                >
                  <svg width="36" height="36" viewBox="0 0 40 40" fill="none" style={{ opacity: 0.25, color: "#B8C0CC" }}>
                    <rect x="5" y="8" width="30" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="10" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="21" y="13" width="9" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="21" y="18" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="10" y1="25" x2="30" y2="25" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <p className="text-sm font-medium" style={{ color: "#F0F1F3" }}>No projects yet</p>
                  <p className="text-xs" style={{ color: "#B8C0CC" }}>Generate your first architecture to start.</p>
                  <Link
                    href="/workspace/generate?new=1"
                    className="mt-1 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                    style={{ borderColor: "rgba(214,173,105,0.20)", background: "rgba(214,173,105,0.08)", color: "#D6AD69" }}
                  >
                    <Plus className="h-3 w-3" /> Create Architecture
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {projects.map((p, idx) => {
                    const h = p.result ? deriveAdaptiveInsights(p.result) : null;
                    return (
                      <Link
                        key={p.id}
                        href={`/workspace/generate?project=${p.id}`}
                        className="group flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                        style={{
                          background: "#1D222A",
                          borderColor: "rgba(48,54,64,0.85)",
                          animationDelay: `${idx * 40}ms`,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(214,173,105,0.30)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(48,54,64,0.85)")}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className="rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase"
                            style={{ borderColor: "rgba(214,173,105,0.25)", background: "rgba(214,173,105,0.10)", color: "#D6AD69" }}
                          >
                            {DIAGRAM_TYPE_LABELS[p.diagramType]}
                          </span>
                          {h && <span className="font-mono text-[9px]" style={{ color: "#6A7280" }}>{h.health}/100</span>}
                        </div>
                        <p className="truncate text-xs font-bold transition-colors group-hover:text-[#D6AD69]" style={{ color: "#F0F1F3" }}>
                          {p.title}
                        </p>
                        <p className="mt-1 font-mono text-[9px]" style={{ color: "#6A7280" }}>
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section
              className="rounded-2xl border p-6"
              style={{ background: "#171A20", borderColor: "rgba(48,54,64,0.85)" }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#F0F1F3" }}>
                  <History className="h-4 w-4" style={{ color: "#D6AD69" }} />
                  Recent Activity
                </h3>
                <Link href="/workspace/history" className="text-xs font-bold transition-colors hover:text-[#F0F1F3]" style={{ color: "#D6AD69" }}>
                  View all →
                </Link>
              </div>

              {history.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center"
                  style={{ borderColor: "rgba(48,54,64,0.85)" }}
                >
                  <Clock className="h-7 w-7" style={{ opacity: 0.25, color: "#B8C0CC" }} />
                  <p className="text-sm font-medium" style={{ color: "#F0F1F3" }}>No activity yet</p>
                  <p className="text-xs" style={{ color: "#B8C0CC" }}>Your generation history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(e => (
                    <Link
                      key={e.id}
                      href={`/workspace/generate?project=${e.projectId}`}
                      className="group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 active:scale-[0.98]"
                      style={{ background: "#1D222A", borderColor: "rgba(48,54,64,0.85)" }}
                      onMouseEnter={e2 => {
                        e2.currentTarget.style.borderColor = "rgba(214,173,105,0.30)";
                        e2.currentTarget.style.background = "#171A20";
                      }}
                      onMouseLeave={e2 => {
                        e2.currentTarget.style.borderColor = "rgba(48,54,64,0.85)";
                        e2.currentTarget.style.background = "#1D222A";
                      }}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                        style={{ borderColor: "rgba(214,173,105,0.20)", background: "rgba(214,173,105,0.08)" }}
                      >
                        <Sparkles className="h-3.5 w-3.5" style={{ color: "#D6AD69" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold transition-colors group-hover:text-[#D6AD69]" style={{ color: "#F0F1F3" }}>
                          {e.projectTitle}
                        </p>
                        <p className="truncate font-mono text-[9px]" style={{ color: "#6A7280" }}>
                          {e.prompt.length > 55 ? e.prompt.slice(0, 52) + "…" : e.prompt}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[9px]" style={{ color: "#6A7280" }}>
                        {new Date(e.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </Stagger>

        {/* ── AI Research + Templates row ──────────────────────────────── */}
        <Stagger i={3}>
          <div className="grid gap-5 lg:grid-cols-2">

            {/* AI Research shortcut */}
            <section
              className="rounded-2xl border p-6"
              style={{ background: "#171A20", borderColor: "rgba(48,54,64,0.85)" }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                    style={{ borderColor: "rgba(214,173,105,0.25)", background: "#1D222A" }}
                  >
                    <Search className="h-5 w-5" style={{ color: "#D6AD69" }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: "#F0F1F3" }}>AI Architecture Research</h3>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "#B8C0CC" }}>
                      Synthesize structural reports and evaluate pattern trade-offs with AI.
                    </p>
                  </div>
                </div>
                <Link
                  href="/workspace/research"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all hover:border-[#D6AD69]/40 hover:text-[#F0F1F3]"
                  style={{ borderColor: "rgba(48,54,64,0.85)", background: "#1D222A", color: "#B8C0CC" }}
                >
                  Open Research <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>

            {/* Quick templates */}
            <section
              className="rounded-2xl border p-6"
              style={{ background: "#171A20", borderColor: "rgba(48,54,64,0.85)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "#F0F1F3" }}>
                  <LayoutTemplate className="h-4 w-4" style={{ color: "#D6AD69" }} />
                  Starter Blueprints
                </h3>
                <Link href="/workspace/templates" className="text-xs font-bold transition-colors hover:text-[#F0F1F3]" style={{ color: "#D6AD69" }}>
                  Explore all →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {TEMPLATES.slice(0, 3).map(t => (
                  <Link
                    key={t.id}
                    href={`/workspace/generate?template=${t.id}`}
                    className="group flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{ background: "#1D222A", borderColor: "rgba(48,54,64,0.85)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(214,173,105,0.30)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(48,54,64,0.85)")}
                  >
                    <h4 className="text-xs font-bold transition-colors group-hover:text-[#D6AD69]" style={{ color: "#F0F1F3" }}>
                      {t.name}
                    </h4>
                    <p className="mt-1.5 text-[10px] leading-relaxed line-clamp-2" style={{ color: "#6A7280" }}>
                      {t.description}
                    </p>
                    <div
                      className="mt-3 flex items-center justify-between border-t pt-2.5 text-[10px] font-bold"
                      style={{ borderColor: "rgba(48,54,64,0.85)", color: "#D6AD69" }}
                    >
                      <span>Use Blueprint</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </Stagger>

      </div>
    </div>
  );
}
