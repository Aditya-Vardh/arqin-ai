"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, LayoutTemplate, FolderOpen, History, ArrowRight,
  Sparkles, Activity, GitBranch, Clock,
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
      className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-10 sm:pt-12 lg:px-12 space-y-8"
      style={{ minHeight: "100%" }}
    >
      {/* Ambient glow — matches landing page color grading */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div style={{ position:"absolute", top:"-10%", left:"15%", width:"600px", height:"500px", background:"radial-gradient(ellipse, rgba(214,173,105,0.055) 0%, transparent 65%)", filter:"blur(40px)" }} />
        <div style={{ position:"absolute", top:"30%", right:"10%", width:"400px", height:"400px", background:"radial-gradient(ellipse, rgba(214,173,105,0.03) 0%, transparent 60%)", filter:"blur(50px)" }} />
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/8 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
            Architecture Studio
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {getGreeting()}, Architect
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
            Design, analyze, and synthesize production software architecture with AI.
          </p>
        </div>

        <Link
          href="/workspace/generate?journey=1"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
        >
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
          Guided Journey
        </Link>
      </div>

      {/* ── Primary block — New Architecture + Latest ─────────────────── */}
      <div className="grid gap-5 lg:grid-cols-12">

        {/* Create new — 8 cols */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm lg:col-span-8 flex flex-col justify-between">
          {/* Subtle glow orbs */}
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[var(--accent)]/8 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[var(--border)]/20 blur-2xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent)]/25 bg-[var(--surface-elevated)]">
              <Plus className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
              Create New Architecture
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--text-muted)]">
              Describe your platform in natural language. Arqin AI decomposes requirements into nodes, APIs, databases, and Mermaid diagram specs automatically.
            </p>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
            <div className="flex items-center gap-4 font-mono text-[10px] text-[var(--text-faint)]">
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-[var(--accent)]" />
                Microservices
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[var(--accent)]" />
                Event-Driven
              </span>
            </div>

            <Link
              href="/workspace/generate?new=1"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-bold text-[var(--on-accent)] shadow-[0_0_18px_rgba(214,173,105,0.15)] transition-all hover:bg-[var(--accent-hover)] active:scale-[0.97]"
            >
              Launch Studio Canvas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Latest project — 4 cols */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Latest Session
              </span>
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">
              {latest ? latest.title : "No Architecture Yet"}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-3">
              {latest?.description || "Open the studio or pick a template to start."}
            </p>

            {health && (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)]">Health Score</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{health.health}/100</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--background)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700"
                    style={{ width: `${health.health}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <Link
              href={latest ? `/workspace/generate?project=${latest.id}` : "/workspace/generate"}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              {latest ? "Resume Architecture" : "Open Studio"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Supporting grid ───────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Recent Projects */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
              <FolderOpen className="h-4.5 w-4.5 text-[var(--accent)]" />
              Projects
            </h3>
            <Link href="/workspace/projects" className="text-xs font-bold text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">
              View all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-30 text-[var(--text-muted)]">
                <rect x="5" y="8" width="30" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="21" y="13" width="9" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="21" y="18" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="10" y1="25" x2="30" y2="25" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <p className="text-sm font-medium text-[var(--text-primary)]">No projects yet</p>
              <p className="text-xs text-[var(--text-muted)]">Generate your first architecture to start.</p>
              <Link
                href="/workspace/generate?new=1"
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/15 transition-colors"
              >
                <Plus className="h-3 w-3" /> Create Architecture
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map(p => {
                const h = p.result ? deriveAdaptiveInsights(p.result) : null;
                return (
                  <Link
                    key={p.id}
                    href={`/workspace/generate?project=${p.id}`}
                    className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-[var(--accent)]">
                        {DIAGRAM_TYPE_LABELS[p.diagramType]}
                      </span>
                      {h && (
                        <span className="font-mono text-[9px] text-[var(--text-faint)]">
                          {h.health}/100
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {p.title}
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-[var(--text-faint)]">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent History */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
              <History className="h-4.5 w-4.5 text-[var(--accent)]" />
              Recent Activity
            </h3>
            <Link href="/workspace/history" className="text-xs font-bold text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">
              View all →
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
              <Clock className="h-8 w-8 opacity-25 text-[var(--text-muted)]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">No activity yet</p>
              <p className="text-xs text-[var(--text-muted)]">Your generation history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(e => (
                <Link
                  key={e.id}
                  href={`/workspace/generate?project=${e.projectId}`}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 transition-all duration-200 hover:border-[var(--accent)]/30 hover:bg-[var(--surface)] active:scale-[0.98]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/8">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {e.projectTitle}
                    </p>
                    <p className="truncate font-mono text-[9px] text-[var(--text-faint)]">
                      {e.prompt.length > 50 ? e.prompt.slice(0, 47) + "…" : e.prompt}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[9px] text-[var(--text-faint)]">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── AI Research shortcut ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent)]/25 bg-[var(--surface-elevated)]">
              <Search className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Architecture Intelligence Research</h3>
              <p className="mt-1 max-w-lg text-xs leading-relaxed text-[var(--text-muted)]">
                Synthesize structural reports, evaluate pattern trade-offs, technology stacks, security strategies, and performance limits with Senior Architect AI.
              </p>
            </div>
          </div>
          <Link
            href="/workspace/research"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2.5 text-xs font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
          >
            Open Research
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Starter Templates ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
            <LayoutTemplate className="h-4.5 w-4.5 text-[var(--accent)]" />
            Starter Blueprints
          </h3>
          <Link href="/workspace/templates" className="text-xs font-bold text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">
            Explore all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TEMPLATES.slice(0, 3).map(t => (
            <Link
              key={t.id}
              href={`/workspace/generate?template=${t.id}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-md active:scale-[0.98]"
            >
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {t.name}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2">
                  {t.description}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[11px] font-bold text-[var(--accent)]">
                <span>Use Blueprint</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
