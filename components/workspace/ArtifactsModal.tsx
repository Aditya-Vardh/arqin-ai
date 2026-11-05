"use client";

import { useState } from "react";
import { X, Code2, Download, Copy, Check, FileText } from "lucide-react";
import type { ArchitectureGraph } from "@/lib/graph/types";
import { generateImplementationArtifacts, type ArtifactFile } from "@/lib/artifacts/generator";

type Props = {
  graph: ArchitectureGraph;
  onClose: () => void;
};

export default function ArtifactsModal({ graph, onClose }: Props) {
  const artifacts = generateImplementationArtifacts(graph);
  const [selectedFilename, setSelectedFilename] = useState<string>(artifacts[0]?.filename || "docker-compose.yml");
  const [copied, setCopied] = useState(false);

  const selectedFile = artifacts.find((a) => a.filename === selectedFilename) || artifacts[0];

  function handleCopy() {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl animate-fade-in">
      <div className="flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#D6AD69]/20 bg-[#101216] text-[#F0F1F3] shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D6AD69]/15 bg-[#101216] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D6AD69] via-[#D6AD69] to-[#A08050] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#101216]">
                <Code2 className="h-5 w-5 text-[#D6AD69]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F0F1F3]">Generated Implementation Artifacts</h2>
              <p className="text-xs text-[#A4AAB5]">Production-ready code, deployment manifests, OpenAPI specs, and database DDL derived from graph.</p>
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
        <div className="grid flex-1 grid-cols-1 md:grid-cols-4 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#D6AD69]/15">
          {/* File Selector Sidebar */}
          <div className="p-4 bg-[#101216] space-y-2 overflow-y-auto">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4A5060] mb-3 px-2">Artifact Files</p>
            {artifacts.map((file) => (
              <button
                key={file.filename}
                type="button"
                onClick={() => setSelectedFilename(file.filename)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                  selectedFilename === file.filename
                    ? "border border-[#D6AD69]/30 bg-[#D6AD69]/10 text-[#D6AD69]"
                    : "border border-transparent hover:bg-[#101216] text-[#A4AAB5]"
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold truncate">{file.filename}</p>
                  <p className="text-[10px] text-[#4A5060] truncate">{file.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="md:col-span-3 flex flex-col min-h-0 bg-[#0C0E12]">
            <div className="flex items-center justify-between border-b border-[#D6AD69]/10 bg-[#101216] px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#F0F1F3]">{selectedFile.filename}</span>
                <span className="rounded bg-[#D6AD69]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#D6AD69]">{selectedFile.language}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-[#D6AD69]/15 bg-[#0C0E12] px-3 py-1.5 text-xs font-bold text-[#A4AAB5] hover:text-[#F0F1F3] transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#D6AD69]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg bg-[#D6AD69] px-3 py-1.5 text-xs font-bold text-[#101216] hover:bg-[#D6AD69]/90 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <pre className="font-mono text-xs leading-relaxed text-[#A4AAB5] whitespace-pre-wrap select-all">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
