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
      <div className="flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#D6AD69]/20 bg-[#101216] text-[#F0F1F3] shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D6AD69]/15 bg-[#101216] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D6AD69] via-[#D6AD69] to-[#A08050] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#101216]">
                <Cpu className="h-5 w-5 text-[#D6AD69]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F0F1F3]">What-If Architecture Simulator</h2>
              <p className="text-xs text-[#A4AAB5]">Simulate traffic surges, SLA availability targets, and bottleneck stress limits.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#D6AD69]/15 bg-[#101216] p-2 text-[#4A5060] hover:text-[#F0F1F3] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-3 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#D6AD69]/15">
          {/* Left Panel: Variable Sliders */}
          <div className="p-6 bg-[#101216] space-y-6 overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-[#D6AD69]/10 pb-3">
              <Sliders className="h-4 w-4 text-[#D6AD69]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D6AD69]">Simulation Controls</span>
            </div>

            {/* Slider 1: Users */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#A4AAB5]">Concurrent Users</span>
                <span className="font-mono text-[#D6AD69]">{users.toLocaleString()}</span>
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
              <div className="flex justify-between text-[10px] text-[#4A5060] font-mono">
                <span>100K</span>
                <span>1M</span>
                <span>10M</span>
              </div>
            </div>

            {/* Slider 2: Request Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#A4AAB5]">Peak Traffic (RPS)</span>
                <span className="font-mono text-[#D6AD69]">{requestRate.toLocaleString()} RPS</span>
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
              <div className="flex justify-between text-[10px] text-[#4A5060] font-mono">
                <span>5,000</span>
                <span>50,000</span>
                <span>100,000</span>
              </div>
            </div>

            {/* Selector 3: Availability SLA */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-[#A4AAB5]">Availability Target (SLA)</span>
              <div className="grid grid-cols-4 gap-2">
                {(["99%", "99.9%", "99.99%", "99.999%"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvailability(a)}
                    className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                      availability === a
                        ? "border-[#D6AD69] bg-[#D6AD69]/10 text-[#D6AD69]"
                        : "border-[#D6AD69]/15 bg-[#101216] text-[#4A5060]"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector 4: Region Count */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-[#A4AAB5]">Multi-Region Deployment</span>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegions(r)}
                    className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                      regions === r
                        ? "border-[#D6AD69] bg-[#D6AD69]/10 text-[#D6AD69]"
                        : "border-[#D6AD69]/15 bg-[#101216] text-[#4A5060]"
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D6AD69] via-[#D6AD69] to-[#A08050] px-4 py-3 text-xs font-bold text-[#101216] shadow-[0_0_25px_rgba(214, 173, 105,0.3)] hover:scale-[1.02] transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Run Stress Simulation</span>
            </button>
          </div>

          {/* Right Panel: Simulation Results */}
          <div className="md:col-span-2 p-6 bg-[#0C0E12] space-y-6 overflow-y-auto">
            {result && (
              <>
                {/* Status Card */}
                <div className={`rounded-2xl border p-5 ${result.isViable ? "border-[#D6AD69]/30 bg-[#D6AD69]/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.isViable ? (
                        <CheckCircle2 className="h-6 w-6 text-[#D6AD69]" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-amber-400" />
                      )}
                      <div>
                        <h3 className="font-bold text-sm text-[#F0F1F3]">
                          {result.isViable ? "Architecture Scale Viable" : "Stress Limit Exceeded  --  Bottlenecks Detected"}
                        </h3>
                        <p className="text-xs text-[#A4AAB5]">Simulated at {users.toLocaleString()} users &amp; {requestRate.toLocaleString()} RPS</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#A4AAB5]">Est. Latency: +{result.latencyIncreaseMs}ms</span>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-[#A4AAB5] border-t border-[#D6AD69]/10 pt-3">
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
                        <div key={idx} className="rounded-xl border border-amber-500/20 bg-[#101216] p-3 text-xs leading-relaxed text-[#A4AAB5]">
                          âš ï¸ {fr}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Scale Additions */}
                {result.recommendedAdditions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#D6AD69]">
                      <Zap className="h-4 w-4" />
                      <span>Recommended Infrastructure Upgrades</span>
                    </div>

                    <ul className="space-y-2">
                      {result.recommendedAdditions.map((ra, idx) => (
                        <li key={idx} className="flex items-center justify-between rounded-xl border border-[#D6AD69]/15 bg-[#101216] p-3 text-xs text-[#F0F1F3]">
                          <span>{ra}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (result.bottleneckNodeIds.length > 0) {
                                onHighlightBottlenecks(result.bottleneckNodeIds);
                                onClose();
                              }
                            }}
                            className="rounded-lg bg-[#D6AD69]/20 px-2.5 py-1 font-mono text-[10px] font-bold text-[#D6AD69] hover:bg-[#D6AD69] hover:text-[#101216] transition-all"
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
