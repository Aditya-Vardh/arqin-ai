"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Plus,
  Check,
  X,
  MoreHorizontal,
  Download,
  Sparkles,
  Trash2,
  Copy,
  Edit3,
  Eye,
  Layers,
} from "lucide-react";
import { useStore } from "@/hooks/UserStoreContext";
import type { Project } from "@/lib/storage/types";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";
import { deriveAdaptiveInsights } from "@/lib/adaptive";
import { toMarkdownExport, downloadText } from "@/lib/export";
import { synthesizeFallbackArchitecture } from "@/lib/ai/fallback-synthesizer";
import ArchitectureCanvas from "@/components/workspace/ArchitectureCanvas";

export default function ProjectsPage() {
  const store = useStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  function refresh() {
    if (!store) return;
    const list = store.getProjects();

    const hydrated = list.map((p) => {
      let cleanTitle = p.title;

      if (cleanTitle === "sequence Diagram") {
        cleanTitle = "Sequence Flow Spec";
      } else if (cleanTitle === "Untitled Architecture") {
        cleanTitle = p.prompt
          ? p.prompt.length > 30
            ? `${p.prompt.slice(0, 27)}...`
            : p.prompt
          : "Custom System Architecture";
      }

      if (!p.result) {
        const synth = synthesizeFallbackArchitecture(
          p.prompt || cleanTitle,
          p.diagramType,
        );

        const updated = {
          ...p,
          title: cleanTitle,
          result: synth,
        };

        store.saveProject(updated);
        return updated;
      }

      return {
        ...p,
        title: cleanTitle,
      };
    });

    setProjects(hydrated);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => refresh());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  function startRename(project: Project) {
    setEditingId(project.id);
    setEditTitle(project.title);
    setMenuOpen(null);
  }

  function saveRename(id: string) {
    const project = projects.find((p) => p.id === id);

    if (project && editTitle.trim()) {
      store?.saveProject({
        ...project,
        title: editTitle.trim(),
        updatedAt: new Date().toISOString(),
      });

      refresh();
    }

    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this project and its history entries?")) {
      store?.deleteProject(id);
      refresh();
    }

    setMenuOpen(null);
  }

  function handleDuplicate(id: string) {
    store?.duplicateProject(id);
    refresh();
    setMenuOpen(null);
  }

  function handleExport(project: Project) {
    if (!project.result) return;

    downloadText(
      toMarkdownExport(project.result),
      `${project.title.replace(/\s+/g, "-").toLowerCase()}.md`,
      "text/markdown",
    );

    setMenuOpen(null);
  }

  return (
    <div className="relative min-h-full overflow-hidden" style={{ background: "#101216" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[-180px] h-[500px] w-[500px] rounded-full bg-[var(--accent)]/[0.025] blur-[130px]" />

        <div className="absolute right-[5%] top-[10%] h-[350px] w-[350px] rounded-full bg-[var(--accent)]/[0.018] blur-[120px]" />

        <div className="absolute left-[10%] top-[-180px] h-[500px] w-[500px] rounded-full bg-[var(--accent)]/[0.025] blur-[130px]" />

        <div className="absolute right-[5%] top-[10%] h-[350px] w-[350px] rounded-full bg-[var(--accent)]/[0.018] blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(48,54,64,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(48,54,64,0.5)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-10 p-6 pb-16 pt-8 sm:p-10 sm:pt-12">
        <div className="flex flex-col gap-7 border-b border-white/[0.08] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-1 backdrop-blur-md">
              <FolderOpen className="h-3.5 w-3.5 text-[var(--accent)]" />

              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                Project Repository &amp; Specs
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl lg:text-[56px] lg:leading-[1.02]">
              Software Architecture
              <br />
              <span className="text-[var(--accent)]">Projects</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
              Manage your saved system diagrams, microservice maps, and
              architecture specifications.
            </p>
          </div>

          <Link
            href="/workspace/generate?new=1"
            className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)] px-5 py-3.5 text-xs font-bold text-[var(--on-accent)] shadow-[0_0_28px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
          >
            <Plus className="h-4 w-4 text-[var(--accent)]" />
            Create New Project
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">
              Repository
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">
              {projects.length}{" "}
              {projects.length === 1 ? "architecture" : "architectures"} saved
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-[var(--surface)] px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />

            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Local Repository
            </span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--text-faint)] bg-[var(--surface)]/80 p-10 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
              <FolderOpen className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              No Projects Saved Yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
              Generate your first architecture in Studio Canvas to save and
              manage it here.
            </p>

            <Link
              href="/workspace/generate?new=1"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-xs font-bold text-[var(--on-accent)] transition-all hover:bg-[var(--accent-hover)]"
            >
              <Plus className="h-4 w-4 text-[var(--accent)]" />
              Launch Studio Canvas
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const health = project.result
                ? deriveAdaptiveInsights(project.result)
                : null;

              return (
                <div
                  key={project.id}
                  className="group relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-lg active:scale-[0.98]"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(48,54,64,0.6)_1px,transparent_1px)] [background-size:22px_22px]" />
                  </div>

                  <div className="relative z-10">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-[var(--accent)]">
                        {DIAGRAM_TYPE_LABELS[project.diagramType]}
                      </span>

                      <span className="font-mono text-[9px] text-[var(--text-muted)]/60">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {editingId === project.id ? (
                      <div
                        className="mb-3 flex items-center gap-2"
                        onClick={(e) => e.preventDefault()}
                      >
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-[var(--accent)]/40 bg-[var(--background)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                          autoFocus
                        />

                        <button
                          type="button"
                          onClick={() => saveRename(project.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--on-accent)]"
                        >
                          <Check className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={`/workspace/generate?project=${project.id}`}
                        onClick={() => store?.setActiveProjectId(project.id)}
                        className="block"
                      >
                        <h3 className="truncate font-[var(--font-space-grotesk)] text-lg font-bold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                          {project.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 font-[var(--font-inter)] text-xs leading-5 text-[var(--text-muted)]">
                          {project.prompt ||
                            "Custom architecture specification."}
                        </p>
                      </Link>
                    )}

                    {health && (
                      <div className="mt-5 flex w-fit items-center gap-2 rounded-xl border border-[var(--accent)]/15 bg-[var(--accent)]/[0.05] px-3 py-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />

                        <span className="font-[var(--font-geist-mono)] text-[10px] font-bold text-[var(--accent)]">
                          Health {health.health}/100
                        </span>

                        <span className="text-[var(--text-faint)]">·</span>

                        <span className="font-[var(--font-inter)] text-[10px] text-[var(--text-muted)]">
                          {health.healthLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 mt-7 flex items-center justify-between border-t border-[var(--border)] pt-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/workspace/generate?project=${project.id}`}
                        onClick={() => store?.setActiveProjectId(project.id)}
                        className="flex items-center gap-1 font-[var(--font-space-grotesk)] text-[11px] font-bold text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                      >
                        Open Canvas
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </Link>

                      {project.result && (
                        <button
                          type="button"
                          onClick={() => setPreviewProject(project)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-[var(--font-inter)] text-[10px] font-semibold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
                        >
                          <Eye className="h-3 w-3" />
                          Quick View
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setMenuOpen(
                            menuOpen === project.id ? null : project.id,
                          );
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-faint)] transition-all hover:border-[var(--accent)]/25 hover:text-[var(--text-primary)]"
                        aria-label="Project actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {menuOpen === project.id && (
                        <div className="absolute bottom-full right-0 z-20 mb-2 w-44 rounded-2xl border border-[var(--border)] bg-[var(--background)]/98 p-1.5 text-xs shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
                          <button
                            type="button"
                            onClick={() => startRename(project)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-[var(--font-inter)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-[var(--accent)]" />
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(project.id)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-[var(--font-inter)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                          >
                            <Copy className="h-3.5 w-3.5 text-[var(--accent)]" />
                            Duplicate
                          </button>

                          {project.result && (
                            <button
                              type="button"
                              onClick={() => handleExport(project)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-[var(--font-inter)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                            >
                              <Download className="h-3.5 w-3.5 text-[var(--accent)]" />
                              Export MD
                            </button>
                          )}

                          <div className="my-1 border-t border-[var(--border)]" />

                          <button
                            type="button"
                            onClick={() => handleDelete(project.id)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-[var(--font-inter)] text-rose-400 transition-colors hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewProject && previewProject.result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--background)] shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-5 py-4 backdrop-blur-xl sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/[0.05] text-[var(--accent)]">
                  <Layers className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-[var(--font-space-grotesk)] text-sm font-bold text-[var(--text-primary)] sm:text-base">
                    {previewProject.title}
                  </h2>

                  <p className="font-[var(--font-geist-mono)] text-[9px] uppercase tracking-wider text-[var(--accent)]">
                    {DIAGRAM_TYPE_LABELS[previewProject.diagramType]} Spec
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/workspace/generate?project=${previewProject.id}`}
                  onClick={() => {
                    store?.setActiveProjectId(previewProject.id);
                    setPreviewProject(null);
                  }}
                  className="hidden items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--on-accent)] transition-all hover:bg-[var(--accent-hover)] sm:inline-flex"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Edit in Studio
                </Link>

                <button
                  type="button"
                  onClick={() => setPreviewProject(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-faint)] transition-all hover:border-[var(--accent)]/25 hover:text-[var(--text-primary)]"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden bg-[var(--background)]">
              <ArchitectureCanvas
                chart={previewProject.result.mermaidCode}
                result={previewProject.result}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}