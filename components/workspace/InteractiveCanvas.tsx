"use client";

/**
 * InteractiveCanvas — React Flow-powered interactive architecture diagram.
 *
 * Features:
 * - Draggable nodes (drag any block anywhere)
 * - Animated edges (moving arrow dashes)
 * - Node type colour-coding (frontend, gateway, db, cache, queue…)
 * - Click a node to select / inspect it
 * - After you move nodes the AI Optimize button re-analyses the graph
 * - Fit-to-view, zoom in/out toolbar
 */

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Maximize2, Plus, Minus, Sparkles, X, Check } from "lucide-react";
import type { ArchitectureGraph, ArchNode, ComponentType } from "@/lib/graph/types";
import type { ArchitectureResult } from "@/lib/storage/types";

// ─── Node type → colour mapping ─────────────────────────────────────────────
const TYPE_COLORS: Record<ComponentType, { bg: string; border: string; text: string; dot: string }> = {
  frontend:     { bg: "#161E2E", border: "#3B6EBA", text: "#93B8E8", dot: "#3B6EBA" },
  gateway:      { bg: "#1A1A10", border: "#D6AD69", text: "#D6AD69", dot: "#D6AD69" },
  microservice: { bg: "#141820", border: "#4A5060", text: "#D0D5DE", dot: "#6A7280" },
  database:     { bg: "#0E1A18", border: "#2D7A52", text: "#65A884", dot: "#2D7A52" },
  cache:        { bg: "#1A1410", border: "#C4832A", text: "#E0A855", dot: "#C4832A" },
  queue:        { bg: "#1A1020", border: "#7A4DB8", text: "#B080E0", dot: "#7A4DB8" },
  auth:         { bg: "#1A0E0E", border: "#B84444", text: "#E07070", dot: "#B84444" },
  storage:      { bg: "#121818", border: "#2D6A7A", text: "#5BA8B8", dot: "#2D6A7A" },
  worker:       { bg: "#181218", border: "#5A3870", text: "#9868B8", dot: "#5A3870" },
  external:     { bg: "#181818", border: "#5A5A6A", text: "#909098", dot: "#5A5A6A" },
};

const TYPE_LABELS: Record<ComponentType, string> = {
  frontend:     "UI",
  gateway:      "GW",
  microservice: "SVC",
  database:     "DB",
  cache:        "CACHE",
  queue:        "QUEUE",
  auth:         "AUTH",
  storage:      "S3",
  worker:       "WORKER",
  external:     "EXT",
};

