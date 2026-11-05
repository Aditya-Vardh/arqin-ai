"use client";

import { useState } from "react";
import {
  X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Wand2, ShieldCheck, Activity, Cpu, Zap, Code2, Bot, Layers
} from "lucide-react";
import type { ArchitectureGraph } from "@/lib/graph/types";
import { evaluateUnifiedIntelligence } from "@/lib/intelligence/engine";
import { analyzeComponentFailurePath } from "@/lib/intelligence/failure";
import { optimizeArchitecture } from "@/lib/optimizer/optimizer";

type Props = {
  graph: ArchitectureGraph | null;
  onClose: () => void;
  onGeneratePrompt: (prompt: string) => Promise<void>;
  onHighlightNodes: (nodeIds: string[]) => void;
  onApplyOptimization: () => void;
  onOpenArtifacts: () => void;
  onOpenCopilot: () => void;
};

const STEPS = [
  { id: 1, name: "Design", icon: Wand2 },
  { id: 2, name: "Generate", icon: Sparkles },
  { id: 3, name: "Understand", icon: Layers },
  { id: 4, name: "Analyze", icon: ShieldCheck },
  { id: 5, name: "Failure", icon: Activity },
  { id: 6, name: "Simulate", icon: Cpu },
  { id: 7, name: "Optimize", icon: Zap },
  { id: 8, name: "Compare", icon: CheckCircle2 },
  { id: 9, name: "Artifacts", icon: Code2 },
  { id: 10, name: "Ask Arqin", icon: Bot },
];

