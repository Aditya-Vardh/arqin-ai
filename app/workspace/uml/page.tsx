"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GitBranch, Sparkles, CheckCircle2, ArrowRight, Wand2, RefreshCw, AlertCircle, Layers } from "lucide-react";
import type { DiagramType, ArchitectureResult } from "@/lib/storage/types";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";
import ArchitectureCanvas from "@/components/workspace/ArchitectureCanvas";

const UML_TYPES: { id: DiagramType; label: string; desc: string }[] = [
  { id: "class", label: "Class Diagram", desc: "Object-oriented structure, attributes, methods, & relationships" },
  { id: "sequence", label: "Sequence Diagram", desc: "Time-ordered interaction flow between components & objects" },
  { id: "component", label: "Component Diagram", desc: "High-level physical modules, libraries, & API interfaces" },
  { id: "deployment", label: "Deployment Diagram", desc: "Hardware nodes, servers, container clusters, & networks" },
  { id: "er", label: "Entity-Relationship (ER)", desc: "Database tables, primary keys, foreign keys, & cardinalities" },
  { id: "state", label: "State Machine", desc: "State transitions, triggers, conditions, & lifecycle flow" },
];

const EXAMPLE_PROMPTS: Record<DiagramType, string> = {
  class: "E-commerce system with User, Product, Order, and Payment classes with their relationships",
  sequence: "User login flow with JWT authentication, refresh tokens, and database session storage",
  component: "Microservices backend with API Gateway, Auth Service, Product Service, and Message Queue",
  deployment: "Kubernetes cluster with frontend pods, backend API, PostgreSQL database, and Redis cache",
  er: "Blog platform with Users, Posts, Comments, Tags, and Categories with all foreign key relationships",
  state: "Order lifecycle: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled with transitions",
  flowchart: "CI/CD pipeline from code commit to production deployment",
  architecture: "Scalable SaaS platform with multi-tenant support, background jobs, and real-time notifications",
};

/* ─── Inline SVG miniature diagrams per UML type ─── */

function ClassDiagramSVG() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Class Diagram preview">
      {/* User class box */}
      <rect x="1" y="1" width="28" height="27" rx="1" stroke="#D6AD69" strokeWidth="1.2" fill="rgba(214,173,105,0.07)" />
      <line x1="1" y1="9" x2="29" y2="9" stroke="#D6AD69" strokeWidth="1" />
      <text x="15" y="7" textAnchor="middle" fontSize="4.5" fill="#D6AD69" fontFamily="monospace" fontWeight="bold">User</text>
      <line x1="1" y1="17" x2="29" y2="17" stroke="#D6AD69" strokeWidth="0.8" opacity="0.5" />
      <line x1="4" y1="12" x2="26" y2="12" stroke="#D6AD69" strokeWidth="0.7" opacity="0.55" />
      <line x1="4" y1="14.5" x2="26" y2="14.5" stroke="#D6AD69" strokeWidth="0.7" opacity="0.55" />
      <line x1="4" y1="20" x2="26" y2="20" stroke="#D6AD69" strokeWidth="0.7" opacity="0.45" />
      <line x1="4" y1="22.5" x2="22" y2="22.5" stroke="#D6AD69" strokeWidth="0.7" opacity="0.45" />
      {/* Order class box */}
      <rect x="51" y="1" width="28" height="24" rx="1" stroke="#D6AD69" strokeWidth="1.2" fill="rgba(214,173,105,0.07)" />
      <line x1="51" y1="9" x2="79" y2="9" stroke="#D6AD69" strokeWidth="1" />
      <text x="65" y="7" textAnchor="middle" fontSize="4.5" fill="#D6AD69" fontFamily="monospace" fontWeight="bold">Order</text>
      <line x1="51" y1="16" x2="79" y2="16" stroke="#D6AD69" strokeWidth="0.8" opacity="0.5" />
      <line x1="54" y1="12" x2="76" y2="12" stroke="#D6AD69" strokeWidth="0.7" opacity="0.55" />
      <line x1="54" y1="14" x2="76" y2="14" stroke="#D6AD69" strokeWidth="0.7" opacity="0.55" />
      <line x1="54" y1="19" x2="76" y2="19" stroke="#D6AD69" strokeWidth="0.7" opacity="0.45" />
      {/* Product class box */}
      <rect x="26" y="40" width="28" height="19" rx="1" stroke="#D6AD69" strokeWidth="1.2" fill="rgba(214,173,105,0.07)" />
      <line x1="26" y1="48" x2="54" y2="48" stroke="#D6AD69" strokeWidth="1" />
      <text x="40" y="46" textAnchor="middle" fontSize="4.5" fill="#D6AD69" fontFamily="monospace" fontWeight="bold">Product</text>
      <line x1="29" y1="51" x2="51" y2="51" stroke="#D6AD69" strokeWidth="0.7" opacity="0.55" />
      <line x1="29" y1="53.5" x2="51" y2="53.5" stroke="#D6AD69" strokeWidth="0.7" opacity="0.55" />
      {/* Inheritance arrow Order → User (triangle head) */}
      <line x1="51" y1="13" x2="29" y2="13" stroke="#D6AD69" strokeWidth="1" strokeDasharray="none" />
      <polygon points="29,10.5 29,15.5 23,13" fill="none" stroke="#D6AD69" strokeWidth="0.9" />
      {/* Dashed association Order → Product */}
      <line x1="65" y1="25" x2="50" y2="40" stroke="#D6AD69" strokeWidth="0.8" strokeDasharray="2.5,1.5" opacity="0.7" />
      <circle cx="50" cy="40" r="1.2" fill="#D6AD69" opacity="0.7" />
    </svg>
  );
}

