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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-[#D6AD69]/30 bg-[#171A20]/95 px-5 py-3 text-xs font-bold text-[#F0F1F3] shadow-[0_0_35px_rgba(0,0,0,0.85),0_0_24px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:border-[#D6AD69]/55 hover:bg-[#1D222A]"
        aria-label="Open Arqin AI Copilot"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D6AD69]/30 bg-[#D6AD69]/10 text-[#D6AD69]">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <span>Ask Arqin AI</span>
        <span className="text-[#D6AD69]">Copilot</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[26px] border border-[#A4AAB5]/12 bg-[#0C0E12]/96 text-[#F0F1F3] shadow-[0_0_70px_rgba(0,0,0,0.9),0_0_35px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#A4AAB5]/10 bg-[#171A20]/90 px-4 py-3.5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#D6AD69]/30 bg-[#D6AD69]/10 text-[#D6AD69]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-[#F0F1F3]">Arqin AI</p>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#D6AD69]">
                Copilot
              </span>
            </div>
            {projectTitle && (
              <p className="mt-0.5 max-w-[190px] truncate text-[10px] text-[#A4AAB5]">
                {projectTitle}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-transparent p-1.5 text-[#A4AAB5] transition-all hover:border-[#4A5060] hover:bg-[#1D222A] hover:text-[#F0F1F3]"
          aria-label="Close Copilot"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick actions bar */}
      {(onOptimize || onSimulate || onArtifacts) && (
        <div className="grid grid-cols-3 gap-1.5 border-b border-[#A4AAB5]/10 bg-[#101216] p-2 shrink-0">
          {onOptimize && (
            <button
              type="button"
              onClick={() => { onOptimize(); setOpen(false); }}
              className="flex items-center justify-center gap-1 rounded-xl border border-[#D6AD69]/30 bg-[#D6AD69]/10 py-1.5 text-[10px] font-bold text-[#D6AD69] transition-all hover:border-[#D6AD69]/50 hover:bg-[#D6AD69]/20"
            >
              <Zap className="h-3 w-3" />
              Optimize
            </button>
          )}
          {onSimulate && (
            <button
              type="button"
              onClick={() => { onSimulate(); setOpen(false); }}
              className="flex items-center justify-center gap-1 rounded-xl border border-[#4A5060] bg-[#171A20] py-1.5 text-[10px] font-bold text-[#A4AAB5] transition-all hover:border-[#D6AD69]/40 hover:text-[#F0F1F3]"
            >
              <Cpu className="h-3 w-3 text-[#D6AD69]" />
              Simulate
            </button>
          )}
          {onArtifacts && (
            <button
              type="button"
              onClick={() => { onArtifacts(); setOpen(false); }}
              className="flex items-center justify-center gap-1 rounded-xl border border-[#4A5060] bg-[#171A20] py-1.5 text-[10px] font-bold text-[#A4AAB5] transition-all hover:border-[#D6AD69]/40 hover:text-[#F0F1F3]"
            >
              <Code2 className="h-3 w-3 text-[#D6AD69]" />
              Artifacts
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#101216] p-4">
        {messages.length === 0 && (
          <div className="space-y-4 p-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D6AD69]/30 bg-[#D6AD69]/10 text-[#D6AD69]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F0F1F3]">Architecture intelligence</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[#A4AAB5]">
                Ask questions about your architecture. Say <em>&ldquo;Add Redis&rdquo;</em> to propose a modification.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {CONTEXTUAL_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-[#4A5060] bg-[#171A20] px-2.5 py-1.5 text-[10px] text-[#A4AAB5] transition-all hover:border-[#D6AD69]/40 hover:bg-[#D6AD69]/10 hover:text-[#F0F1F3]"
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
              <div className="flex items-center gap-2 rounded-lg border border-[#D6AD69]/15 bg-[#D6AD69]/05 px-3 py-2 text-[10px] text-[#D6AD69]">
                <Loader2 className="h-3 w-3 animate-spin" />
                {msg.text}
              </div>
            ) : (
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#F0F1F3] font-medium text-[#101216]"
                      : "border border-[#A4AAB5]/12 bg-[#171A20] text-[#A4AAB5]"
                  }`}
                >
                  {/* Render basic markdown-like bold */}
                  {msg.text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
                    i % 2 === 1
                      ? <strong key={i} className="text-[#F0F1F3]">{part}</strong>
                      : <span key={i}>{part}</span>
                  )}

                  {/* Modification proposal — confirm/cancel buttons */}
                  {msg.isModificationProposal && msg.proposedChanges && pendingModification && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => applyModification(msg.proposedChanges!.description)}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-lg bg-[#D6AD69] px-3 py-1.5 text-[10px] font-bold text-[#101216] transition-all hover:bg-[#E0BC7A] disabled:opacity-50"
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
                        className="flex items-center gap-1.5 rounded-lg border border-[#303640] bg-[#101216] px-3 py-1.5 text-[10px] font-bold text-[#A4AAB5] transition-all hover:text-[#F0F1F3]"
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
          <div className="flex items-center gap-2 rounded-xl border border-[#D6AD69]/20 bg-[#D6AD69]/10 p-2.5 font-mono text-[10px] text-[#D6AD69]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Analysing architecture…</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-[#D6AD69]/20 bg-[#D6AD69]/10 p-2.5 font-mono text-[10px] text-[#D6AD69]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Applying architecture changes…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2 border-t border-[#A4AAB5]/10 bg-[#171A20]/95 p-3 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pendingModification ? "Pending confirmation above…" : "Ask anything or say 'Add Redis'…"}
          disabled={!!pendingModification}
          className="flex-1 rounded-xl border border-[#4A5060] bg-[#101216] px-3 py-2.5 text-xs text-[#F0F1F3] outline-none placeholder:text-[#A4AAB5]/50 transition-all focus:border-[#D6AD69] focus:ring-1 focus:ring-[#D6AD69]/20 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy || !!pendingModification}
          className="rounded-xl bg-[#F0F1F3] p-2.5 text-[#101216] transition-all hover:bg-[#E0BC7A] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5 text-[#D6AD69]" />
        </button>
      </form>
    </div>
  );
}
