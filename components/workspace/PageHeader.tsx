"use client";

import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  /** Optional word or phrase in the title to render in amber */
  titleHighlight?: string;
  description: string;
  /** Optional action slot — button or link rendered on the right */
  action?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  action,
}: Props) {
  // Split title into pre-highlight and highlight parts if titleHighlight is provided
  const renderTitle = () => {
    if (!titleHighlight) {
      return <>{title}</>;
    }
    const idx = title.indexOf(titleHighlight);
    if (idx === -1) return <>{title}</>;
    return (
      <>
        {title.slice(0, idx)}
        <span className="text-[var(--accent)]">{titleHighlight}</span>
        {title.slice(idx + titleHighlight.length)}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {/* Eyebrow badge */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden="true" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
            {eyebrow}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl">
          {renderTitle()}
        </h1>

        {/* Description */}
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      </div>

      {/* Action slot */}
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