function SequenceDiagramSVG() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Sequence Diagram preview">
      {/* Actor boxes */}
      <rect x="1" y="1" width="16" height="8" rx="1" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.08)" />
      <text x="9" y="7" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace">Client</text>
      <rect x="32" y="1" width="16" height="8" rx="1" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.08)" />
      <text x="40" y="7" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace">API</text>
      <rect x="63" y="1" width="16" height="8" rx="1" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.08)" />
      <text x="71" y="7" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace">DB</text>
      {/* Lifelines */}
      <line x1="9" y1="9" x2="9" y2="58" stroke="#D6AD69" strokeWidth="0.7" strokeDasharray="2,2" opacity="0.5" />
      <line x1="40" y1="9" x2="40" y2="58" stroke="#D6AD69" strokeWidth="0.7" strokeDasharray="2,2" opacity="0.5" />
      <line x1="71" y1="9" x2="71" y2="58" stroke="#D6AD69" strokeWidth="0.7" strokeDasharray="2,2" opacity="0.5" />
      {/* Activation boxes */}
      <rect x="7.5" y="16" width="3" height="28" rx="0.5" stroke="#D6AD69" strokeWidth="0.8" fill="rgba(214,173,105,0.2)" />
      <rect x="38.5" y="20" width="3" height="24" rx="0.5" stroke="#D6AD69" strokeWidth="0.8" fill="rgba(214,173,105,0.2)" />
      <rect x="69.5" y="26" width="3" height="12" rx="0.5" stroke="#D6AD69" strokeWidth="0.8" fill="rgba(214,173,105,0.2)" />
      {/* Arrows */}
      <line x1="10.5" y1="20" x2="38.5" y2="22" stroke="#D6AD69" strokeWidth="0.9" />
      <polygon points="38.5,20.5 38.5,23.5 41,22" fill="#D6AD69" />
      <line x1="41.5" y1="27" x2="69.5" y2="28" stroke="#D6AD69" strokeWidth="0.9" />
      <polygon points="69.5,26.5 69.5,29.5 72,28" fill="#D6AD69" />
      {/* Return arrows dashed */}
      <line x1="69.5" y1="35" x2="41.5" y2="36" stroke="#D6AD69" strokeWidth="0.8" strokeDasharray="2,1.5" />
      <polygon points="41.5,34.5 41.5,37.5 39,36" fill="#D6AD69" opacity="0.8" />
      <line x1="38.5" y1="42" x2="10.5" y2="43" stroke="#D6AD69" strokeWidth="0.8" strokeDasharray="2,1.5" />
      <polygon points="10.5,41.5 10.5,44.5 8,43" fill="#D6AD69" opacity="0.8" />
    </svg>
  );
}

