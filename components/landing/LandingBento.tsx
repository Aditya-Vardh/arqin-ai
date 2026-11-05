"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

type Card = {
  title: string;
  category: string;
  bg: string;
  textPrimary: string;
  textSecondary: string;
  border?: string;
  href: string;
  illustration: React.ReactElement;
};

const CARDS: Card[] = [
  {
    title: "Architecture Diagrams",
    category: "Flowchart · Component · Deployment",
    bg: "#D6AD69",
    textPrimary: "#0E1116",
    textSecondary: "rgba(14,17,22,0.60)",
    href: "/workspace/generate?new=1",
    illustration: (
      <svg viewBox="0 0 120 80" width="100" height="67" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="28" height="16" rx="2" stroke="rgba(14,17,22,0.5)" strokeWidth="1.2"/>
        <rect x="46" y="10" width="28" height="16" rx="2" stroke="rgba(14,17,22,0.5)" strokeWidth="1.2"/>
        <rect x="87" y="10" width="28" height="16" rx="2" stroke="rgba(14,17,22,0.5)" strokeWidth="1.2"/>
        <rect x="46" y="52" width="28" height="16" rx="2" stroke="rgba(14,17,22,0.6)" strokeWidth="1.2" fill="rgba(14,17,22,0.08)"/>
        <line x1="33" y1="18" x2="46" y2="18" stroke="rgba(14,17,22,0.4)" strokeWidth="1"/>
        <line x1="74" y1="18" x2="87" y2="18" stroke="rgba(14,17,22,0.4)" strokeWidth="1"/>
        <line x1="60" y1="26" x2="60" y2="52" stroke="rgba(14,17,22,0.4)" strokeWidth="1"/>
        <text x="60" y="62" textAnchor="middle" fontSize="5" fill="rgba(14,17,22,0.5)">DB</text>
      </svg>
    ),
  },
  {
    title: "Class Diagrams",
    category: "OOP · Inheritance · Associations",
    bg: "#1B2430",
    textPrimary: "#F2EFE8",
    textSecondary: "#8B949E",
    href: "/workspace/uml?type=class",
    illustration: (
      <svg viewBox="0 0 120 80" width="100" height="67" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="10" width="44" height="36" rx="2" stroke="rgba(242,239,232,0.5)" strokeWidth="1.2"/>
        <line x1="8" y1="20" x2="52" y2="20" stroke="rgba(242,239,232,0.4)" strokeWidth="1"/>
        <line x1="8" y1="28" x2="52" y2="28" stroke="rgba(242,239,232,0.25)" strokeWidth="1"/>
        <text x="30" y="17" textAnchor="middle" fontSize="5" fill="rgba(242,239,232,0.6)" fontWeight="bold">Class A</text>
        <rect x="68" y="10" width="44" height="36" rx="2" stroke="rgba(242,239,232,0.5)" strokeWidth="1.2"/>
        <line x1="68" y1="20" x2="112" y2="20" stroke="rgba(242,239,232,0.4)" strokeWidth="1"/>
        <line x1="68" y1="28" x2="112" y2="28" stroke="rgba(242,239,232,0.25)" strokeWidth="1"/>
        <text x="90" y="17" textAnchor="middle" fontSize="5" fill="rgba(242,239,232,0.6)" fontWeight="bold">Class B</text>
        <line x1="52" y1="28" x2="68" y2="28" stroke="rgba(242,239,232,0.35)" strokeWidth="1"/>
        <polygon points="64,25 68,28 64,31" fill="rgba(242,239,232,0.35)"/>
      </svg>
    ),
  },
  {
    title: "Sequence Diagrams",
    category: "Actors · Messages · Interaction flows",
    bg: "#F2EFE8",
    textPrimary: "#0E1116",
    textSecondary: "rgba(14,17,22,0.60)",
    href: "/workspace/uml?type=sequence",
    illustration: (
      <svg viewBox="0 0 120 80" width="100" height="67" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="30" y1="8" x2="30" y2="72" stroke="rgba(14,17,22,0.25)" strokeWidth="1" strokeDasharray="3 2"/>
        <line x1="90" y1="8" x2="90" y2="72" stroke="rgba(14,17,22,0.25)" strokeWidth="1" strokeDasharray="3 2"/>
        <rect x="18" y="4" width="24" height="10" rx="2" fill="rgba(14,17,22,0.08)" stroke="rgba(14,17,22,0.4)" strokeWidth="1"/>
        <rect x="78" y="4" width="24" height="10" rx="2" fill="rgba(14,17,22,0.08)" stroke="rgba(14,17,22,0.4)" strokeWidth="1"/>
        <line x1="30" y1="28" x2="84" y2="28" stroke="rgba(14,17,22,0.5)" strokeWidth="1"/>
        <polygon points="84,25 90,28 84,31" fill="rgba(14,17,22,0.5)"/>
        <line x1="90" y1="46" x2="36" y2="46" stroke="rgba(14,17,22,0.35)" strokeWidth="1" strokeDasharray="4 2"/>
        <polygon points="36,43 30,46 36,49" fill="rgba(14,17,22,0.35)"/>
        <text x="60" y="26" textAnchor="middle" fontSize="5" fill="rgba(14,17,22,0.4)">request</text>
        <text x="60" y="44" textAnchor="middle" fontSize="5" fill="rgba(14,17,22,0.4)">response</text>
      </svg>
    ),
  },
  {
    title: "ER Diagrams",
    category: "Entities · Keys · Cardinality",
    bg: "#22303D",
    textPrimary: "#F2EFE8",
    textSecondary: "#8B949E",
    href: "/workspace/uml?type=er",
    illustration: (
      <svg viewBox="0 0 120 80" width="100" height="67" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="20" width="38" height="24" rx="2" stroke="rgba(242,239,232,0.5)" strokeWidth="1.2"/>
        <line x1="8" y1="30" x2="46" y2="30" stroke="rgba(242,239,232,0.3)" strokeWidth="1"/>
        <text x="27" y="27" textAnchor="middle" fontSize="5" fill="rgba(242,239,232,0.6)" fontWeight="bold">Entity A</text>
        <rect x="74" y="20" width="38" height="24" rx="2" stroke="rgba(242,239,232,0.5)" strokeWidth="1.2"/>
        <line x1="74" y1="30" x2="112" y2="30" stroke="rgba(242,239,232,0.3)" strokeWidth="1"/>
        <text x="93" y="27" textAnchor="middle" fontSize="5" fill="rgba(242,239,232,0.6)" fontWeight="bold">Entity B</text>
        <polygon points="55,28 60,32 65,28 60,24" stroke="rgba(242,239,232,0.5)" strokeWidth="1" fill="rgba(242,239,232,0.08)"/>
        <line x1="46" y1="32" x2="55" y2="32" stroke="rgba(242,239,232,0.3)" strokeWidth="1"/>
        <line x1="65" y1="32" x2="74" y2="32" stroke="rgba(242,239,232,0.3)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    title: "State Machines",
    category: "States · Transitions · Guards",
    bg: "#2A2218",
    textPrimary: "#D6AD69",
    textSecondary: "rgba(214,173,105,0.60)",
    border: "1px solid rgba(214,173,105,0.25)",
    href: "/workspace/uml?type=state",
    illustration: (
      <svg viewBox="0 0 120 80" width="100" height="67" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="40" r="12" stroke="rgba(214,173,105,0.5)" strokeWidth="1.2"/>
        <circle cx="60" cy="20" r="12" stroke="rgba(214,173,105,0.6)" strokeWidth="1.2" fill="rgba(214,173,105,0.08)"/>
        <circle cx="98" cy="40" r="12" stroke="rgba(214,173,105,0.5)" strokeWidth="1.2"/>
        <circle cx="60" cy="62" r="12" stroke="rgba(214,173,105,0.35)" strokeWidth="1.2"/>
        <line x1="34" y1="34" x2="48" y2="26" stroke="rgba(214,173,105,0.4)" strokeWidth="1"/>
        <polygon points="46,22 50,28 44,28" fill="rgba(214,173,105,0.4)"/>
        <line x1="72" y1="26" x2="86" y2="34" stroke="rgba(214,173,105,0.4)" strokeWidth="1"/>
        <polygon points="88,36 84,30 90,30" fill="rgba(214,173,105,0.4)"/>
        <line x1="60" y1="32" x2="60" y2="50" stroke="rgba(214,173,105,0.3)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    title: "Architecture Inspector",
    category: "Health scores · Findings · Optimization",
    bg: "#171A20",
    textPrimary: "#F2EFE8",
    textSecondary: "#8B949E",
    border: "1px solid rgba(242,239,232,0.08)",
    href: "/workspace/generate",
    illustration: (
      <svg viewBox="0 0 120 80" width="100" height="67" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="38" r="26" stroke="rgba(242,239,232,0.15)" strokeWidth="1"/>
        <circle cx="60" cy="38" r="26" stroke="rgba(214,173,105,0.5)" strokeWidth="2" strokeDasharray="60 40" strokeLinecap="round"/>
        <text x="60" y="36" textAnchor="middle" fontSize="11" fill="rgba(242,239,232,0.8)" fontWeight="bold">82</text>
        <text x="60" y="46" textAnchor="middle" fontSize="5" fill="rgba(242,239,232,0.4)">health</text>
        <rect x="8" y="60" width="30" height="4" rx="2" fill="rgba(242,239,232,0.12)"/>
        <rect x="8" y="60" width="22" height="4" rx="2" fill="rgba(214,173,105,0.5)"/>
        <rect x="82" y="60" width="30" height="4" rx="2" fill="rgba(242,239,232,0.12)"/>
        <rect x="82" y="60" width="18" height="4" rx="2" fill="rgba(214,173,105,0.35)"/>
      </svg>
    ),
  },
];

export default function LandingBento() {
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="capabilities"
      className="min-h-[100dvh] bg-[#0E1116] px-6 py-28 md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#D6AD69]">
          Capabilities
        </p>

        <h2
          className="mt-4 font-display font-semibold tracking-[-0.03em] text-[#F2EFE8]"
          style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
        >
          Six diagram types in one studio.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <Link
              key={card.title}
              href={card.href}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="reveal-card group relative overflow-hidden rounded-lg"
              style={{
                aspectRatio: "4/3",
                background: card.bg,
                border: card.border,
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {/* Illustration in upper area */}
              <div className="absolute right-4 top-4 pointer-events-none opacity-70 transition-opacity duration-300 group-hover:opacity-90">
                {card.illustration}
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6">
                <p
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: card.textSecondary }}
                >
                  {card.category}
                </p>
                <h3
                  className="mt-1 font-sans text-lg font-semibold leading-tight"
                  style={{ color: card.textPrimary }}
                >
                  {card.title}
                </h3>
              </div>

              {/* Hover: view link */}
              <div
                className="absolute right-0 top-0 flex items-center gap-1 p-5 font-sans text-xs font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
                style={{ color: card.textPrimary }}
              >
                Open <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </div>

              {/* Lift overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-all duration-[400ms] ease-out group-hover:-translate-y-1 group-hover:opacity-100"
                style={{ background: "rgba(0,0,0,0.04)" }}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