export default function GuidedJourneyModal({
  graph, onClose, onGeneratePrompt, onHighlightNodes, onApplyOptimization, onOpenArtifacts, onOpenCopilot,
}: Props) {
  const [currentStep, setCurrentStep] = useState(graph ? 2 : 1);
  const [promptInput, setPromptInput] = useState("Design a high-scale video streaming platform with upload, transcoding, recommendations, and multi-device playback.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simUsers, setSimUsers] = useState(1_000_000);
  const [simRps, setSimRps] = useState(25_000);
  const [selectedFailureNodeId, setSelectedFailureNodeId] = useState<string>("");

  const intel = graph ? evaluateUnifiedIntelligence(graph) : null;
  const effectiveFailureNodeId = selectedFailureNodeId || graph?.nodes[0]?.id || "";
  const failurePath = graph && effectiveFailureNodeId
    ? analyzeComponentFailurePath(graph, effectiveFailureNodeId)
    : null;

  const optResult = graph ? optimizeArchitecture(graph) : null;

  async function handleContinue() {
    if (currentStep === 1) {
      setLoading(true);
      setError(null);
      try {
        await onGeneratePrompt(promptInput);
        setCurrentStep(2);
      } catch {
        setError("Architecture synthesis failed. Check your connection and retry.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStep === 3 && graph) {
      onHighlightNodes(graph.nodes.slice(0, Math.min(3, graph.nodes.length)).map((n) => n.id));
    }

    if (currentStep === 5 && failurePath) {
      onHighlightNodes([failurePath.sourceNodeId, ...failurePath.directlyAffectedNodeIds]);
    }

    if (currentStep === 7) {
      onApplyOptimization();
    }

    if (currentStep === 9) {
      onOpenArtifacts();
    }

    if (currentStep === 10) {
      onOpenCopilot();
      onClose();
      return;
    }

    setCurrentStep((s) => Math.min(10, s + 1));
  }

  const needsGraph = currentStep >= 2 && !graph;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl">
      <div className="flex h-[90vh] w-[94vw] max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--accent)]/25 bg-[var(--background)] text-[var(--text-primary)] shadow-[0_0_90px_rgba(0,0,0,0.9)]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--accent)]/15 bg-[var(--background)] px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-[#A08050] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[var(--background)]">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-[var(--text-primary)] truncate">Arqin Guided Architecture Journey</h2>
              <p className="text-[11px] text-[var(--text-muted)] truncate">Design &rarr; Generate &rarr; Analyze &rarr; Simulate &rarr; Optimize &rarr; Deploy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 shrink-0 rounded-xl border border-[var(--accent)]/15 bg-[var(--background)] p-2 text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Rail  --  wraps on small screens, no overflow */}
        <div className="shrink-0 border-b border-[var(--accent)]/10 bg-[var(--background-2)] px-4 py-2">
          <div className="flex flex-wrap gap-1">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.id;
              const isDone = currentStep > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id === 1 || graph) setCurrentStep(s.id);
                  }}
                  disabled={s.id > 1 && !graph}
                  className={`flex items-center gap-1.5 font-mono text-[10px] whitespace-nowrap px-2.5 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "border border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-bold"
                      : isDone
                      ? "text-[var(--text-muted)] opacity-80"
                      : "text-[var(--text-faint)] opacity-50"
                  } disabled:cursor-not-allowed`}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="h-3 w-3 text-[var(--accent)]" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span>{s.id < 10 ? `0${s.id}` : s.id}. {s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto bg-[var(--background-2)] p-8">
          {needsGraph && (
            <div className="max-w-xl mx-auto text-center py-10 space-y-4">
              <p className="text-sm text-amber-400 font-bold">Generate an architecture first (Step 01).</p>
              <button type="button" onClick={() => setCurrentStep(1)} className="rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-bold text-[var(--on-accent)]">
                Back to Design
              </button>
            </div>
          )}

          {!needsGraph && (
            <>
              {/* STEP 1: DESIGN */}
              {currentStep === 1 && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">STEP 01  --  SYSTEM DESIGN</span>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Describe Your System Architecture</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Enter your natural language system requirements. Arqin will synthesize a production-ready architecture topology.
                    </p>
                  </div>
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    rows={4}
                    className="input-focus-ring w-full resize-none rounded-2xl border border-[var(--accent)]/20 bg-[var(--background)] p-4 text-xs leading-relaxed text-[var(--text-primary)] outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-mono text-[var(--text-faint)]">Starter blueprints:</span>
                    {[
                      "Design an E-Commerce platform with PostgreSQL, Redis cache, Stripe payments, and Kafka event queues.",
                      "Design a real-time ride-sharing platform with geolocation, driver matching, and payment processing.",
                    ].map((bp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPromptInput(bp)}
                        className="rounded-lg border border-[var(--accent)]/15 bg-[var(--background)] px-3 py-1 text-[10px] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                      >
                        {bp.slice(0, 50)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: GENERATED */}
              {currentStep === 2 && graph && (
                <div className="max-w-xl mx-auto text-center space-y-5 py-6">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Architecture Topology Generated!</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Synthesized <strong className="text-[var(--accent)]">{graph.nodes.length} component(s)</strong> and{" "}
                    <strong className="text-[var(--accent)]">{graph.edges.length} dependency edge(s)</strong> for{" "}
                    <em className="text-[var(--text-primary)]">{graph.title}</em>.
                  </p>
                </div>
              )}

              {/* STEP 3: UNDERSTAND */}
              {currentStep === 3 && graph && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">STEP 03  --  UNDERSTAND TOPOLOGY</span>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">{graph.title}  --  Component Inventory</h3>
                    <p className="text-xs text-[var(--text-muted)]">All components derived from the canonical ArchitectureGraph:</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {graph.nodes.map((node) => (
                      <div key={node.id} className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-4 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-[var(--text-primary)] truncate">{node.name}</span>
                          <span className="shrink-0 rounded bg-[var(--accent)]/20 px-2 py-0.5 font-mono text-[9px] font-bold text-[var(--accent)] uppercase">{node.type}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">{node.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: ANALYZE */}
              {currentStep === 4 && intel && graph && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">STEP 04  --  HEALTH &amp; RISK ANALYSIS</span>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                      Unified Health Score: <span className="text-[var(--accent)]">{intel.overallHealthScore}</span> / 100
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Scalability", val: intel.dimensionScores.scalability },
                      { label: "Reliability", val: intel.dimensionScores.reliability },
                      { label: "Security", val: intel.dimensionScores.security },
                      { label: "Observability", val: intel.dimensionScores.observability },
                    ].map(({ label, val }) => (
                      <div key={label} className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-4">
                        <p className="font-mono text-[10px] text-[var(--text-faint)]">{label}</p>
                        <p className="font-mono text-lg font-bold text-[var(--accent)]">{val}%</p>
                      </div>
                    ))}
                  </div>
                  {intel.findings.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-mono text-xs font-bold text-[var(--accent)]">Detected Findings ({intel.findings.length})</p>
                      {intel.findings.slice(0, 4).map((f) => (
                        <div key={f.id} className="rounded-xl border border-rose-500/20 bg-[var(--background)] p-3 text-xs space-y-1">
                          <p className="font-bold text-[var(--text-primary)]">{f.title}</p>
                          <p className="text-[var(--text-muted)]">{f.description}</p>
                        </div>
                      ))}
                      {intel.findings.length > 4 && (
                        <p className="text-[11px] text-[var(--text-faint)]">+{intel.findings.length - 4} more findings visible in Inspector &rarr; Security / Reliability tabs.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: FAILURE ANALYSIS */}
              {currentStep === 5 && graph && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-amber-400">STEP 05  --  FAILURE-PATH ANALYSIS</span>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">What happens if a component fails?</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[var(--text-faint)]">Select component to simulate failure:</label>
                    <select
                      value={effectiveFailureNodeId}
                      onChange={(e) => setSelectedFailureNodeId(e.target.value)}
                      className="w-full rounded-xl border border-[var(--accent)]/20 bg-[var(--background)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      {graph.nodes.map((n) => (
                        <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
                      ))}
                    </select>
                  </div>

                  {failurePath && (
                    <div className="rounded-2xl border border-amber-500/30 bg-[var(--background)] p-5 space-y-3">
                      <p className="font-mono text-xs text-amber-400 font-bold">Cascading Chain for {failurePath.sourceNodeName}:</p>
                      {failurePath.cascadingChain.length > 0 ? (
                        <p className="font-mono text-xs text-[var(--accent)]">{failurePath.cascadingChain.join("  ->  ")}</p>
                      ) : (
                        <p className="font-mono text-xs text-[var(--text-faint)]">No dependent path detected.</p>
                      )}
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{failurePath.explanation}</p>
                      <div className="border-t border-[var(--accent)]/10 pt-2 text-xs text-[var(--accent)]">
                        ðŸ’¡ {failurePath.resilienceRecommendation}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: SIMULATE */}
              {currentStep === 6 && graph && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">STEP 06  --  WHAT-IF STRESS SIMULATION</span>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Traffic Stress Simulation</h3>
                    <p className="text-xs text-[var(--text-muted)]">Adjust parameters to model different load scenarios against the current architecture topology.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-[var(--text-muted)]">Concurrent Users</label>
                      <input
                        type="number"
                        value={simUsers}
                        onChange={(e) => setSimUsers(Number(e.target.value))}
                        min={1000}
                        className="w-full rounded-xl border border-[var(--accent)]/20 bg-[var(--background)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-[var(--text-muted)]">Peak Requests / Second (RPS)</label>
                      <input
                        type="number"
                        value={simRps}
                        onChange={(e) => setSimRps(Number(e.target.value))}
                        min={100}
                        className="w-full rounded-xl border border-[var(--accent)]/20 bg-[var(--background)] p-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--background)] p-5 space-y-2">
                    <p className="font-mono text-[10px] font-bold text-[var(--accent)] uppercase">Architecture-Level Estimate</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      At <strong className="text-[var(--text-primary)]">{simUsers.toLocaleString()} concurrent users</strong> and{" "}
                      <strong className="text-[var(--text-primary)]">{simRps.toLocaleString()} RPS</strong>, the analysis evaluates
                      persistence read queue depth, thread pool saturation, and database fan-in bottlenecks across{" "}
                      <strong className="text-[var(--text-primary)]">{graph.nodes.length} graph components</strong>.
                    </p>
                    {!graph.nodes.some((n) => n.type === "cache") && simRps > 5000 && (
                      <p className="text-xs text-amber-400">
                         No cache layer detected -- database components may experience I/O saturation at this RPS level.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 7: OPTIMIZE */}
              {currentStep === 7 && optResult && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">STEP 07  --  ARCHITECTURE OPTIMIZATION</span>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Optimization Analysis</h3>
                  </div>

                  <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--background)] p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)]">Before:</span>
                      <span className="font-mono text-base font-bold text-[var(--text-primary)]">{optResult.originalHealth}/100</span>
                      <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                      <span className="text-xs text-[var(--text-muted)]">After:</span>
                      <span className="font-mono text-base font-bold text-[var(--accent)]">{optResult.optimizedHealth}/100</span>
                      {optResult.optimizedHealth - optResult.originalHealth > 0 && (
                        <span className="rounded bg-[var(--accent)] px-2 py-0.5 text-[11px] font-bold text-[var(--on-accent)]">
                          +{optResult.optimizedHealth - optResult.originalHealth} pts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{optResult.explanation}</p>
                  </div>

                  {optResult.changes.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-mono text-xs text-[var(--accent)] font-bold">Applied Changes ({optResult.changes.length}):</p>
                      {optResult.changes.map((c) => (
                        <div key={c.id} className="rounded-xl border border-[var(--accent)]/15 bg-[var(--background)] p-3 text-xs space-y-1">
                          <p className="font-bold text-[var(--text-primary)]">{c.title}</p>
                          <p className="text-[var(--text-muted)]">{c.description}</p>
                          <p className="text-[var(--accent)] text-[10px]">Benefit: {c.expectedBenefit}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 8: COMPARE */}
              {currentStep === 8 && optResult && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">STEP 08  --  VERSION COMPARISON</span>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Before vs After Architecture</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-4 space-y-2">
                      <p className="font-mono text-[10px] text-[var(--text-faint)] uppercase">Original</p>
                      <p className="font-mono text-xl font-bold text-[var(--text-muted)]">{optResult.originalHealth}/100</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{optResult.originalGraph.nodes.length} components</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--background)] p-4 space-y-2">
                      <p className="font-mono text-[10px] text-[var(--accent)] uppercase">Optimized</p>
                      <p className="font-mono text-xl font-bold text-[var(--accent)]">{optResult.optimizedHealth}/100</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{optResult.optimizedGraph.nodes.length} components (+{optResult.changes.length} changes)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: ARTIFACTS */}
              {currentStep === 9 && graph && (
                <div className="max-w-2xl mx-auto text-center space-y-5 py-6">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)]">
                      <Code2 className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Implementation Artifacts</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Derived from the current <strong className="text-[var(--text-primary)]">{graph.title}</strong> graph ({graph.nodes.length} components):<br />
                    <code className="text-[var(--accent)]">docker-compose.yml</code>, <code className="text-[var(--accent)]">schema.sql</code>,{" "}
                    <code className="text-[var(--accent)]">openapi.json</code>, <code className="text-[var(--accent)]">k8s-deployment.yaml</code>
                  </p>
                  <p className="text-[11px] text-[var(--text-faint)]">Click Continue to open the full Artifacts panel with Copy &amp; Download buttons.</p>
                </div>
              )}

              {/* STEP 10: ASK ARQEN */}
              {currentStep === 10 && (
                <div className="max-w-2xl mx-auto text-center space-y-5 py-6">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)]">
                      <Bot className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Architecture Journey Complete!</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {graph
                      ? `Your ${graph.title} architecture is analyzed, optimized, and artifact-ready. Launch the AI Copilot to query your system graph.`
                      : "Launch the AI Copilot to query your architecture."}
                  </p>
                  <p className="font-mono text-xs font-bold text-[var(--accent)]">Design. Analyze. Optimize. Evolve.</p>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
              {error}{" "}
              <button
                type="button"
                onClick={() => { setError(null); handleContinue(); }}
                className="ml-2 underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[var(--accent)]/15 bg-[var(--background)] px-6 py-4">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 rounded-xl border border-[var(--accent)]/15 bg-[var(--background-2)] px-4 py-2 text-xs font-bold text-[var(--text-muted)] disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--accent)]/15 bg-[var(--background-2)] px-4 py-2 text-xs font-bold text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
            >
              Exit Journey
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={loading || needsGraph}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[#A08050] px-6 py-2 text-xs font-bold text-[var(--on-accent)] shadow-[0_0_20px_rgba(214,173,105,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="animate-pulse">Synthesizing...</span>
              ) : (
                <>
                  <span>{currentStep === 10 ? "Launch Copilot & Finish" : "Continue"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
