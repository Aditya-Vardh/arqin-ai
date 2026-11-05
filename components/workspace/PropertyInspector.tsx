"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Boxes,
  ChevronDown,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Layers,
  DollarSign,
  Activity,
  Sparkles,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
  Network,
  Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ArchitectureResult } from "@/lib/storage/types";
import type { ArchitectureGraph } from "@/lib/graph/types";
import { evaluateUnifiedIntelligence } from "@/lib/intelligence/engine";
import { analyzeComponentFailurePath } from "@/lib/intelligence/failure";

type Tab =
  | "overview"
  | "security"
  | "reliability"
  | "failure"
  | "observability"
  | "patterns"
  | "cost"
  | "recommendations";

const TABS: {
  id: Tab;
  label: string;
  short: string;
  icon: LucideIcon;
}[] = [
    {
      id: "overview",
      label: "Overview",
      short: "Overview",
      icon: LayoutGrid,
    },
    {
      id: "security",
      label: "Security",
      short: "Security",
      icon: ShieldCheck,
    },
    {
      id: "reliability",
      label: "Reliability",
      short: "Reliability",
      icon: ShieldAlert,
    },
    {
      id: "failure",
      label: "Failure Analysis",
      short: "Failure",
      icon: Activity,
    },
    {
      id: "observability",
      label: "Observability",
      short: "Observe",
      icon: Eye,
    },
    {
      id: "patterns",
      label: "Patterns",
      short: "Patterns",
      icon: Layers,
    },
    {
      id: "cost",
      label: "Cost Intelligence",
      short: "Cost",
      icon: DollarSign,
    },
    {
      id: "recommendations",
      label: "Recommendations",
      short: "Recs",
      icon: Zap,
    },
  ];

type Props = {
  result: ArchitectureResult | null;
  graph?: ArchitectureGraph | null;
  selectedComponent: string | null;
  onSelectComponent: (name: string | null) => void;
  onRefine: (instruction: string) => void;
  onOptimize?: () => void;
  onSimulate?: () => void;
  onArtifacts?: () => void;
  onSelectRiskNodes?: (nodeIds: string[]) => void;
  onApplyMutation?: (mutationType: string, targetId?: string) => void;
  loading?: boolean;
  className?: string;
};

