"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
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

function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme === "system") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // ThemeProvider lives in the root layout (outside UserStoreProvider), so
  // we obtain the Clerk userId directly.
  const { userId, isLoaded } = useAuth();

  // Derive theme and resolved values synchronously from the current user's
  // settings. useMemo re-runs when userId changes (account switch).
  const { theme, resolved } = useMemo(() => {
    const savedTheme: ThemeMode =
      isLoaded && userId
        ? createUserStore(userId).getSettings().theme
        : DEFAULT_SETTINGS.theme;
    return { theme: savedTheme, resolved: resolveTheme(savedTheme) };
  }, [isLoaded, userId]);

  // Apply the resolved theme to the document as a DOM side effect.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  // Track system preference changes when theme is "system".
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
    // Persist the new theme to the user's scoped settings.
    if (userId) {
      const store = createUserStore(userId);
      const settings = store.getSettings();
      store.saveSettings({ ...settings, theme: next });
    }
    // Apply to DOM immediately (without waiting for a re-render cycle).
    document.documentElement.setAttribute("data-theme", resolveTheme(next));
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
