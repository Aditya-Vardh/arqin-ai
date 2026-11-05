"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TileMosaic from "./TileMosaic";
import { useAuth } from "@clerk/nextjs";

export default function LandingHero() {
  const { isSignedIn } = useAuth();

  const primaryHref = isSignedIn ? "/workspace" : "/sign-up";
  const secondaryHref = "#capabilities";

  return (
    <>
      {/* ─── Hero section — fixed height, mosaic behind text ─── */}
      <section
        className="relative overflow-hidden bg-[var(--background)]"
        style={{ minHeight: "min(100dvh, 800px)", height: "100dvh" }}
      >
        {/*
          Layering (bottom → top):
          z-0  TileMosaic tiles — decorative only, pointer-events none
          z-[1] Gradient wash — ensures text legibility over tiles
          z-10 Headline + CTAs — actual content
          z-20 Stats strip — pinned to bottom
        */}

        {/* Layer 0: Tile mosaic */}
        <TileMosaic />

        {/* Layer 1: Reading gradient — ensures headline is always legible over tiles */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: [
              // Strong left-side vignette for headline area
              "linear-gradient(to right, rgba(14,17,22,0.97) 0%, rgba(14,17,22,0.88) 40%, rgba(14,17,22,0.30) 75%, rgba(14,17,22,0.08) 100%)",
              // Top-to-bottom fade
              "linear-gradient(to bottom, rgba(14,17,22,0.50) 0%, transparent 18%, transparent 70%, rgba(14,17,22,0.96) 100%)",
            ].join(", "),
          }}
          aria-hidden="true"
        />

        {/* Layer 1b: Extra solid coverage on mobile for readability */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
          style={{ background: "rgba(14,17,22,0.78)" }}
          aria-hidden="true"
        />

        {/* Layer 10: Hero content — positioned in the upper-middle area, well above stats strip */}
        <div className="absolute inset-x-0 z-10 flex flex-col items-start justify-center px-6 md:px-12 lg:px-16"
          style={{ top: "20%", bottom: "96px" /* leave room for stats strip */ }}
        >
          <div className="max-w-[640px]">
            {/* Eyebrow */}
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]"
              style={{
                background: "rgba(var(--accent-rgb,214,173,105),0.10)",
                border: "1px solid rgba(var(--accent-rgb,214,173,105),0.25)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden="true" />
              Architectural Intelligence Platform
            </div>

            {/* Headline */}
            <h1
              className="font-display font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]"
              style={{ fontSize: "clamp(40px, 5.5vw, 78px)" }}
            >
              Describe it,
              <br />
              <span className="text-[var(--accent)]">Architecture it.</span>
            </h1>

            {/* Description */}
            <p
              className="mt-5 leading-[1.65] text-[#B0BAC8]"
              style={{ fontSize: "clamp(15px, 1.5vw, 17px)", maxWidth: "460px" }}
            >
              Describe your software system and Arqin AI synthesizes
              production-ready architecture diagrams, UML specifications,
              and component maps in seconds.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-6 py-3 font-sans text-[15px] font-semibold text-[var(--background)] transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
              >
                {isSignedIn ? "Open Workspace" : "Start a project"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>

              <Link
                href={secondaryHref}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--text-primary)]/20 px-6 py-3 font-sans text-[15px] font-medium text-[var(--text-primary)] transition-colors hover:border-[#D6AD69]/50 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
              >
                See capabilities
              </Link>
            </div>
          </div>
        </div>

        {/* Layer 20: Stats strip — pinned to bottom of hero, in normal document flow visually */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 border-t"
          style={{
            borderColor: "rgba(242,239,232,0.08)",
            background: "rgba(14,17,22,0.92)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-3 px-6 py-4 md:px-12 lg:px-16">
            {[
              { num: "8+", label: "UML diagram types" },
              { num: "AI", label: "Architecture analysis" },
              { num: "1-click", label: "SVG · PNG · MD export" },
            ].map(({ num, label }) => (
              <div key={label} className="flex flex-col">
                <span
                  className="font-display font-bold leading-none tracking-[-0.03em] text-[var(--text-primary)]"
                  style={{ fontSize: "clamp(18px, 2vw, 26px)" }}
                >
                  {num}
                </span>
                <span className="mt-1 font-sans text-[12px] text-[var(--text-muted)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
