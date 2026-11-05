"use client";

import { useEffect, useRef } from "react";

export default function LandingTrust() {
  const rightRef = useRef<HTMLDivElement>(null);

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
      { threshold: 0.2 }
    );

    if (rightRef.current) observer.observe(rightRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="min-h-[100dvh] items-center bg-[#0E1116] px-6 py-28 md:px-12 lg:px-16"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
        {/* Left: pull quote */}
        <blockquote
          className="border-l-4 p-8 md:p-10"
          style={{
            borderColor: "#D6AD69",
            background: "rgba(214,173,105,0.04)",
          }}
        >
          <p
            className="font-display font-medium leading-[1.25] text-[#F2EFE8]"
            style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
          >
            &ldquo;A system is a set of decisions, made once and reused everywhere.&rdquo;
          </p>
        </blockquote>

        {/* Right: about content */}
        <div ref={rightRef} className="reveal-col">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#D6AD69]">
            About Arqin AI
          </p>

          <h2
            className="mt-4 font-display font-semibold tracking-[-0.03em] text-[#F2EFE8]"
            style={{ fontSize: "clamp(28px, 3.2vw, 44px)" }}
          >
            AI-powered architecture intelligence.
          </h2>

          <div className="mt-6 flex flex-col gap-4">
            <p className="font-sans text-base leading-[1.7] text-[#8B949E]">
              Arqin AI transforms natural language system descriptions into validated Mermaid diagrams, interactive canvases, and structured architecture specifications.
            </p>
            <p className="font-sans text-base leading-[1.7] text-[#8B949E]">
              Every generated diagram is validated against the Mermaid parser before rendering. Invalid output triggers bounded repair attempts and preserves your last valid architecture.
            </p>
            <p className="font-sans text-base leading-[1.7] text-[#8B949E]">
              All projects, history, and settings are stored locally in your browser. Nothing leaves your machine without your explicit export action.
            </p>
          </div>

          <div
            className="mt-10 grid grid-cols-3 gap-6 border-t pt-8"
            style={{ borderColor: "rgba(242,239,232,0.10)" }}
          >
            {[
              { num: "8+", label: "Diagram types" },
              { num: "100%", label: "Browser-local" },
              { num: "1-click", label: "Export ready" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-display font-bold leading-none tracking-[-0.03em] text-[#D6AD69]"
                  style={{ fontSize: "28px" }}
                >
                  {stat.num}
                </p>
                <p className="mt-1 font-sans text-[13px] text-[#8B949E]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
