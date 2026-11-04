import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Sign Up — Arqin AI",
  description: "Create your Arqin AI account.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-[#0E1116]">
      {/* ─── Left panel — branding ─── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r relative overflow-hidden"
        style={{ borderColor: "rgba(242,239,232,0.08)" }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(242,239,232,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        {/* Amber glow */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{ background: "rgba(214,173,105,0.07)" }}
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                border: "1px solid rgba(214,173,105,0.35)",
                background: "#171A20",
              }}
            >
              <Image src="/icon.svg" alt="Arqin AI" width={20} height={20} />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-[17px] tracking-tight text-[#F2EFE8]">
                Arqin
              </span>
              <span className="font-bold text-[17px] tracking-tight text-[#D6AD69]">
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col gap-10">
          <div>
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-[#D6AD69]"
              style={{
                background: "rgba(214,173,105,0.10)",
                border: "1px solid rgba(214,173,105,0.25)",
              }}
            >
              Free to use &middot; No credit card required
            </div>
            <h1
              className="font-bold tracking-[-0.03em] text-[#F2EFE8] leading-[1.08]"
              style={{ fontSize: "clamp(32px, 3.2vw, 46px)" }}
            >
              Start architecting
              <br />
              <span className="text-[#D6AD69]">in seconds.</span>
            </h1>
            <p
              className="mt-4 text-[15px] leading-[1.7] max-w-[380px]"
              style={{ color: "rgba(242,239,232,0.55)" }}
            >
              Join developers and architects who use Arqin AI to turn system
              descriptions into production-ready diagrams and UML
              specifications.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: "⬡",
                label: "Architecture Diagrams",
                desc: "Flowchart, Component, Deployment",
              },
              {
                icon: "⟨⟩",
                label: "UML Diagrams",
                desc: "Class, Sequence, ER, State",
              },
              {
                icon: "✦",
                label: "AI Inspector",
                desc: "Health scores & findings",
              },
              {
                icon: "↓",
                label: "Export Ready",
                desc: "SVG, PNG, Markdown",
              },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-xl p-4"
                style={{
                  background: "#171A20",
                  border: "1px solid rgba(242,239,232,0.08)",
                }}
              >
                <div className="text-[#D6AD69] text-base mb-2 font-mono leading-none">
                  {f.icon}
                </div>
                <div className="text-[13px] font-semibold text-[#F2EFE8] leading-snug">
                  {f.label}
                </div>
                <div
                  className="text-[11px] mt-1 leading-snug"
                  style={{ color: "rgba(242,239,232,0.40)" }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="relative z-10 text-xs"
          style={{ color: "rgba(242,239,232,0.25)" }}
        >
          &copy; {new Date().getFullYear()} Arqin AI &middot; All data stored
          locally in your browser
        </p>
      </div>

      {/* ─── Right panel — Clerk SignUp ─── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12 bg-[#0E1116]">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              border: "1px solid rgba(214,173,105,0.35)",
              background: "#171A20",
            }}
          >
            <Image src="/icon.svg" alt="Arqin AI" width={18} height={18} />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-base text-[#F2EFE8]">Arqin</span>
            <span className="font-bold text-base text-[#D6AD69]">AI</span>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex h-64 w-full max-w-sm items-center justify-center text-sm text-[#F2EFE8]/50">
              Loading…
            </div>
          }
        >
          <SignUp
            forceRedirectUrl="/workspace"
            signInUrl="/sign-in"
            appearance={{
              variables: {
                colorPrimary: "#D6AD69",
                colorBackground: "#171A20",
                colorText: "#F2EFE8",
                colorTextSecondary: "rgba(242,239,232,0.65)",
                colorNeutral: "rgba(242,239,232,0.65)",
                colorDanger: "#E07070",
                colorSuccess: "#65A884",
                borderRadius: "0.75rem",
                fontFamily: "inherit",
                fontSize: "14px",
              } as Record<string, string>,
              elements: {
                rootBox: "w-full max-w-sm mx-auto",
                card: "!bg-[#171A20] !border !border-[rgba(242,239,232,0.10)] !shadow-[0_24px_64px_rgba(0,0,0,0.70)] !rounded-2xl",
                cardBox: "!bg-[#171A20]",
                headerTitle: "!text-[#F2EFE8] !font-bold",
                headerSubtitle: "!text-[rgba(242,239,232,0.55)]",
                socialButtonsBlockButton:
                  "!border-[rgba(242,239,232,0.12)] !bg-[#1D222A] !text-[#F2EFE8] hover:!bg-[#232830] hover:!border-[rgba(214,173,105,0.35)]",
                socialButtonsBlockButtonText: "!text-[#F2EFE8] !font-medium",
                socialButtonsBlockButtonArrow: "!text-[#F2EFE8]",
                dividerLine: "!bg-[rgba(242,239,232,0.10)]",
                dividerText: "!text-[rgba(242,239,232,0.40)]",
                formFieldLabel:
                  "!text-[rgba(242,239,232,0.80)] !text-xs !font-semibold",
                formFieldInput:
                  "!bg-[#1D222A] !border-[rgba(242,239,232,0.12)] !text-[#F2EFE8] placeholder:!text-[rgba(242,239,232,0.30)] focus:!border-[#D6AD69] !rounded-xl",
                formFieldInputShowPasswordButton: "!text-[rgba(242,239,232,0.50)]",
                formButtonPrimary:
                  "!bg-[#D6AD69] !text-[#0E1116] !font-bold hover:!bg-[#E0BC7A] !rounded-xl",
                footerActionText: "!text-[rgba(242,239,232,0.55)]",
                footerActionLink: "!text-[#D6AD69] hover:!text-[#E0BC7A]",
                identityPreviewText: "!text-[#F2EFE8]",
                identityPreviewEditButton: "!text-[#D6AD69]",
                formFieldSuccessText: "!text-[#65A884]",
                formFieldErrorText: "!text-[#E07070]",
                formFieldWarningText: "!text-[rgba(214,173,105,0.90)]",
                alertText: "!text-[#E07070]",
                alternativeMethodsBlockButton:
                  "!border-[rgba(242,239,232,0.12)] !text-[rgba(242,239,232,0.70)] hover:!text-[#F2EFE8]",
                otpCodeFieldInput:
                  "!bg-[#1D222A] !border-[rgba(242,239,232,0.12)] !text-[#F2EFE8]",
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
