"use client";

import { X, Layers, ArrowRight, ShieldCheck, Zap, AlertTriangle, Cpu } from "lucide-react";
import type { ArchNode, ArchitectureGraph } from "@/lib/graph/types";

type Props = {
  node: ArchNode;
  graph: ArchitectureGraph;
  onClose: () => void;
};

export default function ComponentDetailModal({ node, graph, onClose }: Props) {
  const incomingEdges = graph.edges.filter((e) => e.targetId === node.id);
  const outgoingEdges = graph.edges.filter((e) => e.sourceId === node.id);

  const incomingNodes = incomingEdges.map((e) => graph.nodes.find((n) => n.id === e.sourceId)).filter(Boolean) as ArchNode[];
  const outgoingNodes = outgoingEdges.map((e) => graph.nodes.find((n) => n.id === e.targetId)).filter(Boolean) as ArchNode[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl animate-fade-in">
      <div className="flex h-[80vh] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-[var(--background)] text-[var(--text-primary)] shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--accent)]/15 bg-[var(--background)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-[#A08050] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[var(--background)]">
                <Layers className="h-5 w-5 text-[var(--accent)]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{node.name}</h2>
                <span className="rounded-md bg-[var(--accent)]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--accent)] uppercase">
                  {node.type}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Component Intelligence Specification &amp; Dependency Tree</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--accent)]/15 bg-[var(--background)] p-2 text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[var(--background-2)]">
          {/* Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-4">
              <p className="font-mono text-[10px] uppercase text-[var(--text-faint)]">Layer Tier</p>
              <p className="mt-1 font-bold text-sm text-[var(--text-primary)]">{node.layer}</p>
            </div>
            <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-4">
              <p className="font-mono text-[10px] uppercase text-[var(--text-faint)]">Technology Stack</p>
              <p className="mt-1 font-bold text-sm text-[var(--accent)]">{node.technology}</p>
            </div>
            <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-4">
              <p className="font-mono text-[10px] uppercase text-[var(--text-faint)]">Scaling Strategy</p>
              <p className="mt-1 font-bold text-xs text-[var(--text-primary)]">{node.scalingStrategy}</p>
            </div>
            <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-4">
              <p className="font-mono text-[10px] uppercase text-[var(--text-faint)]">Risk Rating</p>
              <p className="mt-1 font-bold text-xs text-amber-400">{node.riskLevel}</p>
            </div>
          </div>

          {/* Component Description */}
          <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-5 space-y-2">
            <p className="font-mono text-[11px] font-bold uppercase text-[var(--accent)]">Purpose &amp; Functional Spec</p>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">{node.description}</p>
          </div>

          {/* Dependencies: Inbound & Outbound */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inbound */}
            <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-5 space-y-3">
              <p className="font-mono text-[11px] font-bold uppercase text-[var(--text-muted)]">Inbound Dependencies ({incomingNodes.length})</p>
              {incomingNodes.length === 0 ? (
                <p className="text-xs text-[var(--text-faint)]">No incoming service callers (Entry point).</p>
              ) : (
                <ul className="space-y-2">
                  {incomingNodes.map((inNode) => (
                    <li key={inNode.id} className="flex items-center justify-between rounded-xl border border-[var(--accent)]/10 bg-[var(--background-2)] p-2.5 text-xs text-[var(--text-primary)]">
                      <span>{inNode.name}</span>
                      <span className="font-mono text-[10px] text-[var(--accent)]">HTTPS / REST</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Outbound */}
            <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-5 space-y-3">
              <p className="font-mono text-[11px] font-bold uppercase text-[var(--text-muted)]">Outbound Calls ({outgoingNodes.length})</p>
              {outgoingNodes.length === 0 ? (
                <p className="text-xs text-[var(--text-faint)]">No outgoing dependencies (Terminal persistence node).</p>
              ) : (
                <ul className="space-y-2">
                  {outgoingNodes.map((outNode) => (
                    <li key={outNode.id} className="flex items-center justify-between rounded-xl border border-[var(--accent)]/10 bg-[var(--background-2)] p-2.5 text-xs text-[var(--text-primary)]">
                      <span>{outNode.name}</span>
                      <span className="font-mono text-[10px] text-[var(--accent)]">Connection Pool</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
