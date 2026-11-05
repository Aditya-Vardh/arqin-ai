"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, Search, LayoutTemplate, FolderOpen, History, ArrowRight, Sparkles, Activity, GitBranch
} from "lucide-react";
import { useStore } from "@/hooks/UserStoreContext";
import type { Project, HistoryEntry } from "@/lib/storage/types";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";
import { TEMPLATES } from "@/lib/templates";
import { deriveAdaptiveInsights } from "@/lib/adaptive";
import MagicBento from "@/components/ui/MagicBento";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardView() {
  const store = useStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!store) return;
    const id = requestAnimationFrame(() => {
      setProjects(store.getProjects().slice(0, 4));
      setHistory(store.getHistory().filter((h) => h.status === "success").slice(0, 4));
    });
    return () => cancelAnimationFrame(id);
  }, [store]);

  const latestProject = projects[0];
  const health = latestProject?.result
    ? deriveAdaptiveInsights(latestProject.result)
    : null;

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10 pt-8 sm:pt-12 pb-16 space-y-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[var(--border)] pb-6"
      >
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Architecture Studio Workstation
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            {getGreeting()}, Architect
          </h1>
          <p className="mt-2 text-base text-[var(--text-muted)] max-w-2xl">
            Design, analyze, optimize, and synthesize production software architecture systems with AI intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/workspace/generate?journey=1"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Guided Journey</span>
          </Link>
        </div>
      </motion.div>

      {/* Asymmetric Primary Block Composition */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Large Primary Hero Block (8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-8 group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 lg:p-10 backdrop-blur-xl shadow-2xl flex flex-col justify-between"
        >
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-[var(--border)]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface-elevated)] text-[var(--text-primary)]">
              <Plus className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Create New Architecture
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed max-w-xl">
              Describe your target platform in natural language. Arqin AI will automatically decompose requirements into system nodes, APIs, databases, caches, and Mermaid diagram specs.
            </p>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]/70">
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-[var(--accent)]" /> Microservices
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[var(--accent)]" /> Event-Driven
              </span>
            </div>

            <Link
              href="/workspace/generate?new=1"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--foreground)] px-6 py-3 text-xs font-bold text-[var(--background)] shadow-[0_0_20px_rgba(214,173,105,0.12)] transition-all hover:bg-[var(--accent-hover)]"
            >
              <span>Launch Studio Canvas</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Secondary Recent Architecture Block (4 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-7 backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Latest Session
              </span>
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {latestProject ? latestProject.title : "No Architecture Open"}
            </h3>

            <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
              {latestProject?.description || "Open the studio canvas or choose a template to begin architecting."}
            </p>

            {health && (
              <div className="mt-5 p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Health Score</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{health.health} / 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--background)] overflow-hidden">
                  <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${health.health}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <Link
              href={latestProject ? `/workspace/generate?project=${latestProject.id}` : "/workspace/generate"}
              className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              <span>{latestProject ? "Resume Architecture" : "Open Studio"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Supporting Blocks Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Projects */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-[var(--text-primary)]">
              <FolderOpen className="h-5 w-5 text-[var(--accent)]" /> Projects Portfolio
            </h3>
            <Link href="/workspace/projects" className="text-xs font-bold text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">
              View All →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center flex flex-col items-center gap-3">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
                <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]"/>
                <rect x="12" y="16" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]"/>
                <rect x="26" y="16" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]"/>
                <rect x="26" y="22" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]"/>
                <line x1="12" y1="30" x2="36" y2="30" stroke="currentColor" strokeWidth="1.5" className="text-[var(--border)]"/>
                <line x1="12" y1="34" x2="28" y2="34" stroke="currentColor" strokeWidth="1.5" className="text-[var(--border)]"/>
              </svg>
              <p className="text-sm font-medium text-[var(--text-primary)]">No projects yet</p>
              <p className="text-xs text-[var(--text-muted)]">Generate your first architecture to get started.</p>
              <Link href="/workspace/generate?new=1" className="mt-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors">
                <Plus className="h-3 w-3" /> Create Architecture
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/workspace/generate?project=${p.id}`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-lg active:scale-[0.98] group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 px-2 py-0.5 font-mono text-[9px] font-bold text-[var(--accent)] uppercase">
                      {DIAGRAM_TYPE_LABELS[p.diagramType]}
                    </span>
                    <GitBranch className="h-3.5 w-3.5 text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors" />
                  </div>
                  <p className="truncate text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {p.title}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--text-muted)]/60">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* AI Research Workstation Shortcut */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-[var(--text-primary)]">
                <Search className="h-5 w-5 text-[var(--accent)]" /> Architecture Intelligence Research
              </h3>
              <span className="rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[var(--accent)]">
                Senior Architect AI
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Synthesize 17-point structural architecture reports, evaluate pattern trade-offs, technology stacks, security strategies, and performance limits.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[var(--text-faint)]">Groq AI Workstation</span>
            <Link
              href="/workspace/research"
              className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              Open Research Workstation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Starter Templates */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-[var(--text-primary)]">
            <LayoutTemplate className="h-5 w-5 text-[var(--accent)]" /> Starter Architecture Blueprints
          </h3>
          <Link href="/workspace/templates" className="text-xs font-bold text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors">
            Explore All Blueprints →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TEMPLATES.slice(0, 3).map((t) => (
            <Link
              key={t.id}
              href={`/workspace/generate?template=${t.id}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-lg active:scale-[0.98] group flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {t.name}
                </h4>
                <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--accent)] font-bold">
                <span>Use Blueprint</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
