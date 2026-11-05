"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    num: "01",
    title: "Describe",
    desc: "Enter your system idea in plain English — frontend stack, backend services, databases, auth, queues, and infrastructure. No diagram syntax required.",
  },
  {
    num: "02",
    title: "Synthesize",
    desc: "Arqin AI parses your description, infers component relationships, selects appropriate diagram type, and generates valid Mermaid architecture code in under three seconds.",
  },
  {
    num: "03",
    title: "Inspect & Export",
    desc: "Explore the interactive canvas, run the architecture inspector, refine via AI assistant, and export to SVG, PNG, or Markdown documentation with one click.",
  },
];

export default function LandingHowItWorks() {
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    colRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      className="min-h-[100dvh] bg-[var(--background)] px-6 py-28 md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          How it works
        </p>

        <h2
          className="mt-4 font-display font-semibold tracking-[-0.03em] text-[var(--text-primary)]"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Three steps, no surprises.
        </h2>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { colRefs.current[i] = el; }}
              className="reveal-col border-t pt-8"
              style={{
                borderColor: "rgba(242,239,232,0.12)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <p
                className="font-display font-bold text-[var(--accent)]"
                style={{ fontSize: "56px", lineHeight: 1 }}
              >
                {step.num}
              </p>
              <h3
                className="mt-6 font-display font-semibold text-[var(--text-primary)]"
                style={{ fontSize: "28px" }}
              >
                {step.title}
              </h3>
              <p className="mt-4 font-sans text-base leading-[1.65] text-[var(--text-muted)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
