"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  AlertCircle,
  Play,
  Sparkles,
  Plus,
} from "lucide-react";
import { useStore } from "@/hooks/UserStoreContext";
import type { HistoryEntry } from "@/lib/storage/types";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";
import PageHeader from "@/components/workspace/PageHeader";

export default function HistoryPage() {
  const store = useStore();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  useEffect(() => {
    if (!store) return;
    const id = requestAnimationFrame(() => setHistory(store.getHistory()));
    return () => cancelAnimationFrame(id);
  }, [store]);

  const filtered = useMemo(() => {
    return history.filter((entry) => {
      if (filter !== "all" && entry.status !== filter) return false;

      if (!query.trim()) return true;

      const q = query.toLowerCase();

      return (
        entry.projectTitle.toLowerCase().includes(q) ||
        entry.prompt.toLowerCase().includes(q) ||
        DIAGRAM_TYPE_LABELS[entry.diagramType]
          .toLowerCase()
          .includes(q)
      );
    });
  }, [history, query, filter]);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#101216]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[-180px] h-[480px] w-[480px] rounded-full bg-[#D6AD69]/[0.025] blur-[130px]" />

        <div className="absolute right-[8%] top-[20%] h-[350px] w-[350px] rounded-full bg-[#D6AD69]/[0.018] blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(214, 173, 105,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(214, 173, 105,0.012)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-8 p-6 pb-16 pt-8 sm:p-10 sm:pt-12">
        <PageHeader
          eyebrow="Architecture Evolution & Version System"
          title="Architecture Evolution"
          titleHighlight="Evolution"
          description="Track architecture versions, prompt refinements, health changes, and system evolution over time."
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A5060]" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search versions, prompts, or diagram types..."
              className="w-full rounded-2xl border border-[#303640] bg-[#171A20] py-3.5 pl-11 pr-4 font-[var(--font-inter)] text-xs text-[#F0F1F3] outline-none transition-all placeholder:text-[#4A5060] focus:border-[#D6AD69]/40 focus:ring-1 focus:ring-[#D6AD69]/10"
            />
          </div>

          <div className="flex rounded-2xl border border-[#303640] bg-[#171A20] p-1">
            {(["all", "success", "error"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-xl px-4 py-2 font-[var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-wider transition-all ${filter === value
                    ? "bg-[#D6AD69]/10 text-[#D6AD69]"
                    : "text-[#4A5060] hover:text-[#A4AAB5]"
                  }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-[var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#4A5060]">
              Version Stream
            </p>

            <p className="mt-1 font-[var(--font-space-grotesk)] text-sm font-semibold text-[#A4AAB5]">
              {filtered.length}{" "}
              {filtered.length === 1 ? "snapshot" : "snapshots"}
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#303640] bg-[#171A20] px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6AD69] shadow-[0_0_8px_rgba(214, 173, 105,0.65)]" />

            <span className="font-[var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-wider text-[#4A5060]">
              Version Tracking Active
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute bottom-4 left-[18px] top-4 hidden w-px bg-gradient-to-b from-[#D6AD69]/30 via-[#303640] to-transparent sm:block" />

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-[#303640] bg-[#101216]/80 p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D6AD69]/15 bg-[#D6AD69]/[0.04] text-[#D6AD69]">
                  <History className="h-5 w-5" />
                </div>

                <p className="font-[var(--font-space-grotesk)] text-sm font-bold text-[#F0F1F3]">
                  No architecture history found
                </p>

                <p className="mx-auto mt-2 max-w-md font-[var(--font-inter)] text-xs leading-6 text-[#4A5060]">
                  Create or generate an architecture to populate the version
                  timeline.
                </p>
                <Link
                  href="/workspace/generate?new=1"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Generate Architecture
                </Link>
              </div>
            ) : (
              filtered.map((entry, idx) => {
                const versionTag = `v${filtered.length - idx}.0`;
                const isSuccess = entry.status === "success";

                return (
                  <div
                    key={entry.id}
                    className="group relative sm:pl-12"
                  >
                    <div className="absolute left-[11px] top-8 hidden h-4 w-4 items-center justify-center rounded-full border border-[#D6AD69]/30 bg-[#101216] sm:flex">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${isSuccess
                            ? "bg-[#D6AD69] shadow-[0_0_8px_rgba(214, 173, 105,0.7)]"
                            : "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.4)]"
                          }`}
                      />
                    </div>

                    <div className="relative overflow-hidden rounded-[24px] border border-[#303640] bg-gradient-to-b from-[#171A20] via-[#0C0E12] to-[#101216] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-lg active:scale-[0.98] sm:p-6">
                      <div className="pointer-events-none absolute inset-0 opacity-[0.025]">
                        <div className="absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:22px_22px]" />
                      </div>

                      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-[var(--font-geist-mono)] text-[10px] font-bold ${isSuccess
                                ? "border-[#D6AD69]/20 bg-[#D6AD69]/[0.06] text-[#D6AD69]"
                                : "border-rose-400/20 bg-rose-400/[0.05] text-rose-300"
                              }`}
                          >
                            {versionTag}
                          </div>

                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate font-[var(--font-space-grotesk)] text-sm font-bold text-[#F0F1F3]">
                                {entry.projectTitle}
                              </span>

                              <span className="rounded-full border border-[#D6AD69]/20 bg-[#D6AD69]/[0.04] px-2.5 py-0.5 font-[var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-wide text-[#D6AD69]">
                                {DIAGRAM_TYPE_LABELS[entry.diagramType]}
                              </span>
                            </div>

                            <p className="max-w-2xl font-[var(--font-geist-mono)] text-[11px] leading-6 text-[#A4AAB5]">
                              &ldquo;{entry.prompt}&rdquo;
                            </p>

                            <div className="flex items-center gap-2">
                              <span className="h-1 w-1 rounded-full bg-[#4A5060]" />

                              <p className="font-[var(--font-geist-mono)] text-[9px] text-[#4A5060]">
                                {new Date(entry.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSuccess ? (
                            <Link
                              href={`/workspace/generate?project=${entry.projectId}`}
                              onClick={() =>
                                store?.setActiveProjectId(entry.projectId)
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-[#D6AD69]/20 bg-[#D6AD69]/[0.05] px-4 py-2.5 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[#D6AD69] transition-all hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/40 hover:border-[#D6AD69]/45 hover:bg-[#D6AD69] hover:text-[#101216]"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              Open Version
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 font-[var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-wide text-rose-400">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Generation Error
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Sparkles className="h-3.5 w-3.5 text-[#4A5060]" />

            <span className="font-[var(--font-geist-mono)] text-[9px] uppercase tracking-[0.16em] text-[#4A5060]">
              Architecture evolution tracked by Arqin AI
            </span>
          </div>
        )}
      </div>
    </div>
  );
}