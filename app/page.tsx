import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingBento from "@/components/landing/LandingBento";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingUseCases from "@/components/landing/LandingUseCases";
import LandingTrust from "@/components/landing/LandingTrust";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

// Landing page is ALWAYS dark — independent of the user's theme preference.
// All sections use hardcoded dark values; the data-theme="dark" attr ensures
// any CSS var fallbacks resolve correctly even if the root html has light theme.
export default function Home() {
  return (
    <div
      data-theme="dark"
      className="flex min-h-screen flex-col"
      style={{ background: "#0E1116", color: "#F2EFE8" }}
    >
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingHowItWorks />
        <LandingBento />
        <LandingFeatures />
        <LandingUseCases />
        <LandingTrust />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
