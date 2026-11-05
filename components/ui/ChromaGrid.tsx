"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type ChromaItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  badge?: string;
  accent?: "cyan" | "violet" | "amber" | "emerald" | "rose" | "blue";
  visual?: ReactNode;
  onClick?: () => void;
};

export default function ChromaGrid({ items }: { items: ChromaItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const cls = "group relative overflow-hidden rounded-3xl border border-[#D6AD69]/15 bg-gradient-to-b from-[var(--background)]/90 via-[var(--background-2)]/95 to-[var(--background)] p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#D6AD69]/35 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(214,173,105,0.15)] flex flex-col justify-between";
        const body = (
          <>
            {/* Dark pattern background texture */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6AD69_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#D6AD69]/15 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

            <div className="relative z-10">
              {item.badge && (
                <span className="mb-3 inline-block rounded-full border border-[#D6AD69]/20 bg-[#D6AD69]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#D6AD69]">
                  {item.badge}
                </span>
              )}
              {item.visual && <div className="mb-4 overflow-hidden rounded-2xl border border-[#D6AD69]/10 bg-[var(--background-2)] p-3">{item.visual}</div>}
              <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)] group-hover:text-[#D6AD69] transition-colors">{item.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">{item.description}</p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-[#D6AD69]/10 flex items-center justify-between text-xs font-bold text-[#D6AD69] group-hover:text-[var(--accent-hover)]">
              <span>Select Blueprint</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </>
        );

        if (item.href) {
          return (
            <Link key={item.id} href={item.href} className={cls}>
              {body}
            </Link>
          );
        }
        return (
          <button key={item.id} type="button" onClick={item.onClick} className={`${cls} text-left`}>
            {body}
          </button>
        );
      })}
    </div>
  );
}

export type { ChromaItem };
