"use client";

import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Code2,
  Cpu,
  PanelRight,
  RefreshCw,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import AIGenerationPanel from "@/components/workspace/AIGenerationPanel";
import LoadingSequence from "@/components/workspace/LoadingSequence";
import ArchitectureCanvas from "@/components/workspace/ArchitectureCanvas";
import PropertyInspector from "@/components/workspace/PropertyInspector";
import AIAssistantDock from "@/components/workspace/AIAssistantDock";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import ComparisonModal from "@/components/workspace/ComparisonModal";
import ArchitectureSimulator from "@/components/workspace/ArchitectureSimulator";
import ArtifactsModal from "@/components/workspace/ArtifactsModal";
import ComponentDetailModal from "@/components/workspace/ComponentDetailModal";
import GuidedJourneyModal from "@/components/workspace/GuidedJourneyModal";

import {
  type ArchitectureResult,
  type DiagramType,
} from "@/lib/storage/types";

import { generateId } from "@/lib/storage/store";
import { useStore } from "@/hooks/UserStoreContext";

import { getTemplate } from "@/lib/templates";
import {
  downloadText,
  toMarkdownExport,
} from "@/lib/export";

import { parseMermaidToGraph } from "@/lib/graph/parser";

import {
  addCacheToGraph,
  addGatewayToGraph,
  graphToMermaid,
  improveComponentInGraph,
} from "@/lib/graph/serializer";

import { optimizeArchitecture } from "@/lib/optimizer/optimizer";
import { evaluateArchitectureScore } from "@/lib/analysis/scoring";
import { analyzeArchitectureRisks } from "@/lib/analysis/risk";

import type {
  ArchNode,
  ArchitectureGraph,
  OptimizationResult,
} from "@/lib/graph/types";

