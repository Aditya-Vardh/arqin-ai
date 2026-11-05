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
      <div className="flex h-[90vh] w-[95vw] max-w-7xl flex-col overflow-hidden rounded-3xl border border-[#D6AD69]/20 bg-[#101216] text-[#F0F1F3] shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-[#D6AD69]/15 bg-[#101216] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D6AD69] via-[#D6AD69] to-[#A08050] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#101216]">
                <Sparkles className="h-5 w-5 text-[#D6AD69]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F0F1F3]">Architecture Optimization Comparison</h2>
              <p className="text-xs text-[#A4AAB5]">Side-by-side analysis of original vs optimized architecture graph.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[#D6AD69]/30 bg-[#D6AD69]/10 px-4 py-1.5">
              <span className="text-xs font-mono text-[#4A5060]">Health Score:</span>
              <span className="font-mono text-sm font-bold text-[#A4AAB5]">{result.originalHealth}/100</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#D6AD69]" />
              <span className="font-mono text-base font-extrabold text-[#D6AD69]">{result.optimizedHealth}/100</span>
              {gain > 0 && (
                <span className="rounded-md bg-[#D6AD69] px-2 py-0.5 font-mono text-[11px] font-bold text-[#101216]">
                  +{gain} pts
                </span>
              )}
              {gain === 0 && (
                <span className="rounded-md bg-[#D6AD69]/20 px-2 py-0.5 font-mono text-[11px] font-bold text-[#A4AAB5]">
                  No change
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#D6AD69]/15 bg-[#101216] p-2 text-[#4A5060] hover:text-[#F0F1F3] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[#D6AD69]/10 bg-[#0C0E12] px-6 py-2.5">
          <div className="flex items-center gap-2 font-mono text-xs text-[#4A5060]">
            <span>Comparing:</span>
            <span className="font-bold text-[#F0F1F3]">{result.originalGraph.title}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[#D6AD69]/15 bg-[#101216] p-1">
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
                    ? "bg-[#D6AD69] text-[#101216]"
                    : "text-[#A4AAB5] hover:text-[#F0F1F3]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-72 border-r border-[#D6AD69]/15 bg-[#101216] p-5 overflow-y-auto shrink-0 space-y-4">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D6AD69]">Optimization Summary</p>
              <p className="mt-1 text-xs leading-relaxed text-[#A4AAB5]">{result.explanation}</p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5060]">
                Applied Structural Changes ({result.changes.length})
              </p>

              {result.changes.length === 0 && (
                <p className="text-xs text-[#4A5060] italic">No structural changes applied  --  architecture already optimized.</p>
              )}

              {result.changes.map((c) => (
                <div key={c.id} className="rounded-2xl border border-[#D6AD69]/15 bg-[#101216] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F0F1F3]">{c.title}</span>
                    <span className="rounded bg-[#D6AD69]/20 px-2 py-0.5 font-mono text-[9px] font-bold text-[#D6AD69]">
                      {c.type}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#A4AAB5]">{c.description}</p>

                  <div className="border-t border-[#D6AD69]/10 pt-2 text-[10px] space-y-1">
                    <p className="text-[#D6AD69] font-medium"><strong className="text-[#F0F1F3]">Benefit:</strong> {c.expectedBenefit}</p>
                    <p className="text-[#4A5060]"><strong className="text-[#A4AAB5]">Trade-off:</strong> {c.tradeoff}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden bg-[#0C0E12]">
            {activeView === "side" ? (
              <div className="grid flex-1 grid-cols-2 divide-x divide-[#D6AD69]/15 min-h-0">
                <div className="flex flex-col min-h-0">
                  <div className="border-b border-[#D6AD69]/10 bg-[#101216] px-4 py-2 text-xs font-bold text-[#A4AAB5] flex items-center justify-between shrink-0">
                    <span>Original Architecture</span>
                    <span className="font-mono text-[#4A5060]">Health: {result.originalHealth}/100</span>
                  </div>
                  <div className="flex-1 relative overflow-hidden min-h-0">
                    <ArchitectureCanvas chart={origMermaid} />
                  </div>
                </div>

                <div className="flex flex-col min-h-0">
                  <div className="border-b border-[#D6AD69]/10 bg-[#101216] px-4 py-2 text-xs font-bold text-[#D6AD69] flex items-center justify-between shrink-0">
                    <span>Optimized Architecture</span>
                    <span className="font-mono text-[#D6AD69]">Health: {result.optimizedHealth}/100</span>
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

        <div className="flex items-center justify-between border-t border-[#D6AD69]/15 bg-[#101216] px-6 py-4">
          <p className="text-xs text-[#4A5060]">
            {result.changes.length > 0
              ? "Applying optimizations updates the architecture project state and creates a version snapshot."
              : "No changes to apply  --  architecture is already at an optimal configuration."}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#D6AD69]/20 bg-[#0C0E12] px-5 py-2.5 text-xs font-bold text-[#A4AAB5] hover:text-[#F0F1F3] transition-colors"
            >
              Keep Original
            </button>

            <button
              type="button"
              onClick={() => { onApplyOptimized(); onClose(); }}
              disabled={result.changes.length === 0}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D6AD69] via-[#D6AD69] to-[#A08050] px-6 py-2.5 text-xs font-bold text-[#101216] shadow-[0_0_25px_rgba(214, 173, 105,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
