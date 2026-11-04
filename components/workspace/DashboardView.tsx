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
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#A4AAB5]/10 pb-6"
      >
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D6AD69]/30 bg-[#D6AD69]/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#D6AD69]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6AD69] animate-pulse" />
            Architecture Studio Workstation
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#F0F1F3] sm:text-5xl">
            {getGreeting()}, Architect
          </h1>
          <p className="mt-2 text-base text-[#A4AAB5] max-w-2xl">
            Design, analyze, optimize, and synthesize production software architecture systems with AI intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/workspace/generate?journey=1"
            className="inline-flex items-center gap-2 rounded-full border border-[#4A5060] bg-[#171A20] px-4 py-2.5 text-xs font-semibold text-[#A4AAB5] transition-all hover:border-[#D6AD69]/50 hover:text-[#F0F1F3]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D6AD69]" />
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
          className="lg:col-span-8 group relative overflow-hidden rounded-3xl border border-[#A4AAB5]/12 bg-[#171A20] p-8 lg:p-10 backdrop-blur-xl shadow-2xl flex flex-col justify-between"
        >
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#D6AD69]/10 blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-[#303640]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D6AD69]/30 bg-[#1D222A] text-[#F0F1F3]">
              <Plus className="h-6 w-6 text-[#D6AD69]" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F0F1F3] sm:text-3xl">
              Create New Architecture
            </h2>
            <p className="mt-3 text-sm text-[#A4AAB5] leading-relaxed max-w-xl">
              Describe your target platform in natural language. Arqin AI will automatically decompose requirements into system nodes, APIs, databases, caches, and Mermaid diagram specs.
            </p>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-[#A4AAB5]/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-mono text-[#A4AAB5]/70">
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-[#D6AD69]" /> Microservices
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#D6AD69]" /> Event-Driven
              </span>
            </div>

            <Link
              href="/workspace/generate?new=1"
              className="inline-flex items-center gap-2 rounded-full border border-[#D6AD69]/40 bg-[#F0F1F3] px-6 py-3 text-xs font-bold text-[#101216] shadow-[0_0_20px_rgba(214,173,105,0.12)] transition-all hover:bg-[#E0BC7A]"
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
          className="lg:col-span-4 rounded-3xl border border-[#A4AAB5]/12 bg-[#1D222A] p-7 backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D6AD69]">
                Latest Session
              </span>
              <span className="h-2 w-2 rounded-full bg-[#D6AD69]" />
            </div>

            <h3 className="text-lg font-bold text-[#F0F1F3]">
              {latestProject ? latestProject.title : "No Architecture Open"}
            </h3>

            <p className="mt-2 text-xs text-[#A4AAB5] line-clamp-3 leading-relaxed">
              {latestProject?.description || "Open the studio canvas or choose a template to begin architecting."}
            </p>

            {health && (
              <div className="mt-5 p-3 rounded-2xl border border-[#A4AAB5]/10 bg-[#171A20]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A4AAB5]">Health Score</span>
                  <span className="font-mono font-bold text-[#F0F1F3]">{health.health} / 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#101216] overflow-hidden">
                  <div className="h-full bg-[#D6AD69] rounded-full" style={{ width: `${health.health}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#A4AAB5]/10">
            <Link
              href={latestProject ? `/workspace/generate?project=${latestProject.id}` : "/workspace/generate"}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#F0F1F3] hover:text-[#D6AD69] transition-colors"
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
        <section className="rounded-3xl border border-[#A4AAB5]/12 bg-[#171A20] p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-[#F0F1F3]">
              <FolderOpen className="h-5 w-5 text-[#D6AD69]" /> Projects Portfolio
            </h3>
            <Link href="/workspace/projects" className="text-xs font-bold text-[#D6AD69] hover:text-[#F0F1F3] transition-colors">
              View All →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#4A5060] p-8 text-center">
              <p className="text-xs text-[#A4AAB5]">No projects saved yet.</p>
              <Link href="/workspace/generate?new=1" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#F0F1F3]">
                <Plus className="h-3.5 w-3.5 text-[#D6AD69]" /> Create Project
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/workspace/generate?project=${p.id}`}
                  className="rounded-2xl border border-[#A4AAB5]/10 bg-[#1D222A] p-4 transition-all hover:border-[#D6AD69]/40 group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-[#D6AD69]/15 border border-[#D6AD69]/30 px-2 py-0.5 font-mono text-[9px] font-bold text-[#D6AD69] uppercase">
                      {DIAGRAM_TYPE_LABELS[p.diagramType]}
                    </span>
                    <GitBranch className="h-3.5 w-3.5 text-[#4A5060] group-hover:text-[#D6AD69] transition-colors" />
                  </div>
                  <p className="truncate text-xs font-bold text-[#F0F1F3] group-hover:text-[#D6AD69] transition-colors">
                    {p.title}
                  </p>
                  <p className="mt-1 text-[10px] text-[#A4AAB5]/60">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* AI Research Workstation Shortcut */}
        <section className="rounded-3xl border border-[#A4AAB5]/12 bg-[#171A20] p-7 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-[#F0F1F3]">
                <Search className="h-5 w-5 text-[#D6AD69]" /> Architecture Intelligence Research
              </h3>
              <span className="rounded-full bg-[#D6AD69]/10 border border-[#D6AD69]/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#D6AD69]">
                Senior Architect AI
              </span>
            </div>
            <p className="text-xs text-[#A4AAB5] leading-relaxed">
              Synthesize 17-point structural architecture reports, evaluate pattern trade-offs, technology stacks, security strategies, and performance limits.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#A4AAB5]/10 flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#4A5060]">Groq AI Workstation</span>
            <Link
              href="/workspace/research"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#F0F1F3] hover:text-[#D6AD69] transition-colors"
            >
              Open Research Workstation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Starter Templates */}
      <section className="rounded-3xl border border-[#A4AAB5]/12 bg-[#171A20] p-7">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-[#F0F1F3]">
            <LayoutTemplate className="h-5 w-5 text-[#D6AD69]" /> Starter Architecture Blueprints
          </h3>
          <Link href="/workspace/templates" className="text-xs font-bold text-[#D6AD69] hover:text-[#F0F1F3] transition-colors">
            Explore All Blueprints →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TEMPLATES.slice(0, 3).map((t) => (
            <Link
              key={t.id}
              href={`/workspace/generate?template=${t.id}`}
              className="rounded-2xl border border-[#A4AAB5]/10 bg-[#1D222A] p-5 transition-all hover:border-[#D6AD69]/40 group flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-[#F0F1F3] group-hover:text-[#D6AD69] transition-colors">
                  {t.name}
                </h4>
                <p className="mt-2 text-xs text-[#A4AAB5] line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#A4AAB5]/10 flex items-center justify-between text-[11px] text-[#D6AD69] font-bold">
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
