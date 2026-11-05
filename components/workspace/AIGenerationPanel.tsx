"use client";

import { MIN_CHARS } from "@/components/IdeaInput";
import {
  Loader2,
  Wand2,
  Sparkles,
  ShoppingCart,
  MessageSquare,
  Hospital,
  Tv,
  Boxes,
  HeartPulse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DiagramType } from "@/lib/storage/types";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";

const EXAMPLES: {
  title: string;
  tags: string[];
  prompt: string;
  icon: LucideIcon;
}[] = [
    {
      title: "E-Commerce",
      tags: ["React", "Redis"],
      prompt:
        "Build a scalable e-commerce platform with React frontend, Node.js API, PostgreSQL database, Redis caching, and Stripe payments.",
      icon: ShoppingCart,
    },
    {
      title: "Real-Time Chat",
      tags: ["WebSocket"],
      prompt:
        "Design a real-time chat system with WebSocket connections, Redis pub/sub, user presence, and message persistence.",
      icon: MessageSquare,
    },
    {
      title: "Hospital",
      tags: ["Billing"],
      prompt:
        "Create a hospital management architecture with patient records, doctor scheduling, appointments, and billing systems.",
      icon: Hospital,
    },
    {
      title: "Streaming",
      tags: ["CDN"],
      prompt:
        "Design a Netflix-style streaming platform with video upload, transcoding, CDN delivery, and recommendation engine.",
      icon: Tv,
    },
    {
      title: "SaaS",
      tags: ["Gateway"],
      prompt:
        "Design a multi-tenant SaaS with API gateway, auth service, billing service, and event-driven microservices.",
      icon: Boxes,
    },
    {
      title: "AI Health",
      tags: ["LLM"],
      prompt:
        "Design an AI healthcare system with LLM inference, vector database, document ingestion, and secure patient data handling.",
      icon: HeartPulse,
    },
  ];

type Props = {
  prompt: string;
  onPromptChange: (v: string) => void;
  diagramType: DiagramType;
  onDiagramTypeChange: (v: DiagramType) => void;
  loading: boolean;
  onGenerate: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function AIGenerationPanel({
  prompt,
  onPromptChange,
  diagramType,
  onDiagramTypeChange,
  loading,
  onGenerate,
  collapsed = false,
}: Props) {
  const canGenerate = prompt.trim().length >= MIN_CHARS;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (
      (e.metaKey || e.ctrlKey) &&
      e.key === "Enter" &&
      canGenerate &&
      !loading
    ) {
      e.preventDefault();
      onGenerate();
    }
  }

  if (collapsed) {
    return (
      <div className="rounded-2xl border border-[#A4AAB5]/12 bg-[#171A20]/95 p-3 backdrop-blur-xl flex items-center justify-between">
        <span className="text-xs font-bold text-[#F0F1F3]">
          Architecture Prompt Panel
        </span>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F0F1F3] px-4 py-2 text-xs font-bold text-[#101216] transition-all hover:bg-[#E0BC7A] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#D6AD69]" />
          ) : (
            <Wand2 className="h-4 w-4 text-[#D6AD69]" />
          )}
          <span>Generate</span>
        </button>
      </div>
    );
  }

  return (
    <div className="group relative mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#A4AAB5]/12 bg-[#171A20] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_45px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(48,54,64,0.6)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D6AD69]/10 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#303640]/10 blur-[100px]" />

      <div className="relative z-10">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D6AD69]/30 bg-[#D6AD69]/10 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D6AD69]" />

              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#D6AD69]">
                AI Architecture Synthesizer
              </p>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#F0F1F3] sm:text-4xl">
              Describe Your Architecture
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#A4AAB5]">
              Tell Arqin AI what you&apos;re building — components, technology,
              and relationships.
            </p>
          </div>

          <div className="shrink-0">
            <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5060]">
              Diagram Spec
            </label>

            <select
              value={diagramType}
              onChange={(e) =>
                onDiagramTypeChange(e.target.value as DiagramType)
              }
              className="w-full rounded-xl border border-[#4A5060] bg-[#101216] px-4 py-2.5 text-xs font-semibold text-[#F0F1F3] outline-none transition-all hover:border-[#D6AD69]/40 focus:border-[#D6AD69] md:w-auto"
              aria-label="Diagram type"
            >
              {Object.entries(DIAGRAM_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v} className="bg-[#171A20]">
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EXAMPLES.map((ex) => {
            const Icon = ex.icon;

            return (
              <button
                key={ex.title}
                type="button"
                onClick={() => onPromptChange(ex.prompt)}
                className="group/chip relative flex flex-col items-start gap-2.5 overflow-hidden rounded-2xl border border-[#A4AAB5]/10 bg-[#1D222A] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#D6AD69]/35 hover:bg-[#1D222A]/90 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D6AD69]/30 bg-[#171A20] text-[#D6AD69] transition-all duration-300 group-hover/chip:scale-110">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="w-full min-w-0">
                  <p className="truncate text-xs font-bold text-[#F0F1F3] transition-colors group-hover/chip:text-[#D6AD69]">
                    {ex.title}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-1">
                    {ex.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#4A5060] bg-[#101216] px-2 py-0.5 font-mono text-[9px] font-semibold text-[#A4AAB5]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="relative mb-6">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            placeholder="e.g. Build a scalable e-commerce platform with React frontend, Node.js API gateway, PostgreSQL database, and Redis caching..."
            className="w-full resize-none rounded-2xl border border-[#4A5060] bg-[#101216] p-5 text-sm leading-relaxed text-[#F0F1F3] placeholder-[#A4AAB5]/50 outline-none transition-all focus:border-[#D6AD69] focus:ring-1 focus:ring-[#D6AD69]/20"
            aria-label="Architecture description"
          />

          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            <span
              className={`font-mono text-xs ${
                prompt.length > 0 && prompt.length < MIN_CHARS
                  ? "font-bold text-amber-400"
                  : "text-[#A4AAB5]/60"
              }`}
            >
              {prompt.length} chars
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#A4AAB5]/10 pt-6 sm:flex-row">
          <p className="text-xs text-[#A4AAB5]">
            {prompt.length > 0 && prompt.length < MIN_CHARS ? (
              <span className="font-bold text-amber-400">
                Minimum 15 characters required for AI synthesis.
              </span>
            ) : (
              "Press Cmd+Enter or Ctrl+Enter to generate"
            )}
          </p>

          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D6AD69]/30 bg-[#F0F1F3] px-8 py-4 text-xs font-bold text-[#101216] shadow-[0_12px_35px_rgba(214,173,105,0.10)] transition-all hover:-translate-y-0.5 hover:bg-[#E0BC7A] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D6AD69]" />
                Synthesizing Architecture…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#D6AD69]" />
                Generate Architecture Canvas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 