"use client";

import { useState, Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import LineSidebar, { SidebarToggle } from "@/components/workspace/LineSidebar";
import { UserStoreProvider } from "@/hooks/UserStoreContext";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <UserStoreProvider>
    <div className="workspace-ambient flex h-screen min-h-screen overflow-hidden text-foreground bg-background">
      <Suspense fallback={<div className="w-[260px] bg-background border-r border-[var(--border)]" />}>
        <LineSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="workspace-mobile-bar lg:hidden border-b border-[var(--border)] bg-background px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SidebarToggle onClick={() => setSidebarOpen(true)} />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">Arqin <span className="text-[var(--accent)]">AI</span></span>
              <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-mono">Architecture Engine</span>
            </div>
          </div>
          <UserButton
            appearance={{              variables: { colorPrimary: "#D6AD69" },
              elements: { avatarBox: "w-8 h-8" },
            }}          />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
    </UserStoreProvider>
  );
}
