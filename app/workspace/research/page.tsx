"use client";

import { useState, useCallback } from "react";
import {
  AlertCircle,
  Search,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  Database,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  GitBranch,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Server,
  Activity,
} from "lucide-react";
import type { ResearchResult } from "@/lib/storage/types";

const MAX_QUESTION_LENGTH = 2000;
const MIN_QUESTION_LENGTH = 10;

const EXAMPLE_QUESTIONS = [
  { q: "How should I design a scalable real-time chat application?", tag: "Realtime" },
  { q: "Microservices vs modular monolith for a growing e-commerce platform?", tag: "Trade-off" },
  { q: "What database architecture is best for a high-volume analytics platform?", tag: "Database" },
  { q: "How do I design a secure, highly available SaaS multi-tenant backend?", tag: "SaaS" },
  { q: "When should I use event sourcing and CQRS in a production system?", tag: "Patterns" },
];

const LOADING_STEPS = [
  "Analyzing architecture requirements",
  "Evaluating technology trade-offs",
  "Comparing architectural patterns",
  "Assessing scalability constraints",
  "Preparing expert recommendations",
];

const TECH_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Frontend: <Globe className="h-3.5 w-3.5" />,
  Backend: <Server className="h-3.5 w-3.5" />,
  Database: <Database className="h-3.5 w-3.5" />,
  Cache: <Zap className="h-3.5 w-3.5" />,
  "Message Broker": <Activity className="h-3.5 w-3.5" />,
  Infrastructure: <Layers className="h-3.5 w-3.5" />,
  "LLM Provider": <Cpu className="h-3.5 w-3.5" />,
  "Vector Database": <Database className="h-3.5 w-3.5" />,
  "Embedding Model": <GitBranch className="h-3.5 w-3.5" />,
};

function getTechIcon(category: string): React.ReactNode {
  return TECH_CATEGORY_ICONS[category] ?? <Server className="h-3.5 w-3.5" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
      {children}
    </div>
  );
}

function ResultCard({
  title,
  icon,
  children,
  accent = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all ${
        accent
          ? "border-[var(--accent)]/30 bg-gradient-to-b from-[var(--surface)]/90 to-[var(--background-2)]/95"
          : "border-[var(--border-subtle)] bg-gradient-to-b from-[var(--background-2)]/90 to-[var(--background)]/95"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <span className={accent ? "text-[var(--text-primary)]" : "text-[var(--accent)]"}>{icon}</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function QualitativeBadge({ label }: { label: string }) {
  const lower = label.toLowerCase();
  const isHigh =
    lower.includes("high") || lower.includes("excellent") || lower.includes("strong");
  const isLow = lower.includes("low") || lower.includes("minimal") || lower.includes("simple");

  const color = isHigh
    ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
    : isLow
    ? "border-[var(--text-primary)]/40 bg-[var(--text-primary)]/10 text-[var(--text-primary)]"
    : "border-[var(--border-subtle)] bg-[var(--border-subtle)] text-[var(--text-muted)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${color}`}
    >
      {label}
    </span>
  );
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-b from-[var(--background-2)]/90 to-[var(--background)]/95 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.025]" />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative z-10 flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)]">{icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[var(--accent)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--accent)]" />
        )}
      </button>
      {open && <div className="relative z-10 border-t border-[var(--border-subtle)] px-5 pb-5 pt-4">{children}</div>}
    </div>
  );
}

