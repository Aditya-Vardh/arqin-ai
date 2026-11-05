"use client";

import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import LineSidebar, { SidebarToggle } from "@/components/workspace/LineSidebar";
import { UserStoreProvider } from "@/hooks/UserStoreContext";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <UserStoreProvider>
      <div
        className="workspace-ambient flex h-screen min-h-screen overflow-hidden"
        style={{ background: "#0C0E12", color: "#F0F1F3" }}
      >
        <Suspense
          fallback={
            <div
              className="w-[260px] shrink-0"
              style={{ background: "#0C0E12", borderRight: "1px solid rgba(48,54,64,0.85)" }}
            />
          }
        >
          <LineSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Suspense>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile top bar */}
          <header
            className="lg:hidden flex items-center justify-between gap-3 border-b px-4 py-3"
            style={{ background: "rgba(12,14,18,0.97)", borderColor: "rgba(48,54,64,0.85)" }}
          >
            <div className="flex items-center gap-3">
              <SidebarToggle onClick={() => setSidebarOpen(true)} />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight whitespace-nowrap" style={{ color: "#F0F1F3" }}>
                  Arqin <span style={{ color: "#D6AD69" }}>AI</span>
                </span>
                <span
                  className="font-mono text-[9px] font-semibold uppercase whitespace-nowrap leading-tight"
                  style={{ letterSpacing: "0.2em", color: "#D6AD69" }}
                >
                  Architecture Engine
                </span>
              </div>
            </div>
            <UserButton
              appearance={{ variables: { colorPrimary: "#D6AD69" }, elements: { avatarBox: "w-8 h-8" } }}
            />
          </header>

          {/* Main scroll area — key on pathname so the enter animation fires on every navigation */}
          <main className="min-h-0 flex-1 overflow-y-auto" style={{ background: "#101216" }}>
            <div
              key={pathname}
              className="animate-page-enter min-h-full"
              style={{ background: "#101216" }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </UserStoreProvider>
  );
}