function ComponentDiagramSVG() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Component Diagram preview">
      {/* Component 1: API Gateway */}
      <rect x="2" y="8" width="28" height="16" rx="1.5" stroke="#D6AD69" strokeWidth="1.2" fill="rgba(214,173,105,0.07)" />
      {/* Component notch (double line left border) */}
      <rect x="2" y="11" width="5" height="4" rx="0.5" stroke="#D6AD69" strokeWidth="0.9" fill="rgba(214,173,105,0.2)" />
      <text x="21" y="18" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace">Gateway</text>
      {/* Provided interface ball on right */}
      <circle cx="31" cy="16" r="2.5" stroke="#D6AD69" strokeWidth="0.9" fill="none" />
      {/* Component 2: Auth Service */}
      <rect x="2" y="36" width="28" height="16" rx="1.5" stroke="#D6AD69" strokeWidth="1.2" fill="rgba(214,173,105,0.07)" />
      <rect x="2" y="39" width="5" height="4" rx="0.5" stroke="#D6AD69" strokeWidth="0.9" fill="rgba(214,173,105,0.2)" />
      <text x="21" y="46" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace">Auth Svc</text>
      {/* Component 3: Product Service */}
      <rect x="50" y="22" width="28" height="16" rx="1.5" stroke="#D6AD69" strokeWidth="1.2" fill="rgba(214,173,105,0.07)" />
      <rect x="50" y="25" width="5" height="4" rx="0.5" stroke="#D6AD69" strokeWidth="0.9" fill="rgba(214,173,105,0.2)" />
      <text x="69" y="32" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace">Product</text>
      {/* Provided interface ball */}
      <circle cx="79" cy="30" r="2.5" stroke="#D6AD69" strokeWidth="0.9" fill="none" />
      {/* Required interface (half circle) on left of Product */}
      <path d="M 49 28 A 3 3 0 0 1 49 34" stroke="#D6AD69" strokeWidth="0.9" fill="none" />
      {/* Connector lines */}
      <line x1="33.5" y1="16" x2="49" y2="30" stroke="#D6AD69" strokeWidth="0.8" opacity="0.7" />
      <line x1="16" y1="24" x2="16" y2="36" stroke="#D6AD69" strokeWidth="0.8" strokeDasharray="2,1.5" opacity="0.7" />
    </svg>
  );
}

function DeploymentDiagramSVG() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Deployment Diagram preview">
      {/* Cloud rounded rect */}
      <rect x="22" y="2" width="56" height="56" rx="6" stroke="#D6AD69" strokeWidth="1.2" fill="rgba(214,173,105,0.04)" />
      <text x="50" y="10" textAnchor="middle" fontSize="4.5" fill="#D6AD69" fontFamily="monospace" opacity="0.7">Cloud</text>
      {/* App Server box */}
      <rect x="34" y="14" width="32" height="14" rx="1.5" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.1)" />
      <text x="50" y="23" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace">App Server</text>
      {/* Database cylinder */}
      <ellipse cx="50" cy="40" rx="10" ry="3" stroke="#D6AD69" strokeWidth="1" fill="rgba(214,173,105,0.1)" />
      <rect x="40" y="40" width="20" height="10" stroke="#D6AD69" strokeWidth="0" fill="rgba(214,173,105,0.1)" />
      <line x1="40" y1="40" x2="40" y2="50" stroke="#D6AD69" strokeWidth="1" />
      <line x1="60" y1="40" x2="60" y2="50" stroke="#D6AD69" strokeWidth="1" />
      <ellipse cx="50" cy="50" rx="10" ry="3" stroke="#D6AD69" strokeWidth="1" fill="rgba(214,173,105,0.15)" />
      <text x="50" y="47" textAnchor="middle" fontSize="3.8" fill="#D6AD69" fontFamily="monospace">Database</text>
      {/* Load Balancer outside left */}
      <rect x="1" y="17" width="20" height="10" rx="1.5" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.08)" />
      <text x="11" y="23.5" textAnchor="middle" fontSize="3.5" fill="#D6AD69" fontFamily="monospace">LB</text>
      {/* Connector lines */}
      <line x1="21" y1="22" x2="34" y2="22" stroke="#D6AD69" strokeWidth="0.9" />
      <polygon points="34,20 34,24 37,22" fill="#D6AD69" />
      <line x1="50" y1="28" x2="50" y2="37" stroke="#D6AD69" strokeWidth="0.9" />
      <polygon points="48,37 52,37 50,40" fill="#D6AD69" />
    </svg>
  );
}

