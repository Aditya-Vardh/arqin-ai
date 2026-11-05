"use client";

import { useState } from "react";
import { X, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import type { OptimizationResult } from "@/lib/graph/types";
import { graphToMermaid } from "@/lib/graph/serializer";
import ArchitectureCanvas from "./ArchitectureCanvas";

type Props = {
  result: OptimizationResult;
  onClose: () => void;
  onApplyOptimized: () => void;
};

export default function ComparisonModal({ result, onClose, onApplyOptimized }: Props) {
  const [activeView, setActiveView] = useState<"side" | "original" | "optimized">("side");

  const origMermaid = graphToMermaid(result.originalGraph);
  const optMermaid = graphToMermaid(result.optimizedGraph);
  const gain = result.optimizedHealth - result.originalHealth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl animate-fade-in">
      <div className="flex h-[90vh] w-[95vw] max-w-7xl flex-col overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-[var(--background)] text-[var(--text-primary)] shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-[var(--accent)]/15 bg-[var(--background)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-[#A08050] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[var(--background)]">
                <Sparkles className="h-5 w-5 text-[var(--accent)]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Architecture Optimization Comparison</h2>
              <p className="text-xs text-[var(--text-muted)]">Side-by-side analysis of original vs optimized architecture graph.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5">
              <span className="text-xs font-mono text-[var(--text-faint)]">Health Score:</span>
              <span className="font-mono text-sm font-bold text-[var(--text-muted)]">{result.originalHealth}/100</span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span className="font-mono text-base font-extrabold text-[var(--accent)]">{result.optimizedHealth}/100</span>
              {gain > 0 && (
                <span className="rounded-md bg-[var(--accent)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--on-accent)]">
                  +{gain} pts
                </span>
              )}
              {gain === 0 && (
                <span className="rounded-md bg-[var(--accent)]/20 px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--text-muted)]">
                  No change
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--accent)]/15 bg-[var(--background)] p-2 text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[var(--accent)]/10 bg-[var(--background-2)] px-6 py-2.5">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-faint)]">
            <span>Comparing:</span>
            <span className="font-bold text-[var(--text-primary)]">{result.originalGraph.title}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--accent)]/15 bg-[var(--background)] p-1">
            {([
              { v: "side" as const, label: "Split View" },
              { v: "original" as const, label: `Original (${result.originalHealth})` },
              { v: "optimized" as const, label: `Optimized (${result.optimizedHealth})` },
            ]).map(({ v, label }) => (
              <button
                key={v}
                type="button"
                onClick={() => setActiveView(v)}
                className={`rounded-lg px-3.5 py-1 text-xs font-bold transition-all ${
                  activeView === v
                    ? "bg-[var(--accent)] text-[var(--on-accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-72 border-r border-[var(--accent)]/15 bg-[var(--background)] p-5 overflow-y-auto shrink-0 space-y-4">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">Optimization Summary</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{result.explanation}</p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                Applied Structural Changes ({result.changes.length})
              </p>

              {result.changes.length === 0 && (
                <p className="text-xs text-[var(--text-faint)] italic">No structural changes applied  --  architecture already optimized.</p>
              )}

              {result.changes.map((c) => (
                <div key={c.id} className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--text-primary)]">{c.title}</span>
                    <span className="rounded bg-[var(--accent)]/20 px-2 py-0.5 font-mono text-[9px] font-bold text-[var(--accent)]">
                      {c.type}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{c.description}</p>

                  <div className="border-t border-[var(--accent)]/10 pt-2 text-[10px] space-y-1">
                    <p className="text-[var(--accent)] font-medium"><strong className="text-[var(--text-primary)]">Benefit:</strong> {c.expectedBenefit}</p>
                    <p className="text-[var(--text-faint)]"><strong className="text-[var(--text-muted)]">Trade-off:</strong> {c.tradeoff}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden bg-[var(--background-2)]">
            {activeView === "side" ? (
              <div className="grid flex-1 grid-cols-2 divide-x divide-[#D6AD69]/15 min-h-0">
                <div className="flex flex-col min-h-0">
                  <div className="border-b border-[var(--accent)]/10 bg-[var(--background)] px-4 py-2 text-xs font-bold text-[var(--text-muted)] flex items-center justify-between shrink-0">
                    <span>Original Architecture</span>
                    <span className="font-mono text-[var(--text-faint)]">Health: {result.originalHealth}/100</span>
                  </div>
                  <div className="flex-1 relative overflow-hidden min-h-0">
                    <ArchitectureCanvas chart={origMermaid} />
                  </div>
                </div>

                <div className="flex flex-col min-h-0">
                  <div className="border-b border-[var(--accent)]/10 bg-[var(--background)] px-4 py-2 text-xs font-bold text-[var(--accent)] flex items-center justify-between shrink-0">
                    <span>Optimized Architecture</span>
                    <span className="font-mono text-[var(--accent)]">Health: {result.optimizedHealth}/100</span>
                  </div>
                  <div className="flex-1 relative overflow-hidden min-h-0">
                    <ArchitectureCanvas chart={optMermaid} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 relative overflow-hidden min-h-0">
                <ArchitectureCanvas
                  chart={activeView === "original" ? origMermaid : optMermaid}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--accent)]/15 bg-[var(--background)] px-6 py-4">
          <p className="text-xs text-[var(--text-faint)]">
            {result.changes.length > 0
              ? "Applying optimizations updates the architecture project state and creates a version snapshot."
              : "No changes to apply  --  architecture is already at an optimal configuration."}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--accent)]/20 bg-[var(--background-2)] px-5 py-2.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Keep Original
            </button>

            <button
              type="button"
              onClick={() => { onApplyOptimized(); onClose(); }}
              disabled={result.changes.length === 0}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[#A08050] px-6 py-2.5 text-xs font-bold text-[var(--on-accent)] shadow-[0_0_25px_rgba(var(--accent-rgb,214,173,105),0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Apply Optimized Architecture ({result.optimizedHealth}/100)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