// ─── Custom node component ───────────────────────────────────────────────────
function ArchNodeComponent({ data, selected }: NodeProps) {
  const d = data as { label: string; type: ComponentType; technology: string; selected?: boolean };
  const colors = TYPE_COLORS[d.type] ?? TYPE_COLORS.microservice;
  const typeLabel = TYPE_LABELS[d.type] ?? "SVC";

  return (
    <div
      style={{
        background: colors.bg,
        border: `1.5px solid ${selected ? "#D6AD69" : colors.border}`,
        borderRadius: "10px",
        padding: "10px 14px",
        minWidth: "130px",
        maxWidth: "200px",
        boxShadow: selected
          ? `0 0 0 2px rgba(214,173,105,0.35), 0 4px 20px rgba(0,0,0,0.5)`
          : `0 2px 12px rgba(0,0,0,0.45)`,
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        position: "relative",
        cursor: "grab",
      }}
    >
      {/* Top badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span
          style={{
            background: colors.dot,
            width: 6,
            height: 6,
            borderRadius: "50%",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: colors.dot,
            textTransform: "uppercase",
          }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Node name */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: colors.text,
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {d.label}
      </div>

      {/* Technology pill */}
      {d.technology && (
        <div
          style={{
            marginTop: 6,
            fontSize: 9,
            color: `${colors.text}80`,
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {d.technology}
        </div>
      )}

      {/* React Flow connection handles (invisible by default, shown on hover) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: colors.border, width: 8, height: 8, border: `1.5px solid ${colors.border}` }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: colors.border, width: 8, height: 8, border: `1.5px solid ${colors.border}` }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: colors.border, width: 8, height: 8, border: `1.5px solid ${colors.border}` }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: colors.border, width: 8, height: 8, border: `1.5px solid ${colors.border}` }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = { arch: ArchNodeComponent };

// ─── Layout helper — simple layered layout ───────────────────────────────────
function autoLayout(nodes: ArchNode[]): Record<string, { x: number; y: number }> {
  const LAYER_ORDER = [
    "Client Layer",
    "Ingress Layer",
    "Security Layer",
    "Business Logic Layer",
    "Event Bus Layer",
    "Background Worker Layer",
    "Persistence Layer",
    "External Services Layer",
  ];

  const byLayer: Record<string, ArchNode[]> = {};
  nodes.forEach(n => {
    const layer = n.layer || "Business Logic Layer";
    if (!byLayer[layer]) byLayer[layer] = [];
    byLayer[layer].push(n);
  });

  const positions: Record<string, { x: number; y: number }> = {};
  const NODE_W = 180;
  const NODE_H = 90;
  const H_GAP = 40;
  const V_GAP = 80;

  let y = 0;
  LAYER_ORDER.forEach(layer => {
    const layerNodes = byLayer[layer] || [];
    if (!layerNodes.length) return;

    const totalW = layerNodes.length * NODE_W + (layerNodes.length - 1) * H_GAP;
    let x = -totalW / 2;

    layerNodes.forEach(n => {
      positions[n.id] = { x, y };
      x += NODE_W + H_GAP;
    });

    y += NODE_H + V_GAP;
  });

  // Any nodes not in known layers
  let x = 0;
  nodes.forEach(n => {
    if (!positions[n.id]) {
      positions[n.id] = { x, y };
      x += NODE_W + H_GAP;
    }
  });

  return positions;
}

// ─── Convert ArchitectureGraph → React Flow nodes + edges ────────────────────
function graphToFlow(
  graph: ArchitectureGraph,
  selectedId: string | null,
): { rfNodes: Node[]; rfEdges: Edge[] } {
  const positions = autoLayout(graph.nodes);

  const rfNodes: Node[] = graph.nodes.map(n => ({
    id: n.id,
    type: "arch",
    position: positions[n.id] ?? { x: 0, y: 0 },
    data: {
      label: n.name,
      type: n.type,
      technology: n.technology,
    },
    selected: n.id === selectedId,
  }));

  const rfEdges: Edge[] = graph.edges.map(e => ({
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    label: e.label ?? "",
    animated: true,             // ← the moving arrow animation
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#D6AD69",
      width: 16,
      height: 16,
    },
    style: {
      stroke: e.isSync ? "#D6AD69" : "#7A4DB8",
      strokeWidth: 1.5,
      strokeDasharray: e.isSync ? undefined : "6 3",
    },
    labelStyle: {
      fill: "#A4AAB5",
      fontSize: 9,
      fontFamily: "monospace",
      fontWeight: 600,
    },
    labelBgStyle: {
      fill: "#0C0E12",
      fillOpacity: 0.85,
    },
    labelBgPadding: [4, 6] as [number, number],
    labelBgBorderRadius: 4,
  }));

  return { rfNodes, rfEdges };
}

// ─── Optimization suggestion overlay ─────────────────────────────────────────
function OptimizeSuggestion({
  suggestions,
  onDismiss,
}: {
  suggestions: string[];
  onDismiss: () => void;
}) {
  return (
    <div
      className="absolute bottom-14 right-4 z-30 max-w-[300px] rounded-2xl border"
      style={{
        background: "rgba(12,14,18,0.97)",
        borderColor: "rgba(214,173,105,0.30)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "rgba(214,173,105,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "#D6AD69" }} />
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "#D6AD69" }}
          >
            AI Suggestions
          </span>
        </div>
        <button onClick={onDismiss} className="text-[#6A7280] hover:text-[#F0F1F3] transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-2 p-4">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#D6AD69" }} />
            <p className="text-xs leading-relaxed" style={{ color: "#B8C0CC" }}>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inner canvas (needs ReactFlowProvider wrapping) ─────────────────────────
function FlowCanvas({
  graph,
  result,
  selectedComponent,
  onSelectComponent,
  onOptimize,
  aiSuggestions,
  onDismissSuggestions,
}: {
  graph: ArchitectureGraph;
  result?: ArchitectureResult;
  selectedComponent?: string | null;
  onSelectComponent?: (name: string | null) => void;
  onOptimize?: () => void;
  aiSuggestions?: string[];
  onDismissSuggestions?: () => void;
}) {
  const selectedId = useMemo(() => {
    if (!selectedComponent) return null;
    const found = graph.nodes.find(
      n => n.name.toLowerCase() === selectedComponent.toLowerCase()
        || n.id.toLowerCase() === selectedComponent.toLowerCase()
    );
    return found?.id ?? null;
  }, [selectedComponent, graph.nodes]);

  const { rfNodes: initialNodes, rfEdges: initialEdges } = useMemo(
    () => graphToFlow(graph, selectedId),
    [graph, selectedId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  // Re-sync when graph changes (new generation)
  useEffect(() => {
    const { rfNodes, rfEdges } = graphToFlow(graph, selectedId);
    setNodes(rfNodes);
    setEdges(rfEdges);
    setTimeout(() => fitView({ padding: 0.12, duration: 400 }), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  // Update selection highlight
  useEffect(() => {
    setNodes(prev =>
      prev.map(n => ({
        ...n,
        selected: n.id === selectedId,
      }))
    );
  }, [selectedId, setNodes]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            animated: true,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color: "#D6AD69", width: 16, height: 16 },
            style: { stroke: "#D6AD69", strokeWidth: 1.5 },
          },
          eds,
        )
      ),
    [setEdges],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const archNode = graph.nodes.find(n => n.id === node.id);
      if (archNode && onSelectComponent) {
        onSelectComponent(archNode.name);
      }
    },
    [graph.nodes, onSelectComponent],
  );

  const onPaneClick = useCallback(() => {
    onSelectComponent?.(null);
  }, [onSelectComponent]);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
        defaultEdgeOptions={{
          animated: true,
          type: "smoothstep",
        }}
      >
        {/* Dark grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="rgba(48,54,64,0.6)"
          style={{ background: "#101216" }}
        />

        {/* Built-in zoom/fit controls — styled to match app */}
        <Controls
          position="bottom-left"
          showInteractive={false}
          style={{
            background: "rgba(12,14,18,0.92)",
            border: "1px solid rgba(48,54,64,0.85)",
            borderRadius: "10px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            bottom: "52px",
          }}
        />

        {/* Mini-map */}
        <MiniMap
          position="bottom-right"
          nodeColor={n => {
            const t = (n.data as { type?: ComponentType }).type;
            return t ? TYPE_COLORS[t]?.border ?? "#4A5060" : "#4A5060";
          }}
          maskColor="rgba(16,18,22,0.75)"
          style={{
            background: "rgba(12,14,18,0.92)",
            border: "1px solid rgba(48,54,64,0.85)",
            borderRadius: "10px",
          }}
        />
      </ReactFlow>

      {/* Studio Canvas label */}
      <div
        className="pointer-events-none absolute left-4 top-4 z-30 rounded-lg border px-2.5 py-1.5"
        style={{
          borderColor: "rgba(48,54,64,0.85)",
          background: "rgba(12,14,18,0.88)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: "#D6AD69" }}>
          Studio Canvas
        </span>
      </div>

      {/* Selected node chip */}
      {selectedComponent && (
        <div
          className="absolute left-4 top-12 z-30 flex items-center gap-2 rounded-lg border px-3 py-1.5"
          style={{
            borderColor: "rgba(214,173,105,0.25)",
            background: "rgba(12,14,18,0.92)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#D6AD69" }} />
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: "#D6AD69" }}>Selected</span>
          <span className="max-w-[180px] truncate font-sans text-[10px]" style={{ color: "#F0F1F3" }}>{selectedComponent}</span>
          <button
            onClick={() => onSelectComponent?.(null)}
            className="text-[#6A7280] hover:text-[#F0F1F3] transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Drag hint */}
      <div
        className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border px-3 py-1.5"
        style={{
          borderColor: "rgba(48,54,64,0.85)",
          background: "rgba(12,14,18,0.88)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="font-mono text-[8px]" style={{ color: "rgba(107,114,128,0.8)" }}>
          Drag nodes · Scroll to zoom · Connect handles · Click to inspect
        </span>
      </div>

      {/* Optimize button */}
      {onOptimize && (
        <button
          onClick={onOptimize}
          className="absolute right-4 top-4 z-30 flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.97]"
          style={{
            borderColor: "rgba(214,173,105,0.30)",
            background: "rgba(214,173,105,0.10)",
            color: "#D6AD69",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Optimize
        </button>
      )}

      {/* AI suggestions overlay */}
      {aiSuggestions && aiSuggestions.length > 0 && (
        <OptimizeSuggestion
          suggestions={aiSuggestions}
          onDismiss={onDismissSuggestions ?? (() => {})}
        />
      )}
    </div>
  );
}

// ─── Public component (wraps with Provider) ──────────────────────────────────
type Props = {
  graph: ArchitectureGraph;
  result?: ArchitectureResult;
  selectedComponent?: string | null;
  onSelectComponent?: (name: string | null) => void;
  onOptimize?: () => void;
  aiSuggestions?: string[];
  onDismissSuggestions?: () => void;
};

export default function InteractiveCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