function ERDiagramSVG() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ER Diagram preview">
      {/* Entity 1 */}
      <rect x="1" y="2" width="23" height="22" rx="1" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.07)" />
      <rect x="1" y="2" width="23" height="7" rx="1" fill="rgba(214,173,105,0.18)" />
      <text x="12.5" y="7.5" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace" fontWeight="bold">User</text>
      <line x1="1" y1="9" x2="24" y2="9" stroke="#D6AD69" strokeWidth="0.7" opacity="0.5" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="#D6AD69" strokeWidth="0.6" opacity="0.5" />
      <line x1="3" y1="15" x2="21" y2="15" stroke="#D6AD69" strokeWidth="0.6" opacity="0.5" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="#D6AD69" strokeWidth="0.6" opacity="0.5" />
      {/* Entity 2 */}
      <rect x="57" y="2" width="22" height="22" rx="1" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.07)" />
      <rect x="57" y="2" width="22" height="7" rx="1" fill="rgba(214,173,105,0.18)" />
      <text x="68" y="7.5" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace" fontWeight="bold">Post</text>
      <line x1="57" y1="9" x2="79" y2="9" stroke="#D6AD69" strokeWidth="0.7" opacity="0.5" />
      <line x1="59" y1="12" x2="77" y2="12" stroke="#D6AD69" strokeWidth="0.6" opacity="0.5" />
      <line x1="59" y1="15" x2="77" y2="15" stroke="#D6AD69" strokeWidth="0.6" opacity="0.5" />
      <line x1="59" y1="18" x2="77" y2="18" stroke="#D6AD69" strokeWidth="0.6" opacity="0.5" />
      {/* Entity 3 */}
      <rect x="28" y="40" width="24" height="18" rx="1" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.07)" />
      <rect x="28" y="40" width="24" height="7" rx="1" fill="rgba(214,173,105,0.18)" />
      <text x="40" y="45.5" textAnchor="middle" fontSize="4" fill="#D6AD69" fontFamily="monospace" fontWeight="bold">Tag</text>
      <line x1="28" y1="47" x2="52" y2="47" stroke="#D6AD69" strokeWidth="0.7" opacity="0.5" />
      <line x1="30" y1="50" x2="50" y2="50" stroke="#D6AD69" strokeWidth="0.6" opacity="0.5" />
      <line x1="30" y1="53" x2="50" y2="53" stroke="#D6AD69" strokeWidth="0.6" opacity="0.5" />
      {/* Diamond has */}
      <polygon points="40,24 44,30 40,36 36,30" stroke="#D6AD69" strokeWidth="0.9" fill="rgba(214,173,105,0.12)" />
      <text x="40" y="31.5" textAnchor="middle" fontSize="3.5" fill="#D6AD69" fontFamily="monospace">has</text>
      {/* Connector lines */}
      <line x1="12.5" y1="24" x2="36" y2="30" stroke="#D6AD69" strokeWidth="0.8" opacity="0.7" />
      <line x1="44" y1="30" x2="68" y2="24" stroke="#D6AD69" strokeWidth="0.8" opacity="0.7" />
      <line x1="40" y1="36" x2="40" y2="40" stroke="#D6AD69" strokeWidth="0.8" opacity="0.7" />
      {/* Cardinality markers */}
      <text x="19" y="29" fontSize="4" fill="#D6AD69" fontFamily="monospace">1</text>
      <text x="48" y="29" fontSize="4" fill="#D6AD69" fontFamily="monospace">*</text>
    </svg>
  );
}

