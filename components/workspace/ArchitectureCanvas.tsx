"use client";

import {
  Check,
  Copy,
  FileType,
  Image as ImageIcon,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import mermaid from "mermaid";
import type { ArchitectureResult } from "@/lib/storage/types";
import { svgToPdf, svgToPng } from "@/lib/export";
import { renderMermaidSafe } from "@/lib/mermaid-repair";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
  look: "classic",

  flowchart: {
    htmlLabels: true,
    curve: "basis",
    nodeSpacing: 70,
    rankSpacing: 90,
    padding: 24,
    useMaxWidth: false,
  },

  themeVariables: {
    background: "#0C0E12",

    primaryColor: "#171A20",
    primaryTextColor: "#F0F1F3",
    primaryBorderColor: "#303640",

    secondaryColor: "#1D222A",
    secondaryTextColor: "#F0F1F3",
    secondaryBorderColor: "#303640",

    tertiaryColor: "#1D222A",
    tertiaryTextColor: "#A4AAB5",
    tertiaryBorderColor: "#303640",

    mainBkg: "#171A20",
    nodeBorder: "#303640",

    lineColor: "#D6AD69",
    defaultLinkColor: "#D6AD69",

    clusterBkg: "#0C0E12",
    clusterBorder: "#303640",

    titleColor: "#F0F1F3",
    edgeLabelBackground: "#0C0E12",
    nodeTextColor: "#F0F1F3",

    actorBkg: "#171A20",
    actorBorder: "#303640",
    actorTextColor: "#F0F1F3",

    signalColor: "#D6AD69",
    signalTextColor: "#F0F1F3",

    labelBoxBkgColor: "#171A20",
    labelBoxBorderColor: "#303640",
    labelTextColor: "#F0F1F3",

    fontFamily: "Inter, Arial, sans-serif",
    fontSize: "13px",
  },

  themeCSS: `
    .node rect,
    .node polygon,
    .node circle,
    .node ellipse {
      rx: 6px;
      ry: 6px;
      stroke-width: 1px;
    }

    .cluster rect {
      rx: 10px;
      ry: 10px;
      stroke-width: 1px;
      fill-opacity: 0.70;
    }

    .cluster-label text {
      font-family: Inter, Arial, sans-serif !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .nodeLabel,
    .label {
      font-family: Inter, Arial, sans-serif !important;
      font-weight: 600 !important;
    }

    .edgeLabel {
      background-color: #0C0E12 !important;
      color: #A4AAB5 !important;
      font-family: Inter, Arial, sans-serif !important;
      font-size: 10px !important;
      border-radius: 3px;
      padding: 2px 4px;
    }

    .edgePath .path {
      stroke-width: 1.2px;
    }

    .marker {
      fill: #D6AD69 !important;
      stroke: #D6AD69 !important;
    }

    .flowchart-link {
      stroke-linecap: round;
    }
  `,
});

type Props = {
  chart: string;
  result?: ArchitectureResult;
  onRegenerate?: () => void;
  selectedComponent?: string | null;
  highlightedNodeIds?: string[];
  onSelectComponent?: (name: string | null) => void;
};

type Point = {
  x: number;
  y: number;
};

