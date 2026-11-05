"use client";

import { useEffect, useState } from "react";
import { Check, Moon, Sun, Monitor, Settings, Key, ShieldCheck, Lock } from "lucide-react";
import { useStore } from "@/hooks/UserStoreContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import type { AppSettings, DiagramType, ThemeMode } from "@/lib/storage/types";
import { DEFAULT_SETTINGS, DIAGRAM_TYPE_LABELS } from "@/lib/storage/types";

const SECTIONS = ["Appearance", "Architecture", "API & Privacy", "About System"] as const;

export default function SettingsPage() {
  const store = useStore();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Appearance");

  useEffect(() => {
    if (!store) return;
    const id = requestAnimationFrame(() => setSettings(store.getSettings()));
    return () => cancelAnimationFrame(id);
  }, [store]);

  function update(partial: Partial<AppSettings>) {
    if (!store) return;
    const next = { ...settings, ...partial };
    setSettings(next);
    store.saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function setThemeMode(mode: ThemeMode) {
    setTheme(mode);
    update({ theme: mode });
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-10 pt-8 sm:pt-12 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--accent)]/15 pb-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-1 backdrop-blur-md">
            <Settings className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
              System Configuration
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl leading-tight mb-2">
            Workspace Settings
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            Configure theme aesthetics, default diagram specs, in-browser privacy, and local storage.
          </p>
        </div>

        {saved && (
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-1.5 font-mono text-xs font-bold text-[var(--accent)] shrink-0">
            <Check className="h-3.5 w-3.5" /> Preferences Saved
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--accent)]/20 bg-[var(--background)] p-1.5">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              section === s
                ? "bg-[var(--accent)] text-[var(--background)] shadow-[0_0_20px_rgba(var(--accent-rgb,214,173,105),0.3)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)]/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {section === "Appearance" && (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/15 bg-[var(--surface)] p-7 backdrop-blur-2xl space-y-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04]" />
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Theme Aesthetic</h2>
            <p className="text-xs text-[var(--text-muted)]">Select interface appearance and accent lighting.</p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { mode: "dark" as ThemeMode, icon: Moon, label: "Dark Midnight" },
                { mode: "light" as ThemeMode, icon: Sun, label: "Light Mode" },
                { mode: "system" as ThemeMode, icon: Monitor, label: "System Sync" },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setThemeMode(mode)}
                  className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 text-xs font-bold transition-all ${
                    theme === mode
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_25px_rgba(var(--accent-rgb,214,173,105),0.2)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--text-muted)] hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "Architecture" && (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/15 bg-[var(--surface)] p-7 backdrop-blur-2xl space-y-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04]" />
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Diagram Specification Defaults</h2>
              <p className="text-xs text-[var(--text-muted)]">Choose the default UML diagram type when launching new projects.</p>
            </div>

            <div>
              <label htmlFor="default-diagram" className="mb-2 block text-xs font-mono uppercase tracking-wider text-[var(--text-faint)]">
                Default Diagram Type
              </label>
              <select
                id="default-diagram"
                value={settings.defaultDiagramType}
                onChange={(e) => update({ defaultDiagramType: e.target.value as DiagramType })}
                className="w-full rounded-2xl border border-[var(--accent)]/20 bg-[var(--background)] px-4 py-3 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                {Object.entries(DIAGRAM_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-[var(--surface)]">{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-5 border-t border-[var(--accent)]/10 pt-5">
              <Toggle
                label="Auto-Save Architecture Projects"
                description="Automatically commit changes and generated diagrams to local storage."
                checked={settings.autoSaveProjects}
                onChange={(v) => update({ autoSaveProjects: v })}
              />
              <Toggle
                label="Show Property Inspector by Default"
                description="Open component inspector drawer automatically upon synthesis completion."
                checked={settings.showExplanationByDefault}
                onChange={(v) => update({ showExplanationByDefault: v })}
              />
            </div>
          </div>
        </div>
      )}

      {section === "API & Privacy" && (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/15 bg-[var(--surface)] p-7 backdrop-blur-2xl space-y-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04]" />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--accent)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Local Storage &amp; Privacy Guarantee</h2>
                <p className="text-xs text-[var(--accent)]">Zero Cloud Storage  ·  100% In-Browser Privacy</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--background)] p-5 space-y-3 text-xs leading-relaxed text-[var(--text-muted)]">
              <p>
                <strong className="text-[var(--text-primary)]">In-Browser Storage:</strong> All system architecture diagrams, prompt history, and custom settings are stored exclusively inside your browser&apos;s local storage (<code>localStorage</code>).
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">API Keys &amp; Configuration:</strong> Optional API keys (`GROQ_API_KEY`, `OPENAI_API_KEY`) configured in `.env.local` or browser state stay local. If no cloud key is provided, Arqin AI uses the offline deterministic synthesis engine so generation works 100% reliably without requiring any remote login.
              </p>
            </div>
          </div>
        </div>
      )}

      {section === "About System" && (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/15 bg-[var(--surface)] p-7 backdrop-blur-2xl space-y-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04]" />
          <div className="relative z-10 space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Arqin AI Specifications</h2>
              <p className="text-xs text-[var(--text-muted)]">System architecture components and software build info.</p>
            </div>

            <dl className="space-y-3 divide-y divide-[var(--accent)]/10 text-xs">
              <Row label="Core Product" value="Arqin AI Studio Pro v0.1" />
              <Row label="AI Inference Engine" value="Groq / OpenAI API &amp; Offline Synthesizer" />
              <Row label="Storage Engine" value="Encrypted In-Browser Local Storage" />
              <Row label="Diagram Renderer" value="Mermaid.js v11 SVG Engine" />
              <Row label="Privacy Mode" value="100% Local In-Browser Storage" />
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between pt-3">
      <dt className="text-[var(--text-faint)] font-medium">{label}</dt>
      <dd className="font-mono font-bold text-[var(--accent)]">{value}</dd>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--accent)]" : "bg-[var(--accent)]/20"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[var(--background)] transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}
