import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingBento from "@/components/landing/LandingBento";
import LandingTrust from "@/components/landing/LandingTrust";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#0E1116", color: "#F2EFE8" }}>
      <LandingHeader />
      <main className="flex-1">
        {/* Section 1 — Hero with tile mosaic */}
        <LandingHero />
        {/* Section 2 — How it works (3-step process) */}
        <LandingHowItWorks />
        {/* Section 3 — Capabilities (diagram type cards) */}
        <LandingBento />
        {/* Section 4 — About / Studio */}
        <LandingTrust />
        {/* Section 5 — CTA / Contact */}
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
