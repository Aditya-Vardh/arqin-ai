"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createUserStore } from "@/lib/storage/store";
import { DEFAULT_SETTINGS } from "@/lib/storage/types";
import type { ThemeMode } from "@/lib/storage/types";

type ThemeContextValue = {
  theme: ThemeMode;
  resolved: "dark" | "light";
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(t: ThemeMode): "dark" | "light" {
  if (t === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();

  // Initialise from the anti-flash script's already-applied value so there
  // is zero flicker on hydration.
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS.theme;
    const attr = document.documentElement.getAttribute("data-theme");
    return (attr === "light" || attr === "dark") ? attr : DEFAULT_SETTINGS.theme;
  });

  // Once Clerk finishes loading, read the user's persisted preference.
  useEffect(() => {
    if (!isLoaded) return;
    const saved = userId
      ? createUserStore(userId).getSettings().theme
      : DEFAULT_SETTINGS.theme;
    setThemeState(saved);
  }, [isLoaded, userId]);

  const resolved = resolveTheme(theme);

  // Apply to DOM whenever resolved changes.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  // Track system preference when theme === "system".
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      document.documentElement.setAttribute(
        "data-theme",
        mq.matches ? "light" : "dark",
      );
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function setTheme(next: ThemeMode) {
    // Persist.
    if (userId) {
      const store = createUserStore(userId);
      store.saveSettings({ ...store.getSettings(), theme: next });
    }
    // Update React state → triggers re-render and DOM update via effect.
    setThemeState(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
