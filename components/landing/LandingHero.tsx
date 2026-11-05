"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TileMosaic from "./TileMosaic";
import { useAuth } from "@clerk/nextjs";

export default function LandingHero() {
  const { isSignedIn } = useAuth();

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#0E1116", minHeight: "min(100dvh,820px)", height: "100dvh" }}
    >
      {/* ── z-0: Tile mosaic (pointer-events:none, purely decorative) ── */}
      <TileMosaic />

      {/* ── z-1: Reading gradient — left vignette + top/bottom fade ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to right, #0E1116 0%, rgba(14,17,22,0.93) 38%, rgba(14,17,22,0.40) 65%, transparent 100%), " +
            "linear-gradient(to bottom, rgba(14,17,22,0.55) 0%, transparent 22%, transparent 68%, #0E1116 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── z-1: Mobile — stronger overlay so text is readable ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] lg:hidden"
        style={{ background: "rgba(14,17,22,0.82)" }}
        aria-hidden="true"
      />

      {/* ── z-10: Hero content ── */}
      <div
        className="absolute inset-x-0 z-10 flex flex-col items-start justify-center px-6 md:px-14 lg:px-20"
        style={{ top: "18%", bottom: "88px" }}
      >
        <div className="max-w-[660px]">
          {/* Eyebrow pill */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{
              color: "#D6AD69",
              background: "rgba(214,173,105,0.10)",
              border: "1px solid rgba(214,173,105,0.22)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#D6AD69" }}
              aria-hidden="true"
            />
            Architectural Intelligence Platform
          </div>

          {/* Headline */}
          <h1
            className="font-display font-bold leading-[1.04] tracking-[-0.015em]"
            style={{ fontSize: "clamp(42px, 5.8vw, 82px)", color: "#F2EFE8" }}
          >
            Describe it,
            <br />
            <span style={{ color: "#D6AD69" }}>Architecture it.</span>
          </h1>

          {/* Body */}
          <p
            className="mt-5 leading-[1.70]"
            style={{
              fontSize: "clamp(15px, 1.55vw, 17.5px)",
              maxWidth: "480px",
              color: "#B8C0CC",
            }}
          >
            Describe your software system and Arqin AI synthesizes
            production-ready architecture diagrams, UML specifications,
            and component maps in seconds.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={isSignedIn ? "/workspace" : "/sign-up"}
              className="inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-semibold transition-all hover:brightness-110 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
              style={{ background: "#D6AD69", color: "#0E1116" }}
            >
              {isSignedIn ? "Open Workspace" : "Start a project"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>

            <Link
              href="#capabilities"
              className="inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-[15px] font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
              style={{
                color: "rgba(242,239,232,0.85)",
                border: "1px solid rgba(242,239,232,0.18)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "#D6AD69";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(214,173,105,0.45)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(242,239,232,0.85)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(242,239,232,0.18)";
              }}
            >
              See capabilities
            </Link>
          </div>
        </div>
      </div>

      {/* ── z-20: Stats strip ── */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 border-t"
        style={{
          background: "rgba(14,17,22,0.94)",
          borderColor: "rgba(242,239,232,0.07)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-3 px-6 py-4 md:px-14 lg:px-20">
          {[
            { num: "8+",      label: "UML diagram types" },
            { num: "AI",      label: "Architecture analysis" },
            { num: "1-click", label: "SVG · PNG · MD export" },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col">
              <span
                className="font-display font-bold leading-none tracking-[-0.03em]"
                style={{ fontSize: "clamp(18px, 2vw, 26px)", color: "#F2EFE8" }}
              >
                {num}
              </span>
              <span
                className="mt-1 font-sans text-[12px]"
                style={{ color: "#8B949E" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
