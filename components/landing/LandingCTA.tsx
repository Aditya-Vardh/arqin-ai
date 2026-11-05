"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignUpButton, useAuth } from "@clerk/nextjs";

export default function LandingCTA() {
  const { isSignedIn } = useAuth();

  return (
    <section className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0E1116] px-6 py-28 text-center">
      <div className="mx-auto w-full max-w-3xl">
        <h2
          className="font-display font-bold tracking-[-0.03em] text-[#F2EFE8]"
          style={{ fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 1.04 }}
        >
          Ready to build your
          <br />
          <span className="text-[#D6AD69]">next architecture?</span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg font-sans text-base leading-relaxed text-[#8B949E] sm:text-lg">
          Describe your system and get a production-ready diagram in seconds.
        </p>

        <div className="mx-auto mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {isSignedIn ? (
            <Link
              href="/workspace/generate?new=1"
              className="inline-flex items-center gap-2 rounded-md bg-[#D6AD69] px-8 py-3.5 font-sans text-[15px] font-semibold text-[#0E1116] transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
            >
              New Architecture
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <>
              <SignUpButton mode="redirect" fallbackRedirectUrl="/workspace">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[#D6AD69] px-8 py-3.5 font-sans text-[15px] font-semibold text-[#0E1116] transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </SignUpButton>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-md border border-[#F2EFE8]/20 px-8 py-3.5 font-sans text-[15px] font-medium text-[#F2EFE8] transition-colors hover:border-[#D6AD69]/50 hover:text-[#D6AD69] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
              >
                See how it works
              </Link>
            </>
          )}
        </div>

        <p className="mt-6 font-sans text-xs text-[#4A5060]">
          All project data stored locally in your browser &middot; No external servers
        </p>
      </div>
    </section>
  );
}
