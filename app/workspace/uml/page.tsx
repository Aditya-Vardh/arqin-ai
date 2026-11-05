"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GitBranch, Sparkles, CheckCircle2, ArrowRight, Wand2, RefreshCw, AlertCircle, Layers } from "lucide-react";
import type { DiagramType, ArchitectureResult } from "@/lib/storage/types";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";
import ArchitectureCanvas from "@/components/workspace/ArchitectureCanvas";

const UML_TYPES: { id: DiagramType; label: string; desc: string }[] = [
  { id: "class", label: "Class Diagram", desc: "Object-oriented structure, attributes, methods, & relationships" },
  { id: "sequence", label: "Sequence Diagram", desc: "Time-ordered interaction flow between components & objects" },
  { id: "component", label: "Component Diagram", desc: "High-level physical modules, libraries, & API interfaces" },
  { id: "deployment", label: "Deployment Diagram", desc: "Hardware nodes, servers, container clusters, & networks" },
  { id: "er", label: "Entity-Relationship (ER)", desc: "Database tables, primary keys, foreign keys, & cardinalities" },
  { id: "state", label: "State Machine", desc: "State transitions, triggers, conditions, & lifecycle flow" },
];

function UmlContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("type") as DiagramType | null;
  const [type, setType] = useState<DiagramType>(
    initial && UML_TYPES.some((t) => t.id === initial) ? initial : "class",
  );
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArchitectureResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSynthesize() {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: prompt || `Standard ${type} diagram specification`, diagramType: type }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "UML synthesis failed.");
        return;
      }

      setResult(data as ArchitectureResult);
    } catch {
      setError("Network error. Unable to synthesize UML.");
    } finally {
      setLoading(false);
    }
  }

  function openInStudio() {
    router.push(`/workspace/generate?new=1&type=${type}`);
  }

  const activeItem = UML_TYPES.find((t) => t.id === type) ?? UML_TYPES[0];

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 pt-8 sm:pt-12 pb-16 space-y-10">
      {/* Header */}
      <div className="border-b border-[var(--accent)]/15 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-1 backdrop-blur-md">
          <GitBranch className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
            Standardized UML Synthesizer
          </span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl leading-tight mb-2">
          UML Diagram Generator
        </h1>
        <p className="text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Select a standardized UML diagram specification, customize your design prompt, and generate clean, production-ready Mermaid diagrams.
        </p>
      </div>

      {/* UML Grid Selection */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {UML_TYPES.map((t) => {
          const active = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setType(t.id); setResult(null); }}
              className={`group relative overflow-hidden flex flex-col justify-between rounded-3xl border p-6 text-left transition-all duration-300 ${
                active 
                  ? "bg-gradient-to-b from-[var(--background)] to-[var(--background)] border-[var(--accent)] shadow-[0_0_35px_rgba(214,173,105,0.25)]" 
                  : "bg-gradient-to-b from-[var(--background)]/90 to-[var(--background)] border-[var(--accent)]/15 hover:border-[var(--accent)]/35 hover:-translate-y-1"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
              
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${active ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--text-faint)]"} group-hover:scale-110 transition-transform`}>
                    <GitBranch className="h-5 w-5" />
                  </div>
                  {active && (
                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-[var(--accent)] uppercase bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </span>
                  )}
                </div>

                <h3 className={`text-lg font-bold ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"}`}>
                  {t.label}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                  {t.desc}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-3 border-t border-[var(--accent)]/10 flex items-center justify-between text-xs font-bold text-[var(--accent)]">
                <span>Select Format</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Synthesis Control Box */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-gradient-to-b from-[var(--background)] via-[var(--background-2)] to-[var(--background)] p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--accent)] shadow-[0_0_20px_rgba(214,173,105,0.3)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[var(--text-primary)]">{activeItem.label} Generator</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Enter a system description below or click Synthesize to view standard {activeItem.label} specs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSynthesize}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[#A08050] px-6 py-3.5 text-xs font-bold text-[var(--on-accent)] shadow-[0_0_30px_rgba(214,173,105,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span>Synthesize {activeItem.label}</span>
            </button>

            <button
              type="button"
              onClick={openInStudio}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--accent)]/20 bg-[var(--background)] px-5 py-3.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors"
            >
              <Layers className="h-4 w-4 text-[var(--accent)]" />
              Open in Studio
            </button>
          </div>
        </div>

        {/* Input prompt */}
        <div className="relative z-10">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Customize prompt for ${activeItem.label} (e.g. User auth flow with JWT tokens, rate limiting and database lookup)...`}
            className="w-full rounded-2xl border border-[var(--accent)]/20 bg-[var(--background-2)] px-5 py-3.5 text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Live Canvas View */}
      {result && (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-[var(--background)] h-[600px] shadow-2xl">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--accent)]/15 bg-[var(--background)]">
            <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
              {result.title}  —  {DIAGRAM_TYPE_LABELS[result.diagramType]} Live Preview
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] uppercase">Mermaid Engine Ready</span>
          </div>

          <div className="relative h-[calc(100%-45px)] overflow-hidden">
            <ArchitectureCanvas
              chart={result.mermaidCode}
              result={result}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function UmlPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--text-muted)]">Loading UML engine...</div>}>
      <UmlContent />
    </Suspense>
  );
}
