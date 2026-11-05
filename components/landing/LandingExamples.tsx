"use client";

import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import { ArrowRight, ShoppingCart, MessageSquare, Hospital, Tv, Boxes, HeartPulse, Globe, Building2, Smartphone, Database, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type CardMeta = {
  icon: LucideIcon;
  iconClass: string;
  glowClass: string;
};

const CARD_META: Record<string, CardMeta> = {
  ecommerce:       { icon: ShoppingCart, iconClass: "text-[var(--accent)]",   glowClass: "from-[var(--accent)]/20 to-[#A08050]/5" },
  chat:            { icon: MessageSquare, iconClass: "text-[var(--accent)]",  glowClass: "from-[var(--accent)]/20 to-[#C4A060]/5" },
  hospital:        { icon: Hospital,     iconClass: "text-[var(--accent)]",   glowClass: "from-[var(--accent)]/15 to-[#A08050]/5" },
  streaming:       { icon: Tv,           iconClass: "text-[var(--accent)]",   glowClass: "from-[var(--accent)]/15 to-[#C4A060]/5" },
  microservices:   { icon: Boxes,        iconClass: "text-[var(--accent)]",   glowClass: "from-[#A08050]/20 to-[var(--accent)]/5" },
  "ai-app":        { icon: HeartPulse,   iconClass: "text-[var(--accent)]",   glowClass: "from-[var(--accent)]/15 to-[var(--accent)]/5" },
  "social-media":  { icon: Globe,        iconClass: "text-[var(--accent)]",   glowClass: "from-[var(--accent)]/15 to-[#A08050]/5" },
  banking:         { icon: Building2,    iconClass: "text-[var(--accent)]",   glowClass: "from-[var(--accent)]/20 to-[#C4A060]/5" },
  "food-delivery": { icon: Smartphone,   iconClass: "text-[var(--accent)]",   glowClass: "from-[var(--accent)]/15 to-[#A08050]/5" },
  saas:            { icon: Database,     iconClass: "text-[var(--accent)]",   glowClass: "from-[var(--accent)]/15 to-[var(--accent)]/5" },
};

const DEFAULT_META: CardMeta = { icon: Boxes, iconClass: "text-[var(--text-faint)]", glowClass: "from-[var(--accent)]/10 to-transparent" };

export default function LandingExamples() {
  const featured = TEMPLATES.slice(0, 6);

  return (
    <section id="examples" className="relative border-t border-[#D6AD69]/10 px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Badge variant="outline" className="mb-3 rounded-full border-[#D6AD69]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-[var(--accent)]" />
              Starter Architectures
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              Start From Proven <br />
              <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[#A08050] bg-clip-text text-transparent">
                Production Blueprints
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-base text-[var(--text-muted)]">
              Pick a pre-designed architecture template, customize it for your needs,
              and generate complete Mermaid diagrams immediately.
            </p>
          </div>

          <Link
            href="/workspace/templates"
            className="group shrink-0 inline-flex items-center gap-2 rounded-full border border-[#D6AD69]/20 bg-[var(--accent)]/08 px-6 py-3 text-sm font-semibold text-[var(--text-muted)] transition-all hover:border-[#D6AD69]/40 hover:text-[var(--text-primary)]"
          >
            Browse All Templates
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => {
            const meta = CARD_META[t.id] ?? DEFAULT_META;
            const Icon = meta.icon;
            return (
              <Link
                key={t.id}
                href={`/workspace?template=${t.id}`}
                className="group relative overflow-hidden rounded-3xl border border-[#D6AD69]/15 bg-gradient-to-b from-[var(--background)]/90 via-[var(--background-2)]/95 to-[var(--background)] p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#D6AD69]/35 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(var(--accent-rgb,214,173,105),0.15)] flex flex-col justify-between"
              >
                {/* Dot pattern */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]" />
                {/* Top accent line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
                {/* Corner glow on hover */}
                <div className={`pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${meta.glowClass} blur-2xl opacity-0 transition-opacity group-hover:opacity-100`} />

                <div className="relative z-10">
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D6AD69]/15 bg-[var(--accent)]/08 ${meta.iconClass} group-hover:scale-110 transition-transform shadow-inner`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="rounded-full border border-[#D6AD69]/20 bg-[var(--accent)]/08 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      {t.category}
                    </Badge>
                  </div>

                  <h3 className="mb-2 text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)] line-clamp-2">
                    {t.description}
                  </p>
                </div>

                <div className="relative z-10 mt-6 flex items-center gap-2 text-xs font-semibold text-[var(--accent)] group-hover:text-[var(--accent-hover)]">
                  <span>Load Template</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
