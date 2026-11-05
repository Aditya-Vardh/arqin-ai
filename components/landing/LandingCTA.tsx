"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignUpButton, useAuth } from "@clerk/nextjs";

export default function LandingCTA() {
  const { isSignedIn } = useAuth();

  return (
    <section className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--background)] px-6 py-28 text-center">
      <div className="mx-auto w-full max-w-3xl">
        <h2
          className="font-display font-bold tracking-[-0.03em] text-[var(--text-primary)]"
          style={{ fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 1.04 }}
        >
          Ready to build your
          <br />
          <span className="text-[var(--accent)]">next architecture?</span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg font-sans text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
          Describe your system and get a production-ready diagram in seconds.
        </p>

        <div className="mx-auto mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {isSignedIn ? (
            <Link
              href="/workspace/generate?new=1"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-8 py-3.5 font-sans text-[15px] font-semibold text-[var(--background)] transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
            >
              New Architecture
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <>
              <SignUpButton mode="redirect" fallbackRedirectUrl="/workspace">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-8 py-3.5 font-sans text-[15px] font-semibold text-[var(--background)] transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </SignUpButton>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-md border border-[var(--text-primary)]/20 px-8 py-3.5 font-sans text-[15px] font-medium text-[var(--text-primary)] transition-colors hover:border-[#D6AD69]/50 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
              >
                See how it works
              </Link>
            </>
          )}
        </div>

        <p className="mt-6 font-sans text-xs text-[var(--text-faint)]">
          All project data stored locally in your browser &middot; No external servers
        </p>
      </div>
    </section>
  );
}
