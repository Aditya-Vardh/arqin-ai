"use client";

import { useState } from "react";
import { X, Play, AlertTriangle, CheckCircle2, Cpu, Users, Zap, ShieldAlert, Sliders } from "lucide-react";
import type { ArchitectureGraph, SimulationScenario, SimulationResult } from "@/lib/graph/types";
import { simulateTrafficScenario } from "@/lib/simulator/simulator";

type Props = {
  graph: ArchitectureGraph;
  onClose: () => void;
  onHighlightBottlenecks: (nodeIds: string[]) => void;
};

export default function ArchitectureSimulator({ graph, onClose, onHighlightBottlenecks }: Props) {
  const [users, setUsers] = useState<number>(1000000);
  const [requestRate, setRequestRate] = useState<number>(25000);
  const [availability, setAvailability] = useState<SimulationScenario["availabilityTarget"]>("99.9%");
  const [regions, setRegions] = useState<number>(1);
  const [result, setResult] = useState<SimulationResult | null>(() =>
    simulateTrafficScenario(graph, {
      users: 1000000,
      requestRateRPS: 25000,
      trafficLevel: "High",
      availabilityTarget: "99.9%",
      regionCount: 1,
    })
  );

  function runSimulation() {
    const scenario: SimulationScenario = {
      users,
      requestRateRPS: requestRate,
      trafficLevel: users >= 10000000 ? "Extreme" : users >= 1000000 ? "High" : "Medium",
      availabilityTarget: availability,
      regionCount: regions,
    };

    const simRes = simulateTrafficScenario(graph, scenario);
    setResult(simRes);
    if (simRes.bottleneckNodeIds.length > 0) {
      onHighlightBottlenecks(simRes.bottleneckNodeIds);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl animate-fade-in">
      <div className="flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-[var(--background)] text-[var(--text-primary)] shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--accent)]/15 bg-[var(--background)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-[#A08050] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[var(--background)]">
                <Cpu className="h-5 w-5 text-[var(--accent)]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">What-If Architecture Simulator</h2>
              <p className="text-xs text-[var(--text-muted)]">Simulate traffic surges, SLA availability targets, and bottleneck stress limits.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--accent)]/15 bg-[var(--background)] p-2 text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-3 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#D6AD69]/15">
          {/* Left Panel: Variable Sliders */}
          <div className="p-6 bg-[var(--background)] space-y-6 overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-[var(--accent)]/10 pb-3">
              <Sliders className="h-4 w-4 text-[var(--accent)]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Simulation Controls</span>
            </div>

            {/* Slider 1: Users */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--text-muted)]">Concurrent Users</span>
                <span className="font-mono text-[var(--accent)]">{users.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={10000000}
                step={100000}
                value={users}
                onChange={(e) => setUsers(Number(e.target.value))}
                className="w-full accent-[#D6AD69]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-faint)] font-mono">
                <span>100K</span>
                <span>1M</span>
                <span>10M</span>
              </div>
            </div>

            {/* Slider 2: Request Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--text-muted)]">Peak Traffic (RPS)</span>
                <span className="font-mono text-[var(--accent)]">{requestRate.toLocaleString()} RPS</span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={requestRate}
                onChange={(e) => setRequestRate(Number(e.target.value))}
                className="w-full accent-[#D6AD69]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-faint)] font-mono">
                <span>5,000</span>
                <span>50,000</span>
                <span>100,000</span>
              </div>
            </div>

            {/* Selector 3: Availability SLA */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-[var(--text-muted)]">Availability Target (SLA)</span>
              <div className="grid grid-cols-4 gap-2">
                {(["99%", "99.9%", "99.99%", "99.999%"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvailability(a)}
                    className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                      availability === a
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--accent)]/15 bg-[var(--background)] text-[var(--text-faint)]"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector 4: Region Count */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-[var(--text-muted)]">Multi-Region Deployment</span>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegions(r)}
                    className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                      regions === r
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--accent)]/15 bg-[var(--background)] text-[var(--text-faint)]"
                    }`}
                  >
                    {r} {r === 1 ? "Region" : "Regions"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={runSimulation}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[#A08050] px-4 py-3 text-xs font-bold text-[var(--on-accent)] shadow-[0_0_25px_rgba(var(--accent-rgb,214,173,105),0.3)] hover:scale-[1.02] transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Run Stress Simulation</span>
            </button>
          </div>

          {/* Right Panel: Simulation Results */}
          <div className="md:col-span-2 p-6 bg-[var(--background-2)] space-y-6 overflow-y-auto">
            {result && (
              <>
                {/* Status Card */}
                <div className={`rounded-2xl border p-5 ${result.isViable ? "border-[var(--accent)]/30 bg-[var(--accent)]/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.isViable ? (
                        <CheckCircle2 className="h-6 w-6 text-[var(--accent)]" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-amber-400" />
                      )}
                      <div>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">
                          {result.isViable ? "Architecture Scale Viable" : "Stress Limit Exceeded  --  Bottlenecks Detected"}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">Simulated at {users.toLocaleString()} users &amp; {requestRate.toLocaleString()} RPS</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text-muted)]">Est. Latency: +{result.latencyIncreaseMs}ms</span>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)] border-t border-[var(--accent)]/10 pt-3">
                    {result.analysis}
                  </p>
                </div>

                {/* Failure Risks */}
                {result.failureRisks.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Potential Stress Failures ({result.failureRisks.length})</span>
                    </div>

                    <div className="space-y-2">
                      {result.failureRisks.map((fr, idx) => (
                        <div key={idx} className="rounded-xl border border-amber-500/20 bg-[var(--background)] p-3 text-xs leading-relaxed text-[var(--text-muted)]">
                          âš ï¸ {fr}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Scale Additions */}
                {result.recommendedAdditions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[var(--accent)]">
                      <Zap className="h-4 w-4" />
                      <span>Recommended Infrastructure Upgrades</span>
                    </div>

                    <ul className="space-y-2">
                      {result.recommendedAdditions.map((ra, idx) => (
                        <li key={idx} className="flex items-center justify-between rounded-xl border border-[var(--accent)]/15 bg-[var(--background)] p-3 text-xs text-[var(--text-primary)]">
                          <span>{ra}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (result.bottleneckNodeIds.length > 0) {
                                onHighlightBottlenecks(result.bottleneckNodeIds);
                                onClose();
                              }
                            }}
                            className="rounded-lg bg-[var(--accent)]/20 px-2.5 py-1 font-mono text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] transition-all"
                          >
                            Highlight on Canvas
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
