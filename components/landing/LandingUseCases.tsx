"use client";

import { motion } from "framer-motion";
import { Sparkles, Layers, Cpu, Cloud, Server, Database, Lock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const USE_CASES = [
  { name: "Microservices Architecture", icon: Server },
  { name: "Cloud Infrastructure (AWS/GCP/Azure)", icon: Cloud },
  { name: "SaaS Multi-Tenant Platforms", icon: Globe },
  { name: "AI RAG & LLM Pipelines", icon: Cpu },
  { name: "Database & ER Diagrams", icon: Database },
  { name: "System Design Interviews", icon: Layers },
  { name: "Security & Auth Systems", icon: Lock },
  { name: "Event-Driven Messaging (Kafka/RabbitMQ)", icon: Sparkles },
];

export default function LandingUseCases() {
  return (
    <section className="relative border-t border-[#D6AD69]/10 py-20 bg-[var(--background)]/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-8">
        <Badge variant="outline" className="mb-3 rounded-full border-[#D6AD69]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] backdrop-blur-md">
          Versatile Applications
        </Badge>
        <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
          Engineered for Every Architecture Challenge
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-base text-[var(--text-muted)]">
          Whether you are building cloud infrastructure, microservices, database schemas,
          or preparing system design docs  --  Arqin AI adapts seamlessly.
        </p>
      </div>

      {/* Infinite Scroll Marquee Row */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Gradient Blur Edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-28 bg-gradient-to-r from-[var(--background)] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-28 bg-gradient-to-l from-[var(--background)] to-transparent" />

        <div className="flex w-max">
          {/* Continuous Framer Motion Marquee Track */}
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 30,
            }}
            className="flex shrink-0 items-center gap-4 pr-4"
          >
            {USE_CASES.concat(USE_CASES).map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.name}-${i}`}
                  className="flex shrink-0 items-center gap-3 rounded-full border border-[#D6AD69]/15 bg-[var(--background)]/80 px-6 py-3 text-sm font-medium text-[var(--text-muted)] backdrop-blur-xl transition-colors hover:border-[#D6AD69]/40 hover:bg-[var(--background)] hover:text-[var(--text-primary)]"
                >
                  <Icon className="h-4 w-4 text-[var(--accent)]" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