function GenerateContent() {
  const searchParams = useSearchParams();
  const store = useStore();

  const canvasRef =
    useRef<HTMLDivElement>(null);

  const [projectId, setProjectId] =
    useState<string | null>(null);

  const [title, setTitle] =
    useState("Untitled Architecture");

  const [prompt, setPrompt] =
    useState("");

  const [diagramType, setDiagramType] =
    useState<DiagramType>("architecture");

  const [result, setResult] =
    useState<ArchitectureResult | null>(
      null,
    );

  const [selectedComponent, setSelectedComponent] =
    useState<string | null>(null);

  const [highlightedNodeIds, setHighlightedNodeIds] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [saved, setSaved] =
    useState(false);

  const [showInspector, setShowInspector] =
    useState(false);

  const [editPromptOpen, setEditPromptOpen] =
    useState(true);

  const [activeGraph, setActiveGraph] =
    useState<ArchitectureGraph | null>(
      null,
    );

  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(
      null,
    );

  const [showSimulator, setShowSimulator] =
    useState(false);

  const [showArtifacts, setShowArtifacts] =
    useState(false);

  const [showJourney, setShowJourney] =
    useState(false);

  const [detailNode, setDetailNode] =
    useState<ArchNode | null>(null);

  const [pendingMutation, setPendingMutation] =
    useState<{
      type: string;
      targetId?: string;
      title: string;
      desc: string;
    } | null>(null);

  useEffect(() => {
    const settings = store?.getSettings();

    const templateId =
      searchParams.get("template");

    const projectParam =
      searchParams.get("project");

    const isNew =
      searchParams.get("new");

    const isJourney =
      searchParams.get("journey") === "1";

    const typeParam =
      searchParams.get("type") as
      | DiagramType
      | null;

    const validTypes: DiagramType[] = [
      "class",
      "sequence",
      "er",
      "flowchart",
      "component",
      "deployment",
      "state",
      "architecture",
    ];

    const typeFromUrl =
      typeParam &&
        validTypes.includes(typeParam)
        ? typeParam
        : null;

    if (isJourney) {
      setShowJourney(true);
    }

    if (templateId) {
      const template =
        getTemplate(templateId);

      if (template) {
        const project = store?.createProject({
          title: template.name,
          prompt: template.prompt,
          diagramType:
            template.diagramType,
        });

        if (!project) return;

        setProjectId(project.id);
        setTitle(project.title);
        setPrompt(project.prompt);
        setDiagramType(
          project.diagramType,
        );

        return;
      }
    }

    if (isNew === "1") {
      setProjectId(null);
      setTitle("Untitled Architecture");
      setPrompt("");
      setResult(null);
      setActiveGraph(null);
      setSelectedComponent(null);
      setShowInspector(false);
      setDiagramType(
        typeFromUrl ??
        (settings?.defaultDiagramType ?? "architecture"),
      );

      return;
    }

    const targetId =
      projectParam ||
      store?.getActiveProjectId();

    if (!targetId) {
      return;
    }

    const project =
      store?.getProject(targetId);

    if (!project) {
      return;
    }

    setProjectId(project.id);
    setTitle(project.title);
    setPrompt(project.prompt);
    setDiagramType(
      project.diagramType,
    );

    if (project.result) {
      setResult(project.result);

      const parsed =
        parseMermaidToGraph(
          project.result.mermaidCode,
          project.result.diagramType,
          project.result.title,
          project.result.explanation
            .components,
          project.result.technologies,
        );

      setActiveGraph(parsed);
      setShowInspector(true);
      setEditPromptOpen(false);
    }
  }, [searchParams, store]);

  const commitGraphUpdate =
    useCallback(
      (
        newGraph: ArchitectureGraph,
        customResult?: ArchitectureResult,
      ) => {
        setActiveGraph(newGraph);

        const generatedMermaid =
          graphToMermaid(newGraph);

        const score =
          evaluateArchitectureScore(
            newGraph,
          );

        const risks =
          analyzeArchitectureRisks(
            newGraph,
          );

        const updatedResult:
          ArchitectureResult =
          customResult || {
            title: newGraph.title,
            diagramType:
              newGraph.diagramType,
            mermaidCode:
              generatedMermaid,
            explanation:
              result?.explanation || {
                overview: `Production specification for ${newGraph.title}.`,
                components:
                  newGraph.nodes.map(
                    (node) => ({
                      name: node.name,
                      description:
                        node.description,
                    }),
                  ),
                dataFlow:
                  "HTTP / Ingress -> Microservices -> Persistence",
                technologyChoices:
                  newGraph.nodes
                    .map(
                      (node) =>
                        node.technology,
                    )
                    .join(", "),
                scalability:
                  score.scalability.reason,
                security:
                  score.security.reason,
                reliability:
                  score.reliability.reason,
                tradeoffs:
                  "Decoupled architecture balances scalability with service tracing overhead.",
                improvements:
                  "Add distributed tracing and multi-region read replicas.",
              },
            technologies:
              Array.from(
                new Set(
                  newGraph.nodes.map(
                    (node) =>
                      node.technology,
                  ),
                ),
              ),
            adaptiveInsights: {
              health: score.overall,
              healthLabel:
                score.label,
              scalability:
                score.scalability.score,
              maintainability:
                score.maintainability
                  .score,
              reliability:
                score.reliability.score,
              security:
                score.security.score,
              adaptability:
                score.coupling.score,
              potentialIssues:
                risks.map(
                  (risk) =>
                    risk.title,
                ),
              suggestions:
                risks.map(
                  (risk) => ({
                    current:
                      risk.title,
                    suggested:
                      risk.recommendedSolution,
                    reason:
                      risk.whyItMatters,
                    category:
                      "scalability",
                  }),
                ),
            },
          };

        setResult(updatedResult);
        setTitle(newGraph.title);

        if (projectId) {
          store?.saveProject({
            id: projectId,
            title: newGraph.title,
            description: "",
            prompt,
            diagramType:
              newGraph.diagramType,
            result: updatedResult,
            createdAt:
              new Date().toISOString(),
            updatedAt:
              new Date().toISOString(),
          });
        } else {
          const created =
            store?.createProject({
              title: newGraph.title,
              prompt,
              diagramType:
                newGraph.diagramType,
              result: updatedResult,
            });

          if (created) setProjectId(created.id);
        }

        setSaved(true);

        setTimeout(
          () => setSaved(false),
          2000,
        );
      },
      [projectId, prompt, result, store],
    );

  async function generate(
    refineInstruction?: string,
  ): Promise<string | null> {
    if (
      !refineInstruction &&
      prompt.trim().length < 15
    ) {
      return null;
    }

    if (loading) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            refineInstruction
              ? {
                refineInstruction,
                currentArchitecture:
                  result,
                diagramType,
              }
              : {
                idea: prompt,
                diagramType,
              },
          ),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
          "We couldn't generate your architecture right now.",
        );

        return data.error ?? null;
      }

      const architecture =
        data as ArchitectureResult;

      const parsedGraph =
        parseMermaidToGraph(
          architecture.mermaidCode,
          architecture.diagramType,
          architecture.title,
          architecture.explanation
            .components,
          architecture.technologies,
        );

      commitGraphUpdate(
        parsedGraph,
        architecture,
      );

      setShowInspector(true);
      setEditPromptOpen(false);

      store?.addHistoryEntry({
        id: generateId(),
        projectId:
          projectId ?? "unknown",
        projectTitle:
          architecture.title,
        prompt:
          refineInstruction ??
          prompt,
        diagramType:
          architecture.diagramType,
        status: "success",
        result: architecture,
        createdAt:
          new Date().toISOString(),
      });

      return `Architecture updated: ${architecture.title}`;
    } catch {
      setError(
        "Network error. Check your connection and try again.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  function handleOptimize() {
    if (!activeGraph) {
      return;
    }

    const optRes =
      optimizeArchitecture(
        activeGraph,
      );

    setOptimizationResult(optRes);
  }

  function handleApplyOptimized() {
    if (!optimizationResult) {
      return;
    }

    commitGraphUpdate(
      optimizationResult.optimizedGraph,
    );

    setOptimizationResult(null);
  }

  function handleExecuteMutation(
    type: string,
    targetId?: string,
  ) {
    if (!activeGraph) {
      return;
    }

    if (type === "ADD_CACHE") {
      const targetName =
        targetId ||
        activeGraph.nodes.find(
          (node) =>
            node.type ===
            "database",
        )?.name ||
        activeGraph.nodes[0]?.name;

      const mutated =
        addCacheToGraph(
          activeGraph,
          targetName,
        );

      commitGraphUpdate(mutated);
    }

    if (type === "ADD_GATEWAY") {
      const mutated =
        addGatewayToGraph(
          activeGraph,
        );

      commitGraphUpdate(mutated);
    }

    if (
      type === "IMPROVE_COMPONENT" &&
      targetId
    ) {
      const mutated =
        improveComponentInGraph(
          activeGraph,
          targetId,
          "Added multi-region auto-scaling and connection pool isolation.",
        );

      commitGraphUpdate(mutated);
    }

    setPendingMutation(null);
  }

  function handleSelectComponent(
    compName: string | null,
  ) {
    setSelectedComponent(
      compName,
    );

    if (
      !compName ||
      !activeGraph
    ) {
      return;
    }

    const found =
      activeGraph.nodes.find(
        (node) =>
          node.name.toLowerCase() ===
          compName.toLowerCase() ||
          node.id.toLowerCase() ===
          compName.toLowerCase(),
      );

    if (found) {
      setDetailNode(found);
    }
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <WorkspaceHeader
        title={title}
        onTitleChange={(value) => {
          setTitle(value);

          if (activeGraph) {
            commitGraphUpdate({
              ...activeGraph,
              title: value,
            });
          }
        }}
        diagramType={diagramType}
        saved={saved}
        onExport={() => {
          if (!result) {
            return;
          }

          downloadText(
            toMarkdownExport(result),
            `${title
              .toLowerCase()
              .replace(
                /\s+/g,
                "-",
              )}.md`,
          );
        }}
        onFullscreen={() =>
          canvasRef.current?.requestFullscreen()
        }
      />

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {!result ? (
          <div className="relative flex flex-1 items-center justify-center overflow-y-auto bg-[var(--background)] p-6">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--accent-rgb,214,173,105),0.07),transparent_38%)]" />

              <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--accent-rgb,214,173,105),0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--accent-rgb,214,173,105),0.018)_1px,transparent_1px)] [background-size:48px_48px]" />
            </div>

            <div className="relative z-10 w-full max-w-6xl space-y-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowJourney(true)
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 font-[var(--font-space-grotesk)] text-xs font-bold text-[var(--accent)] transition-all hover:bg-[var(--surface-elevated)]"
                >
                  <Sparkles className="h-4 w-4" />
                  Launch Guided Journey
                </button>
              </div>

              <AIGenerationPanel
                prompt={prompt}
                onPromptChange={
                  setPrompt
                }
                diagramType={
                  diagramType
                }
                onDiagramTypeChange={
                  setDiagramType
                }
                onGenerate={() =>
                  generate()
                }
                loading={loading}
              />

              {loading && (
                <LoadingSequence />
              )}

              {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>
                    {error}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--background)]">
            <div className="relative z-30 shrink-0 border-b border-[var(--border)] bg-[var(--background-2)]/96 px-5 py-2.5 backdrop-blur-2xl">
              <div className="flex min-h-9 items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setEditPromptOpen(
                      !editPromptOpen,
                    )
                  }
                  className="group flex min-w-0 items-center gap-2.5 text-left"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                    <Wand2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-[var(--font-space-grotesk)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                        Prompt
                      </span>

                      {editPromptOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                      )}
                    </div>

                    <div className="mt-0.5 max-w-[560px] truncate font-[var(--font-inter)] text-[11px] text-[var(--text-muted)]">
                      {prompt}
                    </div>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowJourney(
                        true,
                      )
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-elevated)] hover:text-[var(--accent)]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Journey
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleOptimize
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-elevated)] hover:text-[var(--accent)]"
                  >
                    <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Optimize
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowSimulator(
                        true,
                      )
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-elevated)] hover:text-[var(--accent)]"
                  >
                    <Cpu className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Simulate
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowArtifacts(
                        true,
                      )
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-elevated)] hover:text-[var(--accent)]"
                  >
                    <Code2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Artifacts
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      generate()
                    }
                    disabled={loading}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--accent)]/40 bg-[var(--surface-elevated)] px-3 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--accent)] transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)] disabled:opacity-50"
                  >
                    <RefreshCw
                      className={
                        loading
                          ? "h-3.5 w-3.5 animate-spin"
                          : "h-3.5 w-3.5"
                      }
                    />
                    Regenerate
                  </button>

                  <div className="mx-1 h-5 w-px bg-[var(--border)]" />

                  <button
                    type="button"
                    onClick={() =>
                      setShowInspector(
                        !showInspector,
                      )
                    }
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 font-[var(--font-space-grotesk)] text-[10px] font-bold transition-all ${showInspector
                      ? "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-faint)] hover:text-[var(--accent)]"
                      }`}
                  >
                    <PanelRight className="h-3.5 w-3.5" />
                    Inspector
                  </button>
                </div>
              </div>

              {editPromptOpen && (
                <div className="mt-3 border-t border-[var(--border)] pt-3">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={prompt}
                      onChange={(event) =>
                        setPrompt(
                          event.target
                            .value,
                        )
                      }
                      rows={2}
                      className="min-h-[56px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 font-[var(--font-inter)] text-[11px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--border)]"
                      placeholder="Describe the architecture you want Arqin AI to synthesize..."
                    />

                    <button
                      type="button"
                      onClick={() =>
                        generate()
                      }
                      disabled={loading}
                      className="h-10 shrink-0 rounded-xl bg-[var(--accent)] px-4 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--on-accent)] transition-all hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "Synthesizing..."
                        : "Synthesize"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              ref={canvasRef}
              className={`relative min-h-0 min-w-0 flex-1 overflow-hidden transition-[padding] duration-300 ease-out ${showInspector
                  ? "lg:pr-[390px]"
                  : "pr-0"
                }`}
            >
              <div className="relative h-full min-h-0 min-w-0 overflow-hidden">
                <ArchitectureCanvas
                  chart={
                    result.mermaidCode
                  }
                  result={result}
                  onRegenerate={() =>
                    generate()
                  }
                  selectedComponent={
                    selectedComponent
                  }
                  highlightedNodeIds={
                    highlightedNodeIds
                  }
                  onSelectComponent={
                    handleSelectComponent
                  }
                />
              </div>

              <div
                className={`absolute inset-y-0 right-0 z-40 w-[min(390px,calc(100vw-40px))] transform border-l border-[var(--border)] bg-[var(--background-2)]/96 shadow-[-24px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-300 ease-out ${showInspector
                  ? "translate-x-0"
                  : "translate-x-full"
                  }`}
              >
                <div className="flex h-full flex-col">
                  <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
                    <div>
                      <div className="font-[var(--font-space-grotesk)] text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                        Intelligence
                      </div>

                      <div className="mt-0.5 font-[var(--font-space-grotesk)] text-[12px] font-bold text-[var(--text-primary)]">
                        Architecture Inspector
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowInspector(
                          false,
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--accent)]"
                      aria-label="Close inspector"
                    >
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <PropertyInspector
                      result={result}
                      graph={activeGraph}
                      selectedComponent={
                        selectedComponent
                      }
                      onSelectComponent={
                        setSelectedComponent
                      }
                      onRefine={(
                        instruction,
                      ) =>
                        generate(
                          instruction,
                        )
                      }
                      onOptimize={
                        handleOptimize
                      }
                      onSimulate={() =>
                        setShowSimulator(
                          true,
                        )
                      }
                      onArtifacts={() =>
                        setShowArtifacts(
                          true,
                        )
                      }
                      onSelectRiskNodes={(
                        nodeIds,
                      ) => {
                        setHighlightedNodeIds(
                          nodeIds,
                        );

                        if (
                          nodeIds.length >
                          0 &&
                          activeGraph
                        ) {
                          const matched =
                            activeGraph.nodes.find(
                              (node) =>
                                nodeIds.includes(
                                  node.id,
                                ),
                            );

                          if (matched) {
                            setSelectedComponent(
                              matched.name,
                            );
                          }
                        }
                      }}
                      onApplyMutation={(
                        type,
                        targetId,
                      ) => {
                        setPendingMutation(
                          {
                            type,
                            targetId,
                            title: `Confirm Graph Mutation (${type})`,
                            desc: "Executing this mutation will update ArchitectureGraph, re-evaluate health scores, and push a version snapshot.",
                          },
                        );
                      }}
                      loading={loading}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>

              {showInspector && (
                <button
                  type="button"
                  aria-label="Close inspector"
                  onClick={() =>
                    setShowInspector(
                      false,
                    )
                  }
                  className="absolute inset-0 z-30 bg-black/10 lg:hidden"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {pendingMutation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--background)] p-6 text-[var(--text-primary)] shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-[var(--accent)]" />

              <h3 className="text-base font-bold">
                {
                  pendingMutation.title
                }
              </h3>
            </div>

            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              {
                pendingMutation.desc
              }
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setPendingMutation(
                    null,
                  )
                }
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  handleExecuteMutation(
                    pendingMutation.type,
                    pendingMutation.targetId,
                  )
                }
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showJourney && (
        <GuidedJourneyModal
          graph={activeGraph}
          onClose={() =>
            setShowJourney(false)
          }
          onGeneratePrompt={async (
            generatedPrompt,
          ) => {
            setPrompt(
              generatedPrompt,
            );

            await generate();
          }}
          onHighlightNodes={(
            nodeIds,
          ) =>
            setHighlightedNodeIds(
              nodeIds,
            )
          }
          onApplyOptimization={
            handleApplyOptimized
          }
          onOpenArtifacts={() =>
            setShowArtifacts(true)
          }
          onOpenCopilot={() => { }}
        />
      )}

      {optimizationResult && (
        <ComparisonModal
          result={optimizationResult}
          onClose={() =>
            setOptimizationResult(
              null,
            )
          }
          onApplyOptimized={
            handleApplyOptimized
          }
        />
      )}

      {showSimulator &&
        activeGraph && (
          <ArchitectureSimulator
            graph={activeGraph}
            onClose={() =>
              setShowSimulator(
                false,
              )
            }
            onHighlightBottlenecks={(
              nodeIds,
            ) => {
              setHighlightedNodeIds(
                nodeIds,
              );

              const first =
                activeGraph.nodes.find(
                  (node) =>
                    nodeIds.includes(
                      node.id,
                    ),
                );

              if (first) {
                setSelectedComponent(
                  first.name,
                );
              }
            }}
          />
        )}

      {showArtifacts &&
        activeGraph && (
          <ArtifactsModal
            graph={activeGraph}
            onClose={() =>
              setShowArtifacts(
                false,
              )
            }
          />
        )}

      {detailNode &&
        activeGraph && (
          <ComponentDetailModal
            node={detailNode}
            graph={activeGraph}
            onClose={() =>
              setDetailNode(null)
            }
          />
        )}

      <AIAssistantDock
        onAsk={async (message) => {
          try {
            const res = await fetch("/api/copilot", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message,
                architecture: result ?? null,
              }),
            });
            const data = await res.json() as
              | { type: "answer"; text: string }
              | { type: "proposal"; text: string; proposedChanges: { description: string } }
              | { error: string };
            if (!res.ok || "error" in data) {
              return null;
            }
            return data;
          } catch {
            return null;
          }
        }}
        onApplyModification={(instruction) =>
          generate(instruction)
        }
        loading={loading}
        projectTitle={title}
        onOptimize={handleOptimize}
        onSimulate={() => setShowSimulator(true)}
        onArtifacts={() => setShowArtifacts(true)}
      />
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[var(--background)] font-[var(--font-inter)] text-sm text-[var(--text-muted)]">
          Loading Arqin AI Studio...
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}