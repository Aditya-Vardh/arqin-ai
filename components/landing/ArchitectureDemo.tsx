"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Layers, CheckCircle2, Zap, ShieldCheck } from "lucide-react";

type Node = {
  id: string;
  label: string;
  sub: string;
  accent: string;
};

const NODES: Node[] = [
  { id: "client", label: "Client App", sub: "React / Next.js", accent: "#7A9AC4" },
  { id: "gateway", label: "API Gateway", sub: "Traefik / Kong", accent: "#D6AD69" },
  { id: "auth", label: "Auth Service", sub: "OAuth2 / JWT", accent: "#D97878" },
  { id: "core", label: "Core Service", sub: "Node.js", accent: "#F0F1F3" },
  { id: "db", label: "Primary DB", sub: "PostgreSQL 16", accent: "#D6AD69" },
  { id: "cache", label: "Redis Cache", sub: "Sub-ms reads", accent: "#65A884" },
  { id: "ai", label: "AI Engine", sub: "Groq / LLaMA", accent: "#D6AD69" },
];

const CX = 190;
const NW = 172;
const NH = 48;
const SPACING = 64;

const sampleMermaid = `flowchart TB
  subgraph Client["Client Layer"]
    A["React Frontend"]
  end
  subgraph Backend["Backend Layer"]
    B["API Gateway"]
    C["Auth Service"]
    D["Core Service"]
  end
  subgraph Data["Data Layer"]
    E[("PostgreSQL")]
    F[("Redis Cache")]
  end
  A -->|HTTPS| B
  B --> C
  B --> D
  D --> E
  D --> F`;

