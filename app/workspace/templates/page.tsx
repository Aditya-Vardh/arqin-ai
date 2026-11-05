"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import type { Template } from "@/lib/templates";
import { DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";
import ChromaGrid from "@/components/ui/ChromaGrid";

const CATEGORY_ACCENTS: Record<
  string,
  "cyan" | "violet" | "amber" | "rose" | "emerald" | "blue"
> = {
  Web: "cyan",
  Mobile: "violet",
  Backend: "amber",
  Cloud: "blue",
  AI: "rose",
  Database: "emerald",
  Enterprise: "violet",
  Distributed: "cyan",
  SaaS: "blue",
  "Real-time": "cyan",
  Microservices: "violet",
  Data: "amber",
  Media: "rose",
  API: "emerald",
};

/** Returns the appropriate inline SVG preview for a given template */
function getTemplateSvg(template: Template): React.ReactElement {
  const id = template.id.toLowerCase();
  const type = template.diagramType;

  // Sequence diagram
  if (id.includes("sequence") || id.includes("chat") || type === "sequence") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
        <line x1="30" y1="8" x2="30" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
        <line x1="90" y1="8" x2="90" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
        <rect x="18" y="4" width="24" height="10" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1"/>
        <rect x="78" y="4" width="24" height="10" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1"/>
        <line x1="30" y1="28" x2="84" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.8"/>
        <polygon points="84,25 90,28 84,31" fill="currentColor" opacity="0.8"/>
        <line x1="90" y1="46" x2="36" y2="46" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeDasharray="4 2"/>
        <polygon points="36,43 30,46 36,49" fill="currentColor" opacity="0.6"/>
        <text x="60" y="26" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">request</text>
        <text x="60" y="44" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.5">response</text>
      </svg>
    );
  }

  // Class diagram
  if (id.includes("class") || id.includes("banking") || id.includes("hospital") || id.includes("lms") || id.includes("ride") || type === "class") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
        <rect x="8" y="10" width="44" height="36" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <line x1="8" y1="20" x2="52" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <line x1="8" y1="28" x2="52" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <text x="30" y="17" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.7" fontWeight="bold">Class A</text>
        <rect x="68" y="10" width="44" height="36" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <line x1="68" y1="20" x2="112" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <line x1="68" y1="28" x2="112" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <text x="90" y="17" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.7" fontWeight="bold">Class B</text>
        <line x1="52" y1="28" x2="68" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <polygon points="64,25 68,28 64,31" fill="currentColor" opacity="0.5"/>
      </svg>
    );
  }

  // ER diagram
  if (id.includes("er") || type === "er") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
        <rect x="8" y="20" width="38" height="24" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <line x1="8" y1="30" x2="46" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <text x="27" y="27" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.7" fontWeight="bold">Entity A</text>
        <rect x="74" y="20" width="38" height="24" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <line x1="74" y1="30" x2="112" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <text x="93" y="27" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.7" fontWeight="bold">Entity B</text>
        <polygon points="55,28 60,32 65,28 60,24" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1" opacity="0.8"/>
        <line x1="46" y1="32" x2="55" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="65" y1="32" x2="74" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <text x="60" y="31" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.6">rel</text>
      </svg>
    );
  }

  // Flowchart
  if (id.includes("flow") || type === "flowchart") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
        <rect x="44" y="4" width="32" height="14" rx="7" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <text x="60" y="13" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.7">Start</text>
        <line x1="60" y1="18" x2="60" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <polygon points="50,28 70,28 60,40" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.08" opacity="0.8"/>
        <line x1="60" y1="40" x2="60" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="50" y1="34" x2="20" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <line x1="20" y1="34" x2="20" y2="58" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <rect x="44" y="50" width="32" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <text x="60" y="59" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.7">End</text>
        <text x="35" y="33" fontSize="4" fill="currentColor" opacity="0.5">No</text>
        <text x="63" y="38" fontSize="4" fill="currentColor" opacity="0.5">Yes</text>
      </svg>
    );
  }

  // State machine
  if (id.includes("state") || type === "state") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
        <circle cx="22" cy="40" r="12" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <circle cx="60" cy="20" r="12" stroke="currentColor" strokeWidth="1.2" opacity="0.8" fill="currentColor" fillOpacity="0.08"/>
        <circle cx="98" cy="40" r="12" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <circle cx="60" cy="62" r="12" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
        <line x1="34" y1="34" x2="48" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <polygon points="46,22 50,28 44,28" fill="currentColor" opacity="0.5"/>
        <line x1="72" y1="26" x2="86" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <polygon points="88,36 84,30 90,30" fill="currentColor" opacity="0.5"/>
        <line x1="60" y1="32" x2="60" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      </svg>
    );
  }

  // Deployment / infra
  if (id.includes("deploy") || id.includes("infra") || type === "deployment") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
        <rect x="10" y="8" width="100" height="28" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="4 2"/>
        <rect x="18" y="14" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8" fill="currentColor" fillOpacity="0.06"/>
        <rect x="48" y="14" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8" fill="currentColor" fillOpacity="0.06"/>
        <rect x="78" y="14" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8" fill="currentColor" fillOpacity="0.06"/>
        <text x="60" y="8" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.5">Cloud Env</text>
        <rect x="44" y="50" width="32" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
        <line x1="30" y1="30" x2="60" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <line x1="60" y1="30" x2="60" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <line x1="90" y1="30" x2="60" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <text x="60" y="60" textAnchor="middle" fontSize="4.5" fill="currentColor" opacity="0.6">Load Balancer</text>
      </svg>
    );
  }

  // CQRS / event-driven
  if (id.includes("cqrs") || id.includes("event")) {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
        <rect x="4" y="14" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
        <text x="17" y="23" textAnchor="middle" fontSize="4.5" fill="currentColor" opacity="0.7">Command</text>
        <rect x="36" y="14" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.9" fill="currentColor" fillOpacity="0.1"/>
        <text x="49" y="23" textAnchor="middle" fontSize="4.5" fill="currentColor" opacity="0.8">Bus</text>
        <rect x="68" y="8" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
        <text x="81" y="17" textAnchor="middle" fontSize="4.5" fill="currentColor" opacity="0.7">Query</text>
        <rect x="68" y="28" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
        <text x="81" y="37" textAnchor="middle" fontSize="4.5" fill="currentColor" opacity="0.7">Event</text>
        <rect x="4" y="50" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
        <text x="17" y="59" textAnchor="middle" fontSize="4.5" fill="currentColor" opacity="0.6">Handler</text>
        <line x1="30" y1="21" x2="36" y2="21" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <line x1="62" y1="18" x2="68" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="62" y1="24" x2="68" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="17" y1="28" x2="17" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="3 2"/>
      </svg>
    );
  }

  // Component / microservices / architecture (default for architecture type)
  if (
    id.includes("microservice") || id.includes("ecommerce") || id.includes("saas") ||
    id.includes("social") || id.includes("food") || id.includes("streaming") ||
    id.includes("ai-app") || id.includes("rest-api") ||
    type === "architecture" || type === "component"
  ) {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
        <rect x="5" y="10" width="28" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
        <rect x="46" y="10" width="28" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
        <rect x="87" y="10" width="28" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
        <rect x="46" y="52" width="28" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.9" fill="currentColor" fillOpacity="0.08"/>
        <line x1="33" y1="18" x2="46" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="74" y1="18" x2="87" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="60" y1="26" x2="60" y2="52" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <text x="60" y="62" textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.6">DB</text>
      </svg>
    );
  }

  // Generic default
  return (
    <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
      <rect x="10" y="15" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
      <rect x="80" y="15" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
      <rect x="45" y="40" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.9" fill="currentColor" fillOpacity="0.08"/>
      <line x1="40" y1="25" x2="45" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <line x1="80" y1="25" x2="75" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

export default function TemplatesPage() {
  const categories = ["All", ...new Set(TEMPLATES.map((t) => t.category))];
  const [active, setActive] = useState("All");

  const visible =
    active === "All"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === active);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 pb-16 pt-8 sm:pt-12 lg:p-10">
      {/* Page Header */}
      <div className="border-b border-[var(--accent)]/15 pb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-1 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="pulse-dot-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
            Starter Architecture Library
          </span>
        </div>

        <h1 className="mb-3 text-4xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl">
          System Templates
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
          Start from a battle-tested production architecture template,
          customize it for your stack, and generate Mermaid diagrams instantly.
        </p>
      </div>

      {/* Category Filters */}
      <div className="overflow-x-auto pb-3">
        <div
          className="flex min-w-max items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[#151515] p-2"
          role="group"
          aria-label="Filter templates by category"
        >
          {categories.map((category) => {
            const selected = active === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                aria-pressed={selected}
                className={`
                  rounded-full border px-5 py-2.5
                  text-sm font-semibold
                  transition-all duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[var(--accent)]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#151515]
                  ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[#171717] shadow-[0_0_15px_rgba(214,173,105,0.15)]"
                      : "border-[#454545] bg-[#202020] text-[#D1D5DB] hover:border-[var(--accent)]/60 hover:bg-[#29251F] hover:text-white"
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Grid */}
      {visible.length > 0 ? (
        <ChromaGrid
          items={visible.map((template) => ({
            id: template.id,
            title: template.name,
            description: template.description,
            href: `/workspace/generate?template=${template.id}`,
            badge: `${template.category}  ·  ${DIAGRAM_TYPE_LABELS[template.diagramType]}`,
            accent: CATEGORY_ACCENTS[template.category] ?? "cyan",
            visual: (
              <div className="flex h-[80px] items-center justify-center opacity-80">
                {getTemplateSvg(template)}
              </div>
            ),
          }))}
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#151515] px-6 py-16 text-center">
          <LayoutTemplate className="mx-auto mb-4 h-9 w-9 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            No templates found
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            There are currently no templates in this category.
          </p>
          <button
            type="button"
            onClick={() => setActive("All")}
            className="mt-5 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[#171717] transition hover:bg-[#E5C184]"
          >
            View all templates
          </button>
        </div>
      )}
    </div>
  );
}