function LoadingState() {
  const [step] = useState(0);
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-b from-[var(--background-2)]/90 to-[var(--background)] p-10 text-center backdrop-blur-2xl">
      <div className="mb-8 relative">
        <div className="h-14 w-14 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 flex items-center justify-center">
          <Search className="h-7 w-7 text-[var(--accent)] animate-pulse" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border border-[var(--accent)]/10 animate-ping" style={{ animationDuration: "2s" }} />
      </div>
      <p className="mb-6 text-sm font-bold text-[var(--text-primary)]">Researching Architecture Patterns</p>
      <div className="w-full max-w-xs space-y-2.5">
        {LOADING_STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all ${
              i <= step
                ? "border-[var(--accent)]/30 bg-[var(--accent)]/10"
                : "border-[var(--border-subtle)] bg-transparent opacity-40"
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                i < step
                  ? "bg-[var(--accent)]"
                  : i === step
                  ? "bg-[var(--accent)] animate-pulse"
                  : "bg-[var(--text-faint)]"
              }`}
            />
            <span className="font-mono text-[10px] text-[var(--text-muted)]">{s}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[11px] text-[var(--accent)]">
        Consulting architectural knowledge base…
      </p>
    </div>
  );
}

function EmptyState({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--background)]/60 p-10 text-center backdrop-blur-2xl">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]">
        <BookOpen className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)]">Ask an Architecture Question</h3>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
        Get expert analysis on architecture patterns, technology trade-offs, scalability strategies, and engineering recommendations.
      </p>
      <div className="mt-6 w-full max-w-sm space-y-2 text-left">
        <SectionLabel>Example questions</SectionLabel>
        {EXAMPLE_QUESTIONS.slice(0, 3).map(({ q, tag }) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="group flex w-full items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background-2)]/80 p-3 text-left text-xs transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface)]"
          >
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent)] group-hover:text-[var(--text-primary)] transition-colors" />
            <span className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors leading-relaxed">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ResearchPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const charCount = question.length;
  const isOverLimit = charCount > MAX_QUESTION_LENGTH;
  const isUnderMin = question.trim().length < MIN_QUESTION_LENGTH;
  const canSubmit = !isOverLimit && !isUnderMin && !loading;

  const submit = useCallback(async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setIsFallback(false);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      const json = await res.json() as { success: boolean; data?: ResearchResult; error?: string; fallback?: boolean };

      if (!res.ok || !json.success) {
        setError(json.error ?? "Research could not be completed. Please try again.");
        return;
      }

      if (!json.data) {
        setError("Received an empty response from the server. Please try again.");
        return;
      }

      setResult(json.data);
      setIsFallback(json.fallback === true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [canSubmit, question]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const handleSelectQuestion = (q: string) => {
    setQuestion(q);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-6xl p-6 pb-20 pt-8 lg:p-10 lg:pt-10">
      <div className="mb-8 border-b border-[var(--border-subtle)] pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3.5 py-1 backdrop-blur-md">
          <BookOpen className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
            Architecture Research
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          AI Architecture Research
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Ask architecture questions and receive structured expert analysis — patterns, technology choices, trade-offs, scalability strategies, and concrete recommendations.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-b from-[var(--background-2)]/95 to-[var(--background)] p-5 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04]" />
            <div className="relative z-10">
              <SectionLabel>Research Prompt</SectionLabel>
              <textarea
                id="research-question-input"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                rows={6}
                maxLength={MAX_QUESTION_LENGTH + 100}
                placeholder="Describe your architecture challenge. For example: How should I design a real-time chat system that scales to 1 million concurrent users?"
                aria-label="Architecture research question"
                aria-describedby="char-count submit-hint"
                className="mt-2 w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-4 text-sm leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 outline-none transition-colors focus:border-[var(--accent)] focus:ring-0 disabled:opacity-50"
                disabled={loading}
              />
              <div className="mt-2 flex items-center justify-between">
                <span
                  id="char-count"
                  className={`font-mono text-[10px] ${
                    isOverLimit ? "text-rose-400" : charCount > 1800 ? "text-[var(--text-primary)]" : "text-[var(--accent)]"
                  }`}
                >
                  {charCount}/{MAX_QUESTION_LENGTH}
                </span>
                <span id="submit-hint" className="font-mono text-[10px] text-[var(--text-muted)]/40">
                  Ctrl+Enter to submit
                </span>
              </div>

              <button
                id="run-research-btn"
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                aria-label="Run architecture research"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--text-primary)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-accent)] transition-all hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Search className="h-4 w-4 animate-spin text-[var(--on-accent)]" />
                    Analyzing Architecture...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 text-[var(--on-accent)]" />
                    Run Architecture Research
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2.5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              <Lightbulb className="h-3.5 w-3.5 text-[var(--accent)]" />
              Suggested Questions
            </p>
            <div className="space-y-1.5">
              {EXAMPLE_QUESTIONS.map(({ q, tag }) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSelectQuestion(q)}
                  aria-label={`Research: ${q}`}
                  className="group flex w-full items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background-2)]/80 p-3 text-left text-xs transition-all hover:border-[var(--accent)]/50 hover:bg-[var(--surface)]"
                >
                  <span className="shrink-0 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    {tag}
                  </span>
                  <span className="line-clamp-2 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)] leading-relaxed">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/8 p-4 text-rose-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && <LoadingState />}

          {!result && !loading && !error && (
            <EmptyState onSelect={handleSelectQuestion} />
          )}

          {!result && !loading && error && (
            <EmptyState onSelect={handleSelectQuestion} />
          )}

          {result && !loading && (
            <div className="space-y-4" role="region" aria-label="Research results">
              {isFallback && (
                <div className="flex items-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                  <p className="text-[11px] text-[var(--text-primary)]">
                    Using built-in analysis — AI model unavailable
                  </p>
                </div>
              )}

              <ResultCard title={result.title} icon={<BookOpen className="h-4 w-4" />} accent>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{result.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--accent)]">Pattern:</span>
                  <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-3 py-0.5 font-mono text-[10px] font-bold text-[var(--text-primary)]">
                    {result.architecturePattern}
                  </span>
                </div>
              </ResultCard>

              <ResultCard title="Recommended Architecture" icon={<Layers className="h-4 w-4" />}>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{result.recommendedArchitecture}</p>
              </ResultCard>

              {result.technologyRecommendations.length > 0 && (
                <ResultCard title="Technology Stack" icon={<Cpu className="h-4 w-4" />}>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {result.technologyRecommendations.map((tech) => (
                      <div
                        key={tech.category + tech.name}
                        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/80 p-3.5"
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-[var(--accent)]">{getTechIcon(tech.category)}</span>
                          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--accent)]">
                            {tech.category}
                          </span>
                        </div>
                        <div className="mb-1.5 font-bold text-xs text-[var(--text-primary)]">{tech.name}</div>
                        <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{tech.reason}</p>
                      </div>
                    ))}
                  </div>
                </ResultCard>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <ResultCard title="Scalability" icon={<TrendingUp className="h-4 w-4" />}>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{result.scalability}</p>
                </ResultCard>
                <ResultCard title="Performance" icon={<Zap className="h-4 w-4" />}>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{result.performance}</p>
                </ResultCard>
                <ResultCard title="Latency Profile" icon={<Activity className="h-4 w-4" />}>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{result.latency}</p>
                </ResultCard>
                <ResultCard title="Reliability" icon={<Shield className="h-4 w-4" />}>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{result.reliability}</p>
                </ResultCard>
              </div>

              <ResultCard title="Security" icon={<Shield className="h-4 w-4" />}>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">{result.security}</p>
              </ResultCard>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ResultCard title="Data Strategy" icon={<Database className="h-4 w-4" />}>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{result.dataStrategy}</p>
                </ResultCard>
                <ResultCard title="Caching Strategy" icon={<Zap className="h-4 w-4" />}>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{result.cachingStrategy}</p>
                </ResultCard>
                <ResultCard title="Communication" icon={<Globe className="h-4 w-4" />}>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{result.communicationStrategy}</p>
                </ResultCard>
              </div>

              {result.tradeoffs.length > 0 && (
                <CollapsibleSection title="Trade-offs" icon={<GitBranch className="h-4 w-4" />}>
                  <ul className="space-y-2.5">
                    {result.tradeoffs.map((tradeoff, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span className="text-xs leading-relaxed text-[var(--text-muted)]">{tradeoff}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {result.alternatives.length > 0 && (
                <CollapsibleSection title="Alternative Approaches" icon={<Layers className="h-4 w-4" />}>
                  <div className="space-y-4">
                    {result.alternatives.map((alt) => (
                      <div key={alt.name} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/60 p-4">
                        <h4 className="mb-1.5 font-bold text-xs text-[var(--text-primary)]">{alt.name}</h4>
                        <p className="mb-3 text-[11px] leading-relaxed text-[var(--text-muted)]">{alt.description}</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <SectionLabel>Pros</SectionLabel>
                            <ul className="space-y-1">
                              {alt.pros.map((p, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent)]" />
                                  <span className="text-[11px] text-[var(--text-muted)]">{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <SectionLabel>Cons</SectionLabel>
                            <ul className="space-y-1">
                              {alt.cons.map((c, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent)]" />
                                  <span className="text-[11px] text-[var(--text-muted)]">{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {result.risks.length > 0 && (
                <CollapsibleSection title="Risks & Failure Modes" icon={<AlertTriangle className="h-4 w-4" />}>
                  <ul className="space-y-2.5">
                    {result.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                        <span className="text-xs leading-relaxed text-[var(--text-muted)]">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {result.recommendations.length > 0 && (
                <CollapsibleSection title="Recommendations" icon={<CheckCircle2 className="h-4 w-4" />} defaultOpen>
                  <ul className="space-y-2.5">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                        <span className="text-xs leading-relaxed text-[var(--text-muted)]">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              <div className="pt-1">
                <button
                  id="new-research-btn"
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                    setQuestion("");
                    setIsFallback(false);
                    const el = document.getElementById("research-question-input");
                    if (el) el.focus();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--background-2)] px-4 py-2.5 text-xs font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                >
                  <Search className="h-3.5 w-3.5" />
                  New Research Query
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
