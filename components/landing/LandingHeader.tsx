"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

const NAV = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "/workspace/templates", label: "Templates" },
  { href: "/workspace/uml", label: "UML" },
];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "header-scrolled" : "header-top"}`}
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6AD69]"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ border: "1px solid rgba(214,173,105,0.30)", background: "#171A20" }}
          >
            <Image src="/icon.svg" alt="Arqin AI" width={18} height={18} />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display text-[17px] font-bold leading-none tracking-tight text-[var(--text-primary)]">
              Arqin
            </span>
            <span className="font-display text-[17px] font-bold leading-none tracking-tight text-[var(--accent)]">
              AI
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-sans text-sm font-medium text-[var(--text-primary)]/60 transition-colors duration-200 hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          {isSignedIn ? (
            <>
              <Link
                href="/workspace"
                className="flex items-center gap-1.5 font-sans text-sm font-medium text-[var(--text-primary)]/70 transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                <LayoutDashboard className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                Dashboard
              </Link>
              <UserButton
                appearance={{                  variables: { colorPrimary: "#D6AD69" },
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}              />
            </>
          ) : (
            <>
              <SignInButton mode="redirect" fallbackRedirectUrl="/workspace">
                <button
                  type="button"
                  className="font-sans text-sm font-medium text-[var(--text-primary)]/70 transition-colors hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                >
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="redirect" fallbackRedirectUrl="/workspace">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-2 font-sans text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                >
                  Start a project
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-[var(--border)] p-2 text-[var(--text-primary)]/70 transition-colors hover:text-[var(--text-primary)] md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="border-t px-6 py-5 md:hidden"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 font-sans text-sm font-medium text-[var(--text-primary)]/70 transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div
            className="mt-5 flex flex-col gap-3 border-t pt-5"
            style={{ borderColor: "var(--border)" }}
          >
            {isSignedIn ? (
              <Link
                href="/workspace"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 font-sans text-sm font-semibold text-[var(--background)]"
              >
                Open Workspace
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <>
                <SignInButton mode="redirect" fallbackRedirectUrl="/workspace">
                  <button
                    type="button"
                    className="rounded-md border border-[var(--border)] px-4 py-2.5 text-center font-sans text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)] w-full"
                  >
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect" fallbackRedirectUrl="/workspace">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 font-sans text-sm font-semibold text-[var(--background)] w-full"
                  >
                    Start a project
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