function ScoreRing({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative h-[112px] w-[112px] shrink-0">
      <svg
        viewBox="0 0 112 112"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="#1D222A"
          strokeWidth="7"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="#D6AD69"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[31px] font-bold leading-none text-[var(--text-primary)]">
          {safeScore}
        </span>
        <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]/70">
          health
        </span>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] text-[var(--text-muted)]">
          {label}
        </span>
        <span className="font-mono text-[10px] font-bold text-[#D6AD69]">
          {safeValue}%
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-[var(--background)]">
        <div
          className="h-full rounded-full bg-[#D6AD69] transition-[width] duration-700 ease-out"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function FindingCard({
  title,
  description,
  recommendation,
  severity,
  onClick,
}: {
  title: string;
  description: string;
  recommendation: string;
  severity?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-[#A4AAB5]/12 bg-[var(--surface)] p-4 text-left transition-all duration-200 hover:border-[#D6AD69]/40 hover:bg-[var(--surface-elevated)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#D6AD69]/30 bg-[var(--surface-elevated)]">
            <CircleAlert className="h-3.5 w-3.5 text-[#D6AD69]" />
          </span>
          <span className="text-[11px] font-bold leading-snug text-[var(--text-primary)]">
            {title}
          </span>
        </div>

        {severity && (
          <span className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em] ${
            (severity === "CRITICAL" || severity === "HIGH")
              ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
              : severity === "MEDIUM"
              ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
              : severity === "LOW"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-[#D6AD69]/30 bg-[#D6AD69]/10 text-[#D6AD69]"
          }`}>
            {severity}
          </span>
        )}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-[var(--text-muted)]">
        {description}
      </p>

      <div className="mt-3 flex items-start gap-2 border-t border-[#A4AAB5]/10 pt-3">
        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[#D6AD69]" />
        <span className="text-[9px] leading-relaxed text-[var(--text-muted)]">
          {recommendation}
        </span>
      </div>
    </button>
  );
}

export default function PropertyInspector({
  result,
  graph,
  selectedComponent,
  onSelectComponent,
  onRefine,
  onOptimize,
  onSimulate,
  onArtifacts,
  onSelectRiskNodes,
  onApplyMutation,
  loading,
  className = "",
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedFailureNodeId, setSelectedFailureNodeId] =
    useState<string>("");

  if (!result || !graph) {
    return (
      <aside
        className={`flex h-full w-full flex-col bg-[var(--background)] ${className}`}
      >
        <div className="flex h-full flex-col items-center justify-center px-7 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#A4AAB5]/12 bg-[var(--surface)]">
            <Boxes className="h-6 w-6 text-[#D6AD69]" />
          </div>

          <p className="font-[var(--font-space-grotesk)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#D6AD69]">
            Arqin Intelligence
          </p>

          <h3 className="mt-2 font-[var(--font-space-grotesk)] text-sm font-bold text-[var(--text-primary)]">
            Architecture Inspector
          </h3>

          <p className="mt-2 max-w-[230px] font-[var(--font-inter)] text-[10px] leading-relaxed text-[var(--text-muted)]/70">
            Generate an architecture graph to inspect security, reliability,
            failure paths, patterns, and cost intelligence.
          </p>
        </div>
      </aside>
    );
  }

  const unifiedIntel = evaluateUnifiedIntelligence(graph);

  const effectiveFailureId =
    selectedFailureNodeId ||
    graph.nodes[0]?.id ||
    "";

  const failurePathResult = effectiveFailureId
    ? analyzeComponentFailurePath(
      graph,
      effectiveFailureId,
    )
    : null;

  const component = selectedComponent
    ? result.explanation.components.find(
      (item) => item.name === selectedComponent,
    )
    : null;

  const activeTab = TABS.find(
    (item) => item.id === tab,
  )!;

  const score = unifiedIntel.overallHealthScore;

  return (
    <aside
      className={`flex h-full w-full min-w-0 flex-col overflow-hidden bg-[var(--background)] text-[var(--text-primary)] ${className}`}
    >
      <div className="shrink-0 border-b border-[#A4AAB5]/12 bg-[var(--background)]">
        <div className="flex min-h-[82px] items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#A4AAB5]/12 bg-[var(--surface)]">
                <Network className="h-3.5 w-3.5 text-[#D6AD69]" />
              </span>

              <div className="min-w-0">
                <p className="font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.2em] text-[#D6AD69]">
                  Intelligence
                </p>

                <h2 className="mt-0.5 truncate font-[var(--font-space-grotesk)] text-[13px] font-bold text-[var(--text-primary)]">
                  Architecture Inspector
                </h2>
              </div>
            </div>

            <p className="mt-2 truncate pl-9 font-[var(--font-inter)] text-[9px] text-[var(--text-muted)]/70">
              {graph.title}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(!mobileOpen)
            }
            className="flex h-8 shrink-0 items-center gap-2 rounded-xl border border-[#A4AAB5]/15 bg-[var(--surface)] px-2.5 font-[var(--font-space-grotesk)] text-[9px] font-bold text-[var(--text-primary)] transition-colors hover:border-[#D6AD69]"
          >
            <activeTab.icon className="h-3.5 w-3.5 text-[#D6AD69]" />
            <span className="hidden sm:inline">
              {activeTab.short}
            </span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${mobileOpen
                ? "rotate-180"
                : ""
                }`}
            />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <nav
          className={`flex w-[48px] shrink-0 flex-col items-center gap-1 border-r border-[#A4AAB5]/12 bg-[var(--background-2)] py-2 ${mobileOpen
            ? "absolute left-0 right-0 z-50 w-full flex-row overflow-x-auto border-b"
            : ""
            }`}
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                setMobileOpen(false);
              }}
              title={item.label}
              aria-label={item.label}
              className={`group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${tab === item.id
                ? "border border-[#D6AD69]/40 bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)]/50 hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                }`}
            >
              <item.icon className="h-3.5 w-3.5" />

              {tab === item.id && (
                <span className="absolute left-0 top-2 h-5 w-0.5 rounded-r-full bg-[#D6AD69]" />
              )}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {component && (
              <div className="rounded-2xl border border-[#D6AD69]/30 bg-gradient-to-br from-[#171A20] to-[#0C0E12] p-4 border-l-2 border-l-[var(--accent)] pl-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.16em] text-[#D6AD69]">
                      Selected Component
                    </p>

                    <p className="mt-1 truncate font-[var(--font-space-grotesk)] text-[12px] font-bold text-[var(--text-primary)]">
                      {component.name}
                    </p>
                  </div>

                  <CircleCheck className="h-4 w-4 shrink-0 text-[#D6AD69]" />
                </div>

                <p className="mt-2 font-[var(--font-inter)] text-[9px] leading-relaxed text-[var(--text-muted)]">
                  {component.description}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const match =
                        graph.nodes.find(
                          (node) =>
                            node.name ===
                            component.name,
                        );

                      setSelectedFailureNodeId(
                        match
                          ? match.id
                          : component.name,
                      );
                      setTab("failure");
                    }}
                    className="flex-1 rounded-lg border border-[#A4AAB5]/15 bg-[var(--surface-elevated)] px-2 py-2 font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--text-primary)] transition-colors hover:border-[#D6AD69]/50"
                  >
                    Failure Path
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onApplyMutation?.(
                        "ADD_CACHE",
                        component.name,
                      )
                    }
                    className="flex-1 rounded-lg border border-[#D6AD69]/30 bg-[var(--surface)] px-2 py-2 font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.08em] text-[#D6AD69] transition-colors hover:border-[#D6AD69]"
                  >
                    + Cache
                  </button>
                </div>
              </div>
            )}

            {tab === "overview" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#A4AAB5]/15 bg-gradient-to-br from-[#171A20] via-[#0C0E12] to-[#101216] p-4">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={score} />

                    <div className="min-w-0">
                      <p className="font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.18em] text-[#D6AD69]">
                        Unified Architecture
                      </p>

                      <p className="mt-1 font-[var(--font-space-grotesk)] text-sm font-bold text-[var(--text-primary)]">
                        {score >= 80
                          ? "Healthy foundation"
                          : score >= 60
                            ? "Needs attention"
                            : "Requires review"}
                      </p>

                      <p className="mt-1 font-[var(--font-inter)] text-[9px] leading-relaxed text-[var(--text-muted)]/70">
                        Deterministic analysis across the generated system.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#A4AAB5]/12 pt-4">
                    <Metric
                      label="Scalability"
                      value={
                        unifiedIntel.dimensionScores
                          .scalability
                      }
                    />
                    <Metric
                      label="Reliability"
                      value={
                        unifiedIntel.dimensionScores
                          .reliability
                      }
                    />
                    <Metric
                      label="Security"
                      value={
                        unifiedIntel.dimensionScores
                          .security
                      }
                    />
                    <Metric
                      label="Observability"
                      value={
                        unifiedIntel.dimensionScores
                          .observability
                      }
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#A4AAB5]/12 bg-[var(--background-2)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.16em] text-[#D6AD69]">
                        Findings Inventory
                      </p>
                      <p className="mt-1 font-[var(--font-space-grotesk)] text-lg font-bold text-[var(--text-primary)]">
                        {unifiedIntel.findings.length}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#A4AAB5]/15 bg-[var(--surface-elevated)]">
                      <CircleAlert className="h-4 w-4 text-[#D6AD69]" />
                    </div>
                  </div>

                  <p className="mt-2 font-[var(--font-inter)] text-[9px] leading-relaxed text-[var(--text-muted)]/70">
                    Deterministic findings across security,
                    reliability, and observability.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onOptimize}
                    disabled={loading}
                    className="rounded-xl border border-[#A4AAB5]/15 bg-[var(--surface)] px-3 py-2.5 text-left transition-colors hover:border-[#D6AD69] hover:bg-[var(--surface-elevated)] disabled:opacity-50"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#D6AD69]" />
                    <span className="mt-1.5 block font-[var(--font-space-grotesk)] text-[9px] font-bold text-[var(--text-primary)]">
                      Optimize
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onSimulate}
                    className="rounded-xl border border-[#A4AAB5]/15 bg-[var(--surface)] px-3 py-2.5 text-left transition-colors hover:border-[#D6AD69] hover:bg-[var(--surface-elevated)]"
                  >
                    <Activity className="h-3.5 w-3.5 text-[#D6AD69]" />
                    <span className="mt-1.5 block font-[var(--font-space-grotesk)] text-[9px] font-bold text-[var(--text-primary)]">
                      Simulate
                    </span>
                  </button>
                </div>
              </div>
            )}

            {tab === "security" && (
              <div className="space-y-3">
                <SectionHeading
                  icon={ShieldCheck}
                  title="Security Intelligence"
                  value={
                    unifiedIntel.dimensionScores
                      .security
                  }
                />

                {unifiedIntel.findings
                  .filter(
                    (finding) =>
                      finding.category ===
                      "SECURITY",
                  )
                  .map((finding) => (
                    <FindingCard
                      key={finding.id}
                      title={finding.title}
                      description={
                        finding.description
                      }
                      recommendation={
                        finding.recommendation
                      }
                      severity={
                        finding.severity
                      }
                      onClick={() =>
                        onSelectRiskNodes?.(
                          finding.affectedNodes,
                        )
                      }
                    />
                  ))}
              </div>
            )}

            {tab === "reliability" && (
              <div className="space-y-3">
                <SectionHeading
                  icon={ShieldAlert}
                  title="Reliability Intelligence"
                  value={
                    unifiedIntel.dimensionScores
                      .reliability
                  }
                />

                {unifiedIntel.findings
                  .filter(
                    (finding) =>
                      finding.category ===
                      "RELIABILITY",
                  )
                  .map((finding) => (
                    <FindingCard
                      key={finding.id}
                      title={finding.title}
                      description={
                        finding.description
                      }
                      recommendation={
                        finding.recommendation
                      }
                      severity={
                        finding.severity
                      }
                      onClick={() =>
                        onSelectRiskNodes?.(
                          finding.affectedNodes,
                        )
                      }
                    />
                  ))}
              </div>
            )}

            {tab === "failure" && (
              <div className="space-y-4">
                <SectionHeading
                  icon={Activity}
                  title="Failure-Path Analysis"
                />

                <div>
                  <label className="mb-2 block font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.14em] text-[#D6AD69]">
                    Failure Target
                  </label>

                  <select
                    value={effectiveFailureId}
                    onChange={(event) => {
                      const nodeId =
                        event.target.value;

                      setSelectedFailureNodeId(
                        nodeId,
                      );

                      const failure =
                        analyzeComponentFailurePath(
                          graph,
                          nodeId,
                        );

                      onSelectRiskNodes?.([
                        failure.sourceNodeId,
                        ...failure.directlyAffectedNodeIds,
                      ]);
                    }}
                    className="w-full rounded-xl border border-[#A4AAB5]/15 bg-[var(--surface)] px-3 py-2.5 font-[var(--font-inter)] text-[10px] text-[var(--text-primary)] outline-none focus:border-[#D6AD69]"
                  >
                    {graph.nodes.map((node) => (
                      <option
                        key={node.id}
                        value={node.id}
                      >
                        {node.name} ({node.type})
                      </option>
                    ))}
                  </select>
                </div>

                {failurePathResult && (
                  <div className="rounded-2xl border border-[#A4AAB5]/15 bg-[var(--surface)] p-4">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-[#D6AD69]" />
                      <span className="font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--text-primary)]">
                        {failurePathResult.sourceNodeName}
                      </span>
                    </div>

                    {failurePathResult.cascadingChain
                      .length > 0 ? (
                      <div className="mt-3 rounded-xl border border-[#A4AAB5]/12 bg-[var(--background)] p-3">
                        <p className="font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.14em] text-[#D6AD69]">
                          Cascading Path
                        </p>
                        <p className="mt-2 font-[var(--font-inter)] text-[9px] leading-relaxed text-[var(--text-muted)]">
                          {failurePathResult.cascadingChain.join(
                            "  →  ",
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 font-[var(--font-inter)] text-[9px] text-[var(--text-muted)]/70">
                        No dependent path detected.
                      </p>
                    )}

                    <p className="mt-3 font-[var(--font-inter)] text-[9px] leading-relaxed text-[var(--text-muted)]/80">
                      {failurePathResult.explanation}
                    </p>

                    <div className="mt-3 border-t border-[#A4AAB5]/12 pt-3">
                      <p className="font-[var(--font-inter)] text-[9px] leading-relaxed text-[#D6AD69]">
                        {failurePathResult.resilienceRecommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "observability" && (
              <div className="space-y-3">
                <SectionHeading
                  icon={Eye}
                  title="Observability Telemetry"
                  value={
                    unifiedIntel.dimensionScores
                      .observability
                  }
                />

                {unifiedIntel.findings
                  .filter(
                    (finding) =>
                      finding.category ===
                      "OBSERVABILITY",
                  )
                  .map((finding) => (
                    <FindingCard
                      key={finding.id}
                      title={finding.title}
                      description={
                        finding.description
                      }
                      recommendation={
                        finding.recommendation
                      }
                    />
                  ))}
              </div>
            )}

            {tab === "patterns" && (
              <div className="space-y-3">
                <SectionHeading
                  icon={Layers}
                  title="Detected Patterns"
                  value={
                    unifiedIntel.patterns.length
                  }
                  suffix=""
                />

                {unifiedIntel.patterns.map(
                  (pattern) => (
                    <div
                      key={pattern.id}
                      className="rounded-2xl border border-[#A4AAB5]/12 bg-[var(--background-2)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-[var(--font-space-grotesk)] text-[11px] font-bold text-[var(--text-primary)]">
                          {pattern.name}
                        </span>

                        <span className="rounded-full border border-[#D6AD69]/30 bg-[var(--surface-elevated)] px-2 py-1 font-[var(--font-inter)] text-[8px] font-bold text-[#D6AD69]">
                          {pattern.confidence}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {pattern.evidence.map(
                          (evidence, index) => (
                            <p
                              key={index}
                              className="font-[var(--font-inter)] text-[9px] leading-relaxed text-[var(--text-muted)]"
                            >
                              <span className="mr-1 text-[#D6AD69]">
                                •
                              </span>
                              {evidence}
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {tab === "cost" && (
              <div className="space-y-3">
                <SectionHeading
                  icon={DollarSign}
                  title="Cost Intelligence"
                />

                {unifiedIntel.cost.map(
                  (cost, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#A4AAB5]/12 bg-[var(--background-2)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-[var(--font-inter)] text-[9px] text-[var(--text-muted)]/70">
                          Infrastructure tier
                        </span>

                        <span className="font-[var(--font-space-grotesk)] text-sm font-bold text-[var(--text-primary)]">
                          {cost.costTier}
                        </span>
                      </div>

                      <p className="mt-3 font-[var(--font-inter)] text-[9px] leading-relaxed text-[var(--text-muted)]">
                        {cost.tradeoffExplanation}
                      </p>

                      <div className="mt-4 border-t border-[#A4AAB5]/12 pt-3">
                        <p className="font-[var(--font-space-grotesk)] text-[8px] font-bold uppercase tracking-[0.14em] text-[#D6AD69]">
                          Primary Drivers
                        </p>

                        <div className="mt-2 space-y-1.5">
                          {cost.primaryDrivers.map(
                            (driver, driverIndex) => (
                              <p
                                key={driverIndex}
                                className="font-[var(--font-inter)] text-[9px] text-[var(--text-muted)]"
                              >
                                • {driver}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {tab === "recommendations" && (
              <div className="space-y-3">
                <SectionHeading
                  icon={Zap}
                  title="Recommendations"
                  value={
                    unifiedIntel.recommendations
                      .length
                  }
                  suffix=""
                />

                {unifiedIntel.recommendations.map(
                  (recommendation) => (
                    <div
                      key={recommendation.id}
                      className="rounded-2xl border border-[#D6AD69]/30 bg-gradient-to-br from-[#171A20] to-[#0C0E12] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#D6AD69]/40 bg-[var(--surface-elevated)]">
                          <Sparkles className="h-3.5 w-3.5 text-[#D6AD69]" />
                        </span>

                        <p className="font-[var(--font-space-grotesk)] text-[11px] font-bold leading-snug text-[var(--text-primary)]">
                          {recommendation.title}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2 font-[var(--font-inter)] text-[9px] leading-relaxed text-[var(--text-muted)]">
                        <p>
                          <span className="font-semibold text-[var(--text-primary)]">
                            Problem:
                          </span>{" "}
                          {recommendation.decision.problem}
                        </p>

                        <p>
                          <span className="font-semibold text-[#D6AD69]">
                            Decision:
                          </span>{" "}
                          {recommendation.decision.decision}
                        </p>

                        <p>
                          <span className="font-semibold text-[var(--text-primary)]">
                            Benefit:
                          </span>{" "}
                          {recommendation.decision.benefit}
                        </p>

                        <p>
                          <span className="font-semibold text-[var(--text-muted)]">
                            Trade-off:
                          </span>{" "}
                          {recommendation.decision.tradeoff}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onApplyMutation?.(
                            recommendation.mutationType,
                            recommendation.targetNodeId,
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F0F1F3] py-2.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#101216] transition-all hover:bg-[#E0BC7A]"
                      >
                        Apply Recommendation
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  value,
  suffix = "%",
}: {
  icon: LucideIcon;
  title: string;
  value?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#A4AAB5]/12 bg-[var(--surface)] px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#A4AAB5]/12 bg-[var(--surface-elevated)]">
          <Icon className="h-3.5 w-3.5 text-[#D6AD69]" />
        </span>

        <span className="truncate text-[10px] font-bold text-[var(--text-primary)]">
          {title}
        </span>
      </div>

      {typeof value === "number" && (
        <span className="font-mono text-[10px] font-bold text-[#D6AD69]">
          {value}
          {suffix}
        </span>
      )}
    </div>
  );
}
