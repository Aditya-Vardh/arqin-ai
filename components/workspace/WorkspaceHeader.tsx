"use client";

import { Check, Download, Maximize2, Sparkles, Layers } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import type { DiagramType } from "@/lib/storage/types";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";

type Props = {
  title: string;
  onTitleChange: (v: string) => void;
  diagramType: DiagramType;
  saved?: boolean;
  onExport?: () => void;
  onFullscreen?: () => void;
};

export default function WorkspaceHeader({
  title,
  onTitleChange,
  diagramType,
  saved,
  onExport,
  onFullscreen,
}: Props) {
  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[var(--background-2)]/95 px-4 backdrop-blur-2xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--surface-elevated)] text-[var(--accent)] shadow-[0_0_18px_rgba(214,173,105,0.12)]">
          <Layers className="h-4 w-4" />
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="min-w-0 max-w-[220px] rounded-xl border border-transparent bg-transparent px-2.5 py-1 text-sm font-bold tracking-tight text-[var(--text-primary)] outline-none transition-all hover:border-[var(--text-faint)] focus:border-[var(--accent)]/50 focus:bg-[var(--surface)] sm:max-w-[280px]"
          aria-label="Project name"
        />

        {saved && (
          <span className="hidden items-center gap-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[var(--accent)] sm:flex">
            <Check className="h-3 w-3" />
            Auto-Saved
          </span>
        )}
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-[var(--surface)] px-4 py-1.5 md:flex">
        <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />

        <span className="text-xs font-semibold text-[var(--text-muted)]">
          Arqin AI
          <span className="ml-1 text-[var(--text-primary)]">Studio Canvas</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[var(--accent)] sm:inline-flex">
          {DIAGRAM_TYPE_LABELS[diagramType]}
        </span>

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--text-faint)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <Download className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">Export MD</span>
          </button>
        )}

        {onFullscreen && (
          <button
            type="button"
            onClick={onFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--text-faint)] bg-[var(--surface)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="hidden lg:block">
          <UserButton
            appearance={{
              variables: { colorPrimary: "#D6AD69" } as Record<string, string>,
              elements: { avatarBox: "w-8 h-8" },
            }}
          />
        </div>
      </div>
    </header>
  );
}