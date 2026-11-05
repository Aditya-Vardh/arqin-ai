"use client";

/**
 * PageShell — wraps every workspace page for consistent entrance animation.
 * Import and use as the outermost wrapper in each workspace page.tsx.
 */
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-full animate-fade-in-up"
      style={{
        background: "#101216",
        animationDuration: "0.45s",
        animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}