export default function ArchitectureCanvas({
  chart,
  result,
  onRegenerate,
  selectedComponent,
  highlightedNodeIds = [],
  onSelectComponent,
}: Props) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const [view, setView] = useState<"diagram" | "code">("diagram");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repairedChart, setRepairedChart] = useState(chart);
  const [svgContent, setSvgContent] = useState("");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [diagramSize, setDiagramSize] = useState<Point>({
    x: 0,
    y: 0,
  });

  const getDiagramSize = useCallback(() => {
    const svg = diagramRef.current?.querySelector("svg");

    if (!svg) return null;

    const viewBox = svg.viewBox.baseVal;

    if (viewBox.width > 0 && viewBox.height > 0) {
      return {
        width: viewBox.width,
        height: viewBox.height,
      };
    }

    const box = svg.getBBox();

    if (box.width > 0 && box.height > 0) {
      return {
        width: box.width,
        height: box.height,
      };
    }

    return null;
  }, []);

  const fitToViewport = useCallback(
    (padding = 64) => {
      const viewport = viewportRef.current;
      const size = getDiagramSize();

      if (!viewport || !size) return;

      const availableWidth = Math.max(
        320,
        viewport.clientWidth - padding * 2,
      );

      const availableHeight = Math.max(
        260,
        viewport.clientHeight - padding * 2,
      );

      const widthScale =
        availableWidth / size.width;

      const heightScale =
        availableHeight / size.height;

      const nextScale = Math.min(
        1.4,
        Math.max(
          0.45,
          Math.min(widthScale, heightScale),
        ),
      );

      setScale(nextScale);
      setOffset({
        x: 0,
        y: 0,
      });

      setDiagramSize({
        x: size.width,
        y: size.height,
      });
    },
    [getDiagramSize],
  );

  const setupNodeListeners = useCallback(() => {
    if (!diagramRef.current || !onSelectComponent) {
      return;
    }

    const nodes =
      diagramRef.current.querySelectorAll(
        ".node, g[id*='flowchart-'], g.nodeGroup, g.cluster",
      );

    nodes.forEach((element) => {
      const node = element as HTMLElement;

      node.style.cursor = "pointer";

      node.onclick = (event) => {
        event.stopPropagation();

        const text =
          node.textContent?.trim();

        if (text) {
          onSelectComponent(text);
        }
      };
    });
  }, [onSelectComponent]);

  useEffect(() => {
    if (view !== "diagram") return;

    const abort =
      new AbortController();

    async function renderDiagram() {
      setError(null);

      try {
        const type =
          result?.diagramType ??
          "architecture";

        const { svg, repaired } =
          await renderMermaidSafe(
            mermaid,
            chart,
            type,
          );

        if (abort.signal.aborted) {
          return;
        }

        setRepairedChart(repaired);
        setSvgContent(svg);

        if (!diagramRef.current) {
          return;
        }

        diagramRef.current.innerHTML =
          svg;

        const svgElement =
          diagramRef.current.querySelector(
            "svg",
          );

        if (svgElement) {
          const viewBox =
            svgElement.viewBox.baseVal;

          svgElement.removeAttribute(
            "width",
          );

          svgElement.removeAttribute(
            "height",
          );

          svgElement.style.display =
            "block";

          svgElement.style.maxWidth =
            "none";

          svgElement.style.maxHeight =
            "none";

          svgElement.style.overflow =
            "visible";

          if (
            viewBox.width > 0 &&
            viewBox.height > 0
          ) {
            svgElement.style.width =
              `${viewBox.width}px`;

            svgElement.style.height =
              `${viewBox.height}px`;
          } else {
            const box =
              svgElement.getBBox();

            svgElement.style.width =
              `${box.width}px`;

            svgElement.style.height =
              `${box.height}px`;
          }
        }

        requestAnimationFrame(() => {
          if (abort.signal.aborted) {
            return;
          }

          setupNodeListeners();

          requestAnimationFrame(() => {
            if (abort.signal.aborted) {
              return;
            }

            fitToViewport();
          });
        });
      } catch (err) {
        if (abort.signal.aborted) {
          return;
        }

        console.error(
          "[ArchitectureCanvas] render error:",
          err,
        );

        setError(
          "Diagram render failed. View source or regenerate.",
        );

        if (diagramRef.current) {
          diagramRef.current.innerHTML =
            "";
        }
      }
    }

    renderDiagram();

    return () => {
      abort.abort();
    };
  }, [
    chart,
    result,
    view,
    setupNodeListeners,
    fitToViewport,
  ]);

  useEffect(() => {
    if (!diagramRef.current) {
      return;
    }

    const nodes =
      diagramRef.current.querySelectorAll(
        ".node, g[id*='flowchart-'], g.nodeGroup",
      );

    nodes.forEach((element) => {
      const node =
        element as HTMLElement;

      const text =
        node.textContent
          ?.trim()
          .toLowerCase() ?? "";

      const selected =
        !!selectedComponent &&
        text.includes(
          selectedComponent.toLowerCase(),
        );

      const highlighted =
        highlightedNodeIds.some((id) =>
          text.includes(
            id.toLowerCase(),
          ),
        );

      if (selected || highlighted) {
        node.style.outline =
          "2px solid #D6AD69";

        node.style.outlineOffset =
          "5px";

        node.style.filter =
          "drop-shadow(0 0 10px rgba(var(--accent-rgb,214,173,105),0.4))";
      } else {
        node.style.outline =
          "none";

        node.style.filter =
          "none";
      }
    });
  }, [
    selectedComponent,
    highlightedNodeIds,
    svgContent,
  ]);

  useEffect(() => {
    const viewport =
      viewportRef.current;

    if (
      !viewport ||
      view !== "diagram"
    ) {
      return;
    }

    const observer =
      new ResizeObserver(() => {
        if (
          !dragRef.current.active
        ) {
          requestAnimationFrame(() =>
            fitToViewport(),
          );
        }
      });

    observer.observe(viewport);

    return () =>
      observer.disconnect();
  }, [
    fitToViewport,
    view,
  ]);

  const zoom = useCallback(
    (delta: number) => {
      setScale((current) =>
        Math.min(
          2.2,
          Math.max(
            0.35,
            current + delta,
          ),
        ),
      );
    },
    [],
  );

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const target =
      event.target as Element;

    if (
      target.closest(
        ".node, .cluster, .edgeLabel, button, pre",
      )
    ) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };

    setIsPanning(true);

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      !dragRef.current.active ||
      dragRef.current.pointerId !==
      event.pointerId
    ) {
      return;
    }

    setOffset({
      x:
        dragRef.current.offsetX +
        event.clientX -
        dragRef.current.startX,

      y:
        dragRef.current.offsetY +
        event.clientY -
        dragRef.current.startY,
    });
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      dragRef.current.pointerId !==
      event.pointerId
    ) {
      return;
    }

    dragRef.current.active =
      false;

    dragRef.current.pointerId =
      -1;

    setIsPanning(false);

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(
      repairedChart,
    );

    setCopied(true);

    setTimeout(
      () => setCopied(false),
      1800,
    );
  }

  function handleExportPng() {
    if (!svgContent) return;

    svgToPng(
      svgContent,
      `${(
        result?.title ||
        "architecture"
      )
        .toLowerCase()
        .replace(
          /\s+/g,
          "-",
        )}.png`,
    );
  }

  function handleExportPdf() {
    if (!svgContent) return;

    svgToPdf(
      svgContent,
      `${(
        result?.title ||
        "architecture"
      )
        .toLowerCase()
        .replace(
          /\s+/g,
          "-",
        )}.pdf`,
    );
  }

  const percentage =
    Math.round(scale * 100);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(var(--accent-rgb,214,173,105),0.04),transparent_50%)]" />

        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(48,54,64,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(48,54,64,0.55)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative z-20 flex h-11 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--background-2)]/96 px-3 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setView("diagram")
            }
            className={`rounded-lg px-3 py-1.5 font-[var(--font-space-grotesk)] text-[10px] font-bold transition-colors ${view === "diagram"
                ? "bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)]/60 hover:text-[var(--text-primary)]"
              }`}
          >
            Diagram
          </button>

          <button
            type="button"
            onClick={() =>
              setView("code")
            }
            className={`rounded-lg px-3 py-1.5 font-[var(--font-space-grotesk)] text-[10px] font-bold transition-colors ${view === "code"
                ? "bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)]/60 hover:text-[var(--text-primary)]"
              }`}
          >
            Source
          </button>

          {view === "diagram" &&
            diagramSize.x > 0 && (
              <span className="ml-2 hidden font-[var(--font-geist-mono)] text-[9px] text-[var(--text-muted)]/40 lg:inline">
                {Math.round(
                  diagramSize.x,
                )}{" "}
                ×{" "}
                {Math.round(
                  diagramSize.y,
                )}
              </span>
            )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              fitToViewport()
            }
            className="mr-1 flex h-7 items-center gap-1.5 rounded-lg px-2.5 font-[var(--font-space-grotesk)] text-[10px] font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Fit
          </button>

          <div className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />

          <button
            type="button"
            onClick={() =>
              zoom(0.1)
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)]/70 transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          <span className="w-10 text-center font-[var(--font-geist-mono)] text-[9px] text-[var(--text-muted)]/70">
            {percentage}%
          </span>

          <button
            type="button"
            onClick={() =>
              zoom(-0.1)
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)]/70 transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setScale(1);
              setOffset({
                x: 0,
                y: 0,
              });
            }}
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)]/70 transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />

          <button
            type="button"
            onClick={
              handleExportPng
            }
            className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 font-[var(--font-space-grotesk)] text-[10px] font-semibold text-[var(--text-muted)]/70 transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            PNG
          </button>

          <button
            type="button"
            onClick={
              handleExportPdf
            }
            className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 font-[var(--font-space-grotesk)] text-[10px] font-semibold text-[var(--text-muted)]/70 transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <FileType className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className={`relative z-10 min-h-0 flex-1 overflow-hidden ${isPanning
            ? "cursor-grabbing"
            : "cursor-grab"
          }`}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerUp
        }
        onDoubleClick={() =>
          fitToViewport()
        }
      >
        <div className="pointer-events-none absolute left-4 top-4 z-30 rounded-lg border border-[var(--border-subtle)] bg-[var(--background-2)]/88 px-2.5 py-1.5 backdrop-blur-xl">
          <span className="font-[var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Studio Canvas
          </span>
        </div>

        {selectedComponent && (
          <div className="absolute left-4 top-12 z-30 flex max-w-[360px] items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--background-2)]/95 px-3 py-1.5 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />

            <span className="font-[var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Selected
            </span>

            <span className="truncate font-[var(--font-inter)] text-[10px] text-[var(--text-primary)]">
              {selectedComponent}
            </span>

            <button
              type="button"
              onClick={() =>
                onSelectComponent?.(
                  null,
                )
              }
              className="ml-1 text-[var(--text-muted)]/60 hover:text-[var(--text-primary)]"
            >
              ×
            </button>
          </div>
        )}

        {view === "diagram" ? (
          <div
            ref={diagramRef}
            className="absolute left-1/2 top-1/2 flex origin-center items-center justify-center transition-transform duration-150 ease-out"
            style={{
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
            }}
          />
        ) : (
          <div className="mx-auto h-full max-w-5xl overflow-auto p-8">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={
                  handleCopy
                }
                className="flex items-center gap-2 rounded-lg bg-[var(--text-primary)] px-3 py-2 font-[var(--font-space-grotesk)] text-[10px] font-bold text-[var(--on-accent)]"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}

                {copied
                  ? "Copied"
                  : "Copy Source"}
              </button>
            </div>

            <pre className="overflow-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--background-2)] p-6 font-[var(--font-geist-mono)] text-[11px] leading-6 text-[var(--text-muted)]">
              {repairedChart}
            </pre>
          </div>
        )}

        {view === "diagram" && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[var(--border-subtle)] bg-[var(--background-2)]/90 px-3 py-1.5 font-[var(--font-geist-mono)] text-[8px] text-[var(--text-muted)]/60 backdrop-blur-xl">
            Drag to pan · Double-click to fit
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[var(--background)]/95">
            <div className="text-center">
              <p className="font-[var(--font-space-grotesk)] text-sm font-bold text-[var(--text-primary)]">
                Diagram rendering failed
              </p>

              <p className="mt-2 font-[var(--font-inter)] text-xs text-[var(--text-muted)]">
                {error}
              </p>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={
                    onRegenerate
                  }
                  className="mt-5 rounded-lg bg-[var(--text-primary)] px-4 py-2 font-[var(--font-space-grotesk)] text-xs font-bold text-[var(--on-accent)]"
                >
                  Regenerate
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}