export default function ArchitectureDemo() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tab, setTab] = useState<"visual" | "code">("visual");

  function isConnected(id: string) {
    if (!hovered) return false;
    const idx = NODES.findIndex((n) => n.id === id);
    const hIdx = NODES.findIndex((n) => n.id === hovered);
    return Math.abs(idx - hIdx) === 1;
  }

  return (
    <div
      className="relative w-full max-w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background-2)] shadow-[0_24px_60px_rgba(0,0,0,0.80)]"
      role="img"
      aria-label="Architecture preview — example only"
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />

      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
          </div>
          <span className="font-mono text-[10px] text-[var(--text-faint)]">
            architecture-canvas · example
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTab("visual")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-all ${
              tab === "visual"
                ? "bg-[var(--surface-elevated)] text-[var(--accent)] border border-[#D6AD69]/30"
                : "text-[var(--text-faint)] hover:text-[var(--text-muted)]"
            }`}
          >
            <Layers className="h-3 w-3" />
            Diagram
          </button>
          <button
            type="button"
            onClick={() => setTab("code")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-all ${
              tab === "code"
                ? "bg-[var(--surface-elevated)] text-[var(--accent)] border border-[#D6AD69]/30"
                : "text-[var(--text-faint)] hover:text-[var(--text-muted)]"
            }`}
          >
            <Code2 className="h-3 w-3" />
            Mermaid
          </button>

          <div className="ml-1 flex items-center gap-1.5 rounded-full border border-[#D6AD69]/20 bg-[var(--accent)]/6 px-2.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#65A884] animate-pulse" />
            <span className="text-[9px] font-semibold text-[var(--text-muted)]">Validated</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      {tab === "visual" ? (
        <div className="relative bg-[var(--background-2)] p-5">
          {/* Subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: "linear-gradient(rgba(48,54,64,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(48,54,64,0.6) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Feature annotations */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)]/80 px-2.5 py-1 text-[9px] text-[var(--text-faint)] backdrop-blur-sm">
            <Zap className="h-2.5 w-2.5 text-[var(--accent)]" />
            Hover to explore
          </div>
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)]/80 px-2.5 py-1 text-[9px] text-[var(--text-faint)] backdrop-blur-sm">
            <ShieldCheck className="h-2.5 w-2.5 text-[#65A884]" />
            Auto-validated
          </div>

          <svg
            viewBox={`0 0 380 ${NODES.length * SPACING + 30}`}
            className="relative z-10 mx-auto w-full max-w-[340px]"
            aria-hidden="true"
          >
            <defs>
              <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="var(--accent)" />
              </marker>
            </defs>

            {/* Edges */}
            {NODES.slice(0, -1).map((node, i) => {
              const next = NODES[i + 1];
              const active = hovered === node.id || hovered === next.id;
              const y1 = i * SPACING + NH + 8;
              const y2 = (i + 1) * SPACING + 4;
              return (
                <g key={`edge-${node.id}`}>
                  <motion.line
                    x1={CX} y1={y1} x2={CX} y2={y2}
                    stroke={active ? "#D6AD69" : "rgba(48,54,64,0.8)"}
                    strokeWidth={active ? 1.5 : 1}
                    strokeDasharray={active ? undefined : "3 3"}
                    markerEnd={active ? "url(#arrowAmber)" : undefined}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  />
                  {active && (
                    <circle r="2.5" fill="var(--accent)" opacity={0.8}>
                      <animateMotion
                        dur={`${1.2 + i * 0.1}s`}
                        repeatCount="indefinite"
                        path={`M${CX},${y1} L${CX},${y2}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node, i) => {
              const isHovered = hovered === node.id;
              const connected = isConnected(node.id);
              const y = i * SPACING + 4;
              const x = CX - NW / 2;
              return (
                <motion.g
                  key={node.id}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(node.id)}
                  onBlur={() => setHovered(null)}
                  initial={{ opacity: 0, y: y + 8 }}
                  animate={{ opacity: 1, y }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label}: ${node.sub}`}
                >
                  {/* Node background */}
                  <rect
                    x={x} y={0} width={NW} height={NH} rx="6"
                    fill={isHovered ? "#1D222A" : "#171A20"}
                    stroke={isHovered ? node.accent : (connected ? `${node.accent}55` : "#303640")}
                    strokeWidth={isHovered ? 1.5 : 1}
                  />
                  {/* Top accent bar */}
                  <rect x={x + 8} y={0} width={NW - 16} height={1.5} rx="0.75" fill={node.accent} opacity={isHovered ? 1 : 0.4} />

                  {/* Accent dot */}
                  <circle cx={x + 14} cy={NH / 2} r="3.5" fill={node.accent} opacity={isHovered ? 1 : 0.5} />

                  {/* Label */}
                  <text x={x + 28} y={NH / 2 - 5} fill="var(--text-primary)" fontSize="11.5" fontWeight="600" fontFamily="Inter, sans-serif">
                    {node.label}
                  </text>
                  <text x={x + 28} y={NH / 2 + 9} fill="#4A5060" fontSize="9" fontFamily="var(--font-geist-mono, monospace)">
                    {node.sub}
                  </text>
                </motion.g>
              );
            })}
          </svg>

          {/* Footer bar */}
          <div className="relative z-10 mt-3 flex items-center justify-between rounded-lg border border-[var(--surface-elevated)] bg-[var(--background)]/50 px-3 py-2 text-[9px] text-[var(--text-faint)]">
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#65A884]" />
              {NODES.length} components · {NODES.length - 1} connections
            </span>
            <span className="italic">Example architecture — for illustration only</span>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[460px] overflow-x-auto bg-[var(--background-2)] p-5 font-mono text-xs">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--surface-elevated)] pb-2">
            <span className="text-[9px] uppercase tracking-wider text-[var(--text-faint)]">Generated Mermaid.js · Example</span>
            <span className="flex items-center gap-1 text-[9px] text-[#65A884]">
              <CheckCircle2 className="h-3 w-3" />
              Valid syntax
            </span>
          </div>
          <pre className="leading-relaxed text-[var(--text-muted)]">{sampleMermaid}</pre>
        </div>
      )}
    </div>
  );
}
