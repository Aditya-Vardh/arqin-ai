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
      <div className="flex h-[90vh] w-[94vw] max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#D6AD69]/25 bg-[#101216] text-[#F0F1F3] shadow-[0_0_90px_rgba(0,0,0,0.9)]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#D6AD69]/15 bg-[#101216] px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D6AD69] via-[#D6AD69] to-[#A08050] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#101216]">
                <Sparkles className="h-4 w-4 text-[#D6AD69]" />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-[#F0F1F3] truncate">Arqin Guided Architecture Journey</h2>
              <p className="text-[11px] text-[#A4AAB5] truncate">Design &rarr; Generate &rarr; Analyze &rarr; Simulate &rarr; Optimize &rarr; Deploy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 shrink-0 rounded-xl border border-[#D6AD69]/15 bg-[#101216] p-2 text-[#4A5060] hover:text-[#F0F1F3] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Rail  --  wraps on small screens, no overflow */}
        <div className="shrink-0 border-b border-[#D6AD69]/10 bg-[#0C0E12] px-4 py-2">
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
                      ? "border border-[#D6AD69] bg-[#D6AD69]/15 text-[#D6AD69] font-bold"
                      : isDone
                      ? "text-[#A4AAB5] opacity-80"
                      : "text-[#4A5060] opacity-50"
                  } disabled:cursor-not-allowed`}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="h-3 w-3 text-[#D6AD69]" />
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
        <div className="flex-1 overflow-y-auto bg-[#0C0E12] p-8">
          {needsGraph && (
            <div className="max-w-xl mx-auto text-center py-10 space-y-4">
              <p className="text-sm text-amber-400 font-bold">Generate an architecture first (Step 01).</p>
              <button type="button" onClick={() => setCurrentStep(1)} className="rounded-xl bg-[#D6AD69] px-5 py-2 text-xs font-bold text-[#101216]">
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
                    <span className="font-mono text-xs font-bold text-[#D6AD69]">STEP 01  --  SYSTEM DESIGN</span>
                    <h3 className="text-2xl font-extrabold text-[#F0F1F3]">Describe Your System Architecture</h3>
                    <p className="text-xs text-[#A4AAB5] leading-relaxed">
                      Enter your natural language system requirements. Arqin will synthesize a production-ready architecture topology.
                    </p>
                  </div>
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    rows={4}
                    className="input-focus-ring w-full resize-none rounded-2xl border border-[#D6AD69]/20 bg-[#101216] p-4 text-xs leading-relaxed text-[#F0F1F3] outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-mono text-[#4A5060]">Starter blueprints:</span>
                    {[
                      "Design an E-Commerce platform with PostgreSQL, Redis cache, Stripe payments, and Kafka event queues.",
                      "Design a real-time ride-sharing platform with geolocation, driver matching, and payment processing.",
                    ].map((bp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPromptInput(bp)}
                        className="rounded-lg border border-[#D6AD69]/15 bg-[#101216] px-3 py-1 text-[10px] text-[#A4AAB5] hover:border-[#D6AD69] hover:text-[#D6AD69] transition-colors"
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
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#D6AD69]/10 border border-[#D6AD69]/30 text-[#D6AD69]">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#F0F1F3]">Architecture Topology Generated!</h3>
                  <p className="text-xs text-[#A4AAB5] leading-relaxed">
                    Synthesized <strong className="text-[#D6AD69]">{graph.nodes.length} component(s)</strong> and{" "}
                    <strong className="text-[#D6AD69]">{graph.edges.length} dependency edge(s)</strong> for{" "}
                    <em className="text-[#F0F1F3]">{graph.title}</em>.
                  </p>
                </div>
              )}

              {/* STEP 3: UNDERSTAND */}
              {currentStep === 3 && graph && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[#D6AD69]">STEP 03  --  UNDERSTAND TOPOLOGY</span>
                    <h3 className="text-2xl font-extrabold text-[#F0F1F3]">{graph.title}  --  Component Inventory</h3>
                    <p className="text-xs text-[#A4AAB5]">All components derived from the canonical ArchitectureGraph:</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {graph.nodes.map((node) => (
                      <div key={node.id} className="rounded-2xl border border-[#D6AD69]/15 bg-[#101216] p-4 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-[#F0F1F3] truncate">{node.name}</span>
                          <span className="shrink-0 rounded bg-[#D6AD69]/20 px-2 py-0.5 font-mono text-[9px] font-bold text-[#D6AD69] uppercase">{node.type}</span>
                        </div>
                        <p className="text-[11px] text-[#A4AAB5] line-clamp-2">{node.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: ANALYZE */}
              {currentStep === 4 && intel && graph && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[#D6AD69]">STEP 04  --  HEALTH &amp; RISK ANALYSIS</span>
                    <h3 className="text-2xl font-extrabold text-[#F0F1F3]">
                      Unified Health Score: <span className="text-[#D6AD69]">{intel.overallHealthScore}</span> / 100
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Scalability", val: intel.dimensionScores.scalability },
                      { label: "Reliability", val: intel.dimensionScores.reliability },
                      { label: "Security", val: intel.dimensionScores.security },
                      { label: "Observability", val: intel.dimensionScores.observability },
                    ].map(({ label, val }) => (
                      <div key={label} className="rounded-2xl border border-[#D6AD69]/15 bg-[#101216] p-4">
                        <p className="font-mono text-[10px] text-[#4A5060]">{label}</p>
                        <p className="font-mono text-lg font-bold text-[#D6AD69]">{val}%</p>
                      </div>
                    ))}
                  </div>
                  {intel.findings.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-mono text-xs font-bold text-[#D6AD69]">Detected Findings ({intel.findings.length})</p>
                      {intel.findings.slice(0, 4).map((f) => (
                        <div key={f.id} className="rounded-xl border border-rose-500/20 bg-[#101216] p-3 text-xs space-y-1">
                          <p className="font-bold text-[#F0F1F3]">{f.title}</p>
                          <p className="text-[#A4AAB5]">{f.description}</p>
                        </div>
                      ))}
                      {intel.findings.length > 4 && (
                        <p className="text-[11px] text-[#4A5060]">+{intel.findings.length - 4} more findings visible in Inspector &rarr; Security / Reliability tabs.</p>
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
                    <h3 className="text-2xl font-extrabold text-[#F0F1F3]">What happens if a component fails?</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[#4A5060]">Select component to simulate failure:</label>
                    <select
                      value={effectiveFailureNodeId}
                      onChange={(e) => setSelectedFailureNodeId(e.target.value)}
                      className="w-full rounded-xl border border-[#D6AD69]/20 bg-[#101216] p-2.5 text-xs text-[#F0F1F3] outline-none focus:border-[#D6AD69]"
                    >
                      {graph.nodes.map((n) => (
                        <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
                      ))}
                    </select>
                  </div>

                  {failurePath && (
                    <div className="rounded-2xl border border-amber-500/30 bg-[#101216] p-5 space-y-3">
                      <p className="font-mono text-xs text-amber-400 font-bold">Cascading Chain for {failurePath.sourceNodeName}:</p>
                      {failurePath.cascadingChain.length > 0 ? (
                        <p className="font-mono text-xs text-[#D6AD69]">{failurePath.cascadingChain.join("  ->  ")}</p>
                      ) : (
                        <p className="font-mono text-xs text-[#4A5060]">No dependent path detected.</p>
                      )}
                      <p className="text-xs text-[#A4AAB5] leading-relaxed">{failurePath.explanation}</p>
                      <div className="border-t border-[#D6AD69]/10 pt-2 text-xs text-[#D6AD69]">
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
                    <span className="font-mono text-xs font-bold text-[#D6AD69]">STEP 06  --  WHAT-IF STRESS SIMULATION</span>
                    <h3 className="text-2xl font-extrabold text-[#F0F1F3]">Traffic Stress Simulation</h3>
                    <p className="text-xs text-[#A4AAB5]">Adjust parameters to model different load scenarios against the current architecture topology.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-[#A4AAB5]">Concurrent Users</label>
                      <input
                        type="number"
                        value={simUsers}
                        onChange={(e) => setSimUsers(Number(e.target.value))}
                        min={1000}
                        className="w-full rounded-xl border border-[#D6AD69]/20 bg-[#101216] p-2.5 text-xs text-[#F0F1F3] outline-none focus:border-[#D6AD69]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-[#A4AAB5]">Peak Requests / Second (RPS)</label>
                      <input
                        type="number"
                        value={simRps}
                        onChange={(e) => setSimRps(Number(e.target.value))}
                        min={100}
                        className="w-full rounded-xl border border-[#D6AD69]/20 bg-[#101216] p-2.5 text-xs text-[#F0F1F3] outline-none focus:border-[#D6AD69]"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#D6AD69]/30 bg-[#101216] p-5 space-y-2">
                    <p className="font-mono text-[10px] font-bold text-[#D6AD69] uppercase">Architecture-Level Estimate</p>
                    <p className="text-xs text-[#A4AAB5] leading-relaxed">
                      At <strong className="text-[#F0F1F3]">{simUsers.toLocaleString()} concurrent users</strong> and{" "}
                      <strong className="text-[#F0F1F3]">{simRps.toLocaleString()} RPS</strong>, the analysis evaluates
                      persistence read queue depth, thread pool saturation, and database fan-in bottlenecks across{" "}
                      <strong className="text-[#F0F1F3]">{graph.nodes.length} graph components</strong>.
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
                    <span className="font-mono text-xs font-bold text-[#D6AD69]">STEP 07  --  ARCHITECTURE OPTIMIZATION</span>
                    <h3 className="text-2xl font-extrabold text-[#F0F1F3]">Optimization Analysis</h3>
                  </div>

                  <div className="rounded-2xl border border-[#D6AD69]/30 bg-[#101216] p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#A4AAB5]">Before:</span>
                      <span className="font-mono text-base font-bold text-[#F0F1F3]">{optResult.originalHealth}/100</span>
                      <ArrowRight className="h-4 w-4 text-[#D6AD69]" />
                      <span className="text-xs text-[#A4AAB5]">After:</span>
                      <span className="font-mono text-base font-bold text-[#D6AD69]">{optResult.optimizedHealth}/100</span>
                      {optResult.optimizedHealth - optResult.originalHealth > 0 && (
                        <span className="rounded bg-[#D6AD69] px-2 py-0.5 text-[11px] font-bold text-[#101216]">
                          +{optResult.optimizedHealth - optResult.originalHealth} pts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A4AAB5]">{optResult.explanation}</p>
                  </div>

                  {optResult.changes.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-mono text-xs text-[#D6AD69] font-bold">Applied Changes ({optResult.changes.length}):</p>
                      {optResult.changes.map((c) => (
                        <div key={c.id} className="rounded-xl border border-[#D6AD69]/15 bg-[#101216] p-3 text-xs space-y-1">
                          <p className="font-bold text-[#F0F1F3]">{c.title}</p>
                          <p className="text-[#A4AAB5]">{c.description}</p>
                          <p className="text-[#D6AD69] text-[10px]">Benefit: {c.expectedBenefit}</p>
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
                    <span className="font-mono text-xs font-bold text-[#D6AD69]">STEP 08  --  VERSION COMPARISON</span>
                    <h3 className="text-2xl font-extrabold text-[#F0F1F3]">Before vs After Architecture</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-[#D6AD69]/15 bg-[#101216] p-4 space-y-2">
                      <p className="font-mono text-[10px] text-[#4A5060] uppercase">Original</p>
                      <p className="font-mono text-xl font-bold text-[#A4AAB5]">{optResult.originalHealth}/100</p>
                      <p className="text-[11px] text-[#A4AAB5]">{optResult.originalGraph.nodes.length} components</p>
                    </div>
                    <div className="rounded-2xl border border-[#D6AD69]/30 bg-[#101216] p-4 space-y-2">
                      <p className="font-mono text-[10px] text-[#D6AD69] uppercase">Optimized</p>
                      <p className="font-mono text-xl font-bold text-[#D6AD69]">{optResult.optimizedHealth}/100</p>
                      <p className="text-[11px] text-[#A4AAB5]">{optResult.optimizedGraph.nodes.length} components (+{optResult.changes.length} changes)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: ARTIFACTS */}
              {currentStep === 9 && graph && (
                <div className="max-w-2xl mx-auto text-center space-y-5 py-6">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#D6AD69]/20 border border-[#D6AD69] text-[#D6AD69]">
                      <Code2 className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#F0F1F3]">Implementation Artifacts</h3>
                  <p className="text-xs text-[#A4AAB5] leading-relaxed">
                    Derived from the current <strong className="text-[#F0F1F3]">{graph.title}</strong> graph ({graph.nodes.length} components):<br />
                    <code className="text-[#D6AD69]">docker-compose.yml</code>, <code className="text-[#D6AD69]">schema.sql</code>,{" "}
                    <code className="text-[#D6AD69]">openapi.json</code>, <code className="text-[#D6AD69]">k8s-deployment.yaml</code>
                  </p>
                  <p className="text-[11px] text-[#4A5060]">Click Continue to open the full Artifacts panel with Copy &amp; Download buttons.</p>
                </div>
              )}

              {/* STEP 10: ASK ARQEN */}
              {currentStep === 10 && (
                <div className="max-w-2xl mx-auto text-center space-y-5 py-6">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#D6AD69]/20 border border-[#D6AD69] text-[#D6AD69]">
                      <Bot className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#F0F1F3]">Architecture Journey Complete!</h3>
                  <p className="text-xs text-[#A4AAB5] leading-relaxed">
                    {graph
                      ? `Your ${graph.title} architecture is analyzed, optimized, and artifact-ready. Launch the AI Copilot to query your system graph.`
                      : "Launch the AI Copilot to query your architecture."}
                  </p>
                  <p className="font-mono text-xs font-bold text-[#D6AD69]">Design. Analyze. Optimize. Evolve.</p>
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
        <div className="flex shrink-0 items-center justify-between border-t border-[#D6AD69]/15 bg-[#101216] px-6 py-4">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 rounded-xl border border-[#D6AD69]/15 bg-[#0C0E12] px-4 py-2 text-xs font-bold text-[#A4AAB5] disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#D6AD69]/15 bg-[#0C0E12] px-4 py-2 text-xs font-bold text-[#4A5060] hover:text-[#F0F1F3] transition-colors"
            >
              Exit Journey
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={loading || needsGraph}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D6AD69] via-[#D6AD69] to-[#A08050] px-6 py-2 text-xs font-bold text-[#101216] shadow-[0_0_20px_rgba(214, 173, 105,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