function StateDiagramSVG() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="State Machine preview">
      {/* Initial pseudostate */}
      <circle cx="8" cy="8" r="4.5" fill="#D6AD69" />
      {/* Idle state */}
      <rect x="18" y="3" width="20" height="10" rx="5" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.1)" />
      <text x="28" y="10" textAnchor="middle" fontSize="4.5" fill="#D6AD69" fontFamily="monospace">Idle</text>
      {/* Active state */}
      <rect x="18" y="24" width="24" height="10" rx="5" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.1)" />
      <text x="30" y="31" textAnchor="middle" fontSize="4.5" fill="#D6AD69" fontFamily="monospace">Active</text>
      {/* Done state */}
      <rect x="18" y="45" width="22" height="10" rx="5" stroke="#D6AD69" strokeWidth="1.1" fill="rgba(214,173,105,0.1)" />
      <text x="29" y="52" textAnchor="middle" fontSize="4.5" fill="#D6AD69" fontFamily="monospace">Done</text>
      {/* Final state double circle */}
      <circle cx="56" cy="50" r="5.5" stroke="#D6AD69" strokeWidth="1" fill="none" />
      <circle cx="56" cy="50" r="3" fill="#D6AD69" />
      {/* Arrows */}
      <line x1="12.5" y1="8" x2="18" y2="8" stroke="#D6AD69" strokeWidth="1" />
      <polygon points="18,6.5 18,9.5 20.5,8" fill="#D6AD69" />
      {/* Idle -> Active */}
      <line x1="28" y1="13" x2="28" y2="24" stroke="#D6AD69" strokeWidth="0.9" />
      <polygon points="26.5,24 29.5,24 28,26.5" fill="#D6AD69" />
      <text x="34" y="20" fontSize="3.5" fill="#D6AD69" fontFamily="monospace" opacity="0.8">start</text>
      {/* Active -> Done */}
      <line x1="29" y1="34" x2="29" y2="45" stroke="#D6AD69" strokeWidth="0.9" />
      <polygon points="27.5,45 30.5,45 29,47.5" fill="#D6AD69" />
      <text x="35" y="41" fontSize="3.5" fill="#D6AD69" fontFamily="monospace" opacity="0.8">end</text>
      {/* Done -> Final */}
      <line x1="40" y1="50" x2="50.5" y2="50" stroke="#D6AD69" strokeWidth="0.9" />
      <polygon points="50.5,48.5 50.5,51.5 53,50" fill="#D6AD69" />
      <text x="44" y="57" fontSize="3.5" fill="#D6AD69" fontFamily="monospace" opacity="0.8">done</text>
    </svg>
  );
}

const DIAGRAM_SVGS: Record<string, React.ReactNode> = {
  class: <ClassDiagramSVG />,
  sequence: <SequenceDiagramSVG />,
  component: <ComponentDiagramSVG />,
  deployment: <DeploymentDiagramSVG />,
  er: <ERDiagramSVG />,
  state: <StateDiagramSVG />,
};

function UmlContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("type") as DiagramType | null;
  const [type, setType] = useState<DiagramType>(
    initial && UML_TYPES.some((t) => t.id === initial) ? initial : "class",
  );
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArchitectureResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSynthesize() {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const diagramLabel = UML_TYPES.find(t => t.id === type)?.label ?? type;
      const augmentedIdea = `Generate a detailed, production-quality ${diagramLabel} for: ${prompt || `Standard ${type} diagram specification`}. Include realistic class names, method signatures, attribute types, relationship types with labels.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: augmentedIdea, diagramType: type }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "UML synthesis failed.");
        return;
      }

      setResult(data as ArchitectureResult);
    } catch {
      setError("Network error. Unable to synthesize UML.");
    } finally {
      setLoading(false);
    }
  }

  function openInStudio() {
    router.push(`/workspace/generate?new=1&type=${type}`);
  }

  const activeItem = UML_TYPES.find((t) => t.id === type) ?? UML_TYPES[0];

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 pt-8 sm:pt-12 pb-16 space-y-10" style={{ minHeight: "100%", background: "#101216" }}>
      {/* Header */}
      <div className="border-b border-[var(--accent)]/15 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-1 backdrop-blur-md">
          <GitBranch className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
            Standardized UML Synthesizer
          </span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl leading-tight mb-2">
          UML Diagram Generator
        </h1>
        <p className="text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Select a standardized UML diagram specification, customize your design prompt, and generate clean, production-ready Mermaid diagrams.
        </p>
      </div>

      {/* UML Grid Selection — key triggers remount + animate-page-enter */}
      <div key={type} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {UML_TYPES.map((t) => {
          const active = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setType(t.id); setResult(null); setPrompt(EXAMPLE_PROMPTS[t.id]); }}
              className={`animate-page-enter group relative overflow-hidden flex flex-col justify-between rounded-3xl border p-6 text-left transition-all duration-300 ${
                active
                  ? "bg-gradient-to-b from-[var(--background)] to-[var(--background)] border-[var(--accent)] shadow-[0_0_35px_rgba(214,173,105,0.25)]"
                  : "bg-[#171A20] border-[var(--accent)]/15 hover:border-[var(--accent)]/35 hover:-translate-y-1"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

              <div className="relative z-10">
                {/* SVG preview */}
                <div className="w-full flex justify-center mb-3">
                  {DIAGRAM_SVGS[t.id] ?? <GitBranch className="h-10 w-10 text-[var(--accent)] opacity-60" />}
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${active ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--text-faint)]"} group-hover:scale-110 transition-transform`}>
                    <GitBranch className="h-5 w-5" />
                  </div>
                  {active && (
                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-[var(--accent)] uppercase bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </span>
                  )}
                </div>

                <h3 className={`text-lg font-bold ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"}`}>
                  {t.label}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                  {t.desc}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-3 border-t border-[var(--accent)]/10 flex items-center justify-between text-xs font-bold text-[var(--accent)]">
                <span>Select Format</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Synthesis Control Box */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-[#0F1318] p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--accent)] shadow-[0_0_20px_rgba(214,173,105,0.3)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[var(--text-primary)]">{activeItem.label} Generator</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Enter a system description below or click Synthesize to view standard {activeItem.label} specs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSynthesize}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[#A08050] px-6 py-3.5 text-xs font-bold text-[var(--on-accent)] shadow-[0_0_30px_rgba(214,173,105,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span>Synthesize {activeItem.label}</span>
            </button>

            <button
              type="button"
              onClick={openInStudio}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--accent)]/20 bg-[var(--background)] px-5 py-3.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors"
            >
              <Layers className="h-4 w-4 text-[var(--accent)]" />
              Open in Studio
            </button>
          </div>
        </div>

        {/* Input prompt */}
        <div className="relative z-10">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Customize prompt for ${activeItem.label} (e.g. User auth flow with JWT tokens, rate limiting and database lookup)...`}
            className="w-full rounded-2xl border border-[var(--accent)]/20 bg-[var(--background-2)] px-5 py-3.5 text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Live Canvas View */}
      {result && (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-[var(--background)] h-[600px] shadow-2xl">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--accent)]/15 bg-[var(--background)]">
            <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
              {result.title}  —  {DIAGRAM_TYPE_LABELS[result.diagramType]} Live Preview
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] uppercase">Mermaid Engine Ready</span>
          </div>

          <div className="relative h-[calc(100%-45px)] overflow-hidden">
            <ArchitectureCanvas
              chart={result.mermaidCode}
              result={result}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function UmlPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--text-muted)]">Loading UML engine...</div>}>
      <UmlContent />
    </Suspense>
  );
}
