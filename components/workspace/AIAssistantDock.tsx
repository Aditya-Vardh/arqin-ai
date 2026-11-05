"use client";

import {
  Bot,
  Send,
  Loader2,
  X,
  Sparkles,
  Zap,
  Cpu,
  Code2,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Quick questions that are purely informational — never modify architecture
const CONTEXTUAL_QUESTIONS = [
  "What is this architecture?",
  "Explain the data flow",
  "What are the security risks?",
  "How does this scale?",
  "What are the bottlenecks?",
];

type CopilotResponse =
  | { type: "answer"; text: string }
  | { type: "proposal"; text: string; proposedChanges: { description: string } };

type Message = {
  id: string;
  role: "user" | "ai" | "system";
  text: string;
  isModificationProposal?: boolean;
  proposedChanges?: { description: string };
};

type Props = {
  /**
   * Called when user submits a message. Routes to /api/copilot.
   * Returns { type: 'answer', text } for chat, { type: 'proposal', ... } for modifications.
   * NEVER calls generate() directly — architecture is only changed via onApplyModification.
   */
  onAsk: (message: string) => Promise<CopilotResponse | null>;
  /**
   * Called ONLY when the user explicitly clicks "Apply" on a modification proposal.
   * This is the SOLE path from copilot to architecture changes.
   */
  onApplyModification: (instruction: string) => Promise<string | null>;
  loading?: boolean;
  projectTitle?: string;
  onOptimize?: () => void;
  onSimulate?: () => void;
  onArtifacts?: () => void;
};

export default function AIAssistantDock({
  onAsk,
  onApplyModification,
  loading,
  projectTitle,
  onOptimize,
  onSimulate,
  onArtifacts,
}: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [pendingModification, setPendingModification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMessage(msg: Omit<Message, "id">) {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    ]);
  }

  /**
   * Apply a confirmed modification.
   * This is the ONLY path that calls onApplyModification, which calls generate().
   * It is only reachable via an explicit "Apply" button click after a proposal.
   */
  async function applyModification(instruction: string) {
    setPendingModification(null);
    setBusy(true);
    addMessage({ role: "system", text: `Applying modification: "${instruction}"…` });

    try {
      const result = await onApplyModification(instruction);
      if (result) {
        addMessage({ role: "ai", text: `✓ ${result}` });
      } else {
        addMessage({ role: "ai", text: "Modification could not be applied. The previous architecture is preserved." });
      }
    } catch {
      addMessage({ role: "ai", text: "Failed to apply modification. Your architecture is unchanged." });
    } finally {
      setBusy(false);
    }
  }

  /**
   * Submit handler — calls onAsk (→ /api/copilot) ONLY.
   * Never calls generate() or onApplyModification directly.
   * Architecture is ONLY changed when the user clicks "Apply" on a proposal.
   */
  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setInput("");
    addMessage({ role: "user", text: trimmed });
    setPendingModification(null);

    setBusy(true);
    try {
      const response = await onAsk(trimmed);
      if (!response) {
        addMessage({ role: "ai", text: "Sorry, I couldn't process that. Please try again." });
        return;
      }

      if (response.type === "answer") {
        // Pure chat/analysis — display answer, ZERO architecture changes
        addMessage({ role: "ai", text: response.text });
      } else if (response.type === "proposal") {
        // Modification proposal — show with Apply/Cancel, ZERO architecture changes yet
        setPendingModification(response.proposedChanges.description);
        addMessage({
          role: "ai",
          text: response.text,
          isModificationProposal: true,
          proposedChanges: response.proposedChanges,
        });
      }
    } catch {
      addMessage({ role: "ai", text: "Network error — please check your connection." });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-[var(--accent)]/30 bg-[var(--surface)]/95 px-5 py-3 text-xs font-bold text-[var(--text-primary)] shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_24px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:border-[var(--accent)]/55 hover:bg-[var(--surface-elevated)]"
        aria-label="Open Arqin AI Copilot"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <span>Ask Arqin AI</span>
        <span className="text-[var(--accent)]">Copilot</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[26px] border border-[var(--border-subtle)] bg-[var(--background-2)]/96 text-[var(--text-primary)] shadow-[0_0_70px_rgba(0,0,0,0.9),0_0_35px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface)]/90 px-4 py-3.5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-[var(--text-primary)]">Arqin AI</p>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Copilot
              </span>
            </div>
            {projectTitle && (
              <p className="mt-0.5 max-w-[190px] truncate text-[10px] text-[var(--text-muted)]">
                {projectTitle}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-transparent p-1.5 text-[var(--text-muted)] transition-all hover:border-[var(--text-faint)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          aria-label="Close Copilot"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick actions bar */}
      {(onOptimize || onSimulate || onArtifacts) && (
        <div className="grid grid-cols-3 gap-1.5 border-b border-[var(--border-subtle)] bg-[var(--background)] p-2 shrink-0">
          {onOptimize && (
            <button
              type="button"
              onClick={() => { onOptimize(); setOpen(false); }}
              className="flex items-center justify-center gap-1 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 py-1.5 text-[10px] font-bold text-[var(--accent)] transition-all hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/20"
            >
              <Zap className="h-3 w-3" />
              Optimize
            </button>
          )}
          {onSimulate && (
            <button
              type="button"
              onClick={() => { onSimulate(); setOpen(false); }}
              className="flex items-center justify-center gap-1 rounded-xl border border-[var(--text-faint)] bg-[var(--surface)] py-1.5 text-[10px] font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
            >
              <Cpu className="h-3 w-3 text-[var(--accent)]" />
              Simulate
            </button>
          )}
          {onArtifacts && (
            <button
              type="button"
              onClick={() => { onArtifacts(); setOpen(false); }}
              className="flex items-center justify-center gap-1 rounded-xl border border-[var(--text-faint)] bg-[var(--surface)] py-1.5 text-[10px] font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
            >
              <Code2 className="h-3 w-3 text-[var(--accent)]" />
              Artifacts
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--background)] p-4">
        {messages.length === 0 && (
          <div className="space-y-4 p-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Architecture intelligence</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--text-muted)]">
                Ask questions about your architecture. Say <em>&ldquo;Add Redis&rdquo;</em> to propose a modification.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {CONTEXTUAL_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-[var(--text-faint)] bg-[var(--surface)] px-2.5 py-1.5 text-[10px] text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 hover:text-[var(--text-primary)]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "system" ? (
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] ${
                (msg.text.toLowerCase().includes("error") || msg.text.toLowerCase().includes("failed"))
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                  : "border-[var(--accent)]/15 bg-[var(--accent)]/05 text-[var(--accent)]"
              }`}>
                <Loader2 className="h-3 w-3 animate-spin" />
                {msg.text}
              </div>
            ) : (
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--text-primary)] font-medium text-[var(--on-accent)]"
                      : "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)]"
                  }`}
                >
                  {/* Render basic markdown-like bold */}
                  {msg.text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
                    i % 2 === 1
                      ? <strong key={i} className="text-[var(--text-primary)]">{part}</strong>
                      : <span key={i}>{part}</span>
                  )}

                  {/* Modification proposal — confirm/cancel buttons */}
                  {msg.isModificationProposal && msg.proposedChanges && pendingModification && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => applyModification(msg.proposedChanges!.description)}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[10px] font-bold text-[var(--on-accent)] transition-all hover:bg-[var(--accent-hover)] disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" />
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingModification(null);
                          addMessage({ role: "ai", text: "Modification cancelled. Architecture is unchanged." });
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] transition-all hover:text-[var(--text-primary)]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {(busy && messages.length > 0 && messages[messages.length - 1]?.role === "user") && (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-2.5 text-[var(--accent)]">
            <div className="flex items-center gap-1 px-1 py-0.5">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
            <span className="font-mono text-[10px]">Analysing architecture…</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-2.5 text-[var(--accent)]">
            <div className="flex items-center gap-1 px-1 py-0.5">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
            <span className="font-mono text-[10px]">Applying architecture changes…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2 border-t border-[var(--border-subtle)] bg-[var(--surface)]/95 p-3 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pendingModification ? "Pending confirmation above…" : "Ask anything or say 'Add Redis'…"}
          disabled={!!pendingModification || busy}
          className={`flex-1 rounded-xl border border-[var(--text-faint)] bg-[var(--background)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]/50 transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed ${(!!pendingModification || busy) ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        <button
          type="submit"
          disabled={!input.trim() || busy || !!pendingModification}
          className="rounded-xl bg-[var(--text-primary)] p-2.5 text-[var(--on-accent)] transition-all hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5 text-[var(--accent)]" />
        </button>
      </form>
    </div>
  );
}
