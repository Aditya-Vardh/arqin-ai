import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { repairMermaid } from "@/lib/mermaid-repair";
import { checkApiKey } from "@/lib/rate-limit";
import { synthesizeFallbackArchitecture } from "@/lib/ai/fallback-synthesizer";
import type { DiagramType, ArchitectureResult } from "@/lib/storage/types";

const MIN_PROMPT_LENGTH = 15;
const VALID_TYPES: DiagramType[] = ["class","sequence","er","flowchart","component","deployment","state","architecture"];

function getModel() {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });
  return groq("qwen/qwen3.8-27b");
}

const DIAGRAM_HINTS: Record<DiagramType, string> = {
  class:        "classDiagram with classes, attributes (typed), methods, and relationships (inheritance <|--,  association -->, composition *--, aggregation o--)",
  sequence:     "sequenceDiagram with autonumber, participant declarations, ->> sync messages, -->> async returns, and activation boxes (+/-)",
  er:           "erDiagram with entities, typed attributes (PK, FK), and cardinality (||--o{, }|--|{, etc.)",
  flowchart:    "flowchart TB with subgraphs for layers, decision diamonds {}, and labeled arrows -->|label|",
  component:    "flowchart TB with subgraphs for components and labeled interface connections",
  deployment:   "flowchart TB with subgraphs for cloud/server environments, nodes inside, and network connections",
  state:        "stateDiagram-v2 with [*] start, state names, transitions with labels, and [*] end",
  architecture: "flowchart TB with subgraphs for each architectural layer (e.g. Client, Gateway, Services, Data), 8-12 nodes",
};

function buildSystemPrompt(diagramType: DiagramType): string {
  return `You are a senior software architect. Generate a complete architecture analysis as a JSON object.
Respond ONLY with valid JSON — no markdown fences, no text before or after.

The mermaidCode field MUST use ${DIAGRAM_HINTS[diagramType]} syntax.
Rules for mermaidCode:
- Valid Mermaid syntax only, no markdown fences, no backticks
- Realistic node/class names matching the described system
- 8-12 nodes/classes for complex diagrams
- All subgraph IDs must be alphanumeric only (no spaces)

JSON structure:
{
  "title": "string",
  "diagramType": "${diagramType}",
  "mermaidCode": "string — complete Mermaid diagram",
  "explanation": {
    "overview": "string",
    "components": [{"name":"string","description":"string"}],
    "dataFlow": "string",
    "technologyChoices": "string",
    "scalability": "string",
    "security": "string",
    "reliability": "string",
    "tradeoffs": "string",
    "improvements": "string"
  },
  "technologies": ["string"],
  "adaptiveInsights": {
    "health": 0-100,
    "healthLabel": "Excellent|Good|Fair|Needs work",
    "scalability": 0-100,
    "maintainability": 0-100,
    "reliability": 0-100,
    "security": 0-100,
    "adaptability": 0-100,
    "potentialIssues": ["string","string"],
    "suggestions": [{"current":"string","suggested":"string","reason":"string","category":"scalability"}]
  }
}`;
}

const REFINE_SYSTEM = `You are a senior software architect. Update the given architecture JSON based on the refinement instruction.
Respond ONLY with valid JSON — same structure as input, no markdown, no extra text.
Preserve the diagramType unless explicitly asked to change it.
The mermaidCode must be valid Mermaid syntax with no markdown fences.`;

function extractJson(text: string): Record<string, unknown> | null {
  // Strip qwen thinking tags
  const clean = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  if (clean.startsWith("{")) { try { return JSON.parse(clean); } catch {} }
  const fence = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence?.[1]) { try { return JSON.parse(fence[1].trim()); } catch {} }
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  if (s !== -1 && e > s) { try { return JSON.parse(clean.slice(s, e + 1)); } catch {} }
  return null;
}

function normalizeResult(raw: Record<string, unknown>, diagramType: DiagramType, idea: string): ArchitectureResult {
  const str = (v: unknown, fb = ""): string => typeof v === "string" && v.trim() ? v : fb;
  const num = (v: unknown, fb = 80): number => typeof v === "number" ? Math.min(100, Math.max(0, Math.round(v))) : fb;
  const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
  const strArr = (v: unknown): string[] => arr(v).map(x => typeof x === "string" ? x : str(x as unknown)).filter(Boolean) as string[];

  const expl = (raw.explanation && typeof raw.explanation === "object") ? raw.explanation as Record<string, unknown> : {};
  const ai = (raw.adaptiveInsights && typeof raw.adaptiveInsights === "object") ? raw.adaptiveInsights as Record<string, unknown> : {};

  const rawType = str(raw.diagramType ?? raw.diagram_type);
  const finalType: DiagramType = VALID_TYPES.includes(rawType as DiagramType) ? rawType as DiagramType : diagramType;

  const mermaid = str(raw.mermaidCode ?? raw.mermaid_code ?? raw.diagram ?? raw.code);

  const components = arr(expl.components ?? raw.components).map(c => {
    if (typeof c === "object" && c !== null) {
      const o = c as Record<string, unknown>;
      return { name: str(o.name, "Component"), description: str(o.description, "") };
    }
    return { name: String(c), description: "" };
  });

  const suggestions = arr(ai.suggestions ?? raw.suggestions).map(s => {
    if (typeof s === "object" && s !== null) {
      const o = s as Record<string, unknown>;
      const cat = str(o.category, "scalability");
      const validCats = ["scalability","maintainability","reliability","security","adaptability"];
      return {
        current: str(o.current, ""),
        suggested: str(o.suggested, ""),
        reason: str(o.reason, ""),
        category: (validCats.includes(cat) ? cat : "scalability") as "scalability"|"maintainability"|"reliability"|"security"|"adaptability",
      };
    }
    return { current: "", suggested: String(s), reason: "", category: "scalability" as const };
  });

  return {
    title: str(raw.title) || idea.slice(0, 60),
    diagramType: finalType,
    mermaidCode: mermaid ? repairMermaid(mermaid, finalType) : repairMermaid("", finalType),
    explanation: {
      overview: str(expl.overview ?? raw.overview, `Architecture for: ${idea}`),
      components: components.length ? components : [{ name: "Service", description: "Core service" }],
      dataFlow: str(expl.dataFlow ?? expl.data_flow ?? raw.dataFlow),
      technologyChoices: str(expl.technologyChoices ?? expl.technology_choices ?? raw.technologyChoices),
      scalability: str(expl.scalability ?? raw.scalability),
      security: str(expl.security ?? raw.security),
      reliability: str(expl.reliability ?? raw.reliability),
      tradeoffs: str(expl.tradeoffs ?? raw.tradeoffs),
      improvements: str(expl.improvements ?? raw.improvements),
    },
    technologies: strArr(raw.technologies ?? expl.technologies),
    adaptiveInsights: {
      health: num(ai.health ?? raw.health),
      healthLabel: str(ai.healthLabel ?? raw.healthLabel, "Good"),
      scalability: num(ai.scalability),
      maintainability: num(ai.maintainability),
      reliability: num(ai.reliability),
      security: num(ai.security),
      adaptability: num(ai.adaptability),
      potentialIssues: strArr(ai.potentialIssues ?? raw.potentialIssues),
      suggestions,
    },
  };
}

export async function POST(req: Request) {
  let diagramType: DiagramType = "architecture";
  let idea = "";

  try {
    const body = await req.json() as Record<string, unknown>;
    idea = typeof body.idea === "string" ? body.idea.trim() : "";
    const refine = typeof body.refineInstruction === "string" ? body.refineInstruction.trim() : "";
    const currentArch = body.currentArchitecture;
    const rawType = typeof body.diagramType === "string" ? body.diagramType : "architecture";
    diagramType = VALID_TYPES.includes(rawType as DiagramType) ? rawType as DiagramType : "architecture";

    // ── Refine mode ──────────────────────────────────────────────────────
    if (refine && currentArch) {
      const apiKey = checkApiKey();
      if (!apiKey) return Response.json(synthesizeFallbackArchitecture(refine, diagramType));
      try {
        const { text } = await generateText({
          model: getModel(),
          system: REFINE_SYSTEM,
          prompt: `Current architecture:\n${JSON.stringify(currentArch, null, 2)}\n\nRefinement instruction:\n${refine}`,
          temperature: 0.3,
          maxOutputTokens: 3000,
        });
        const parsed = extractJson(text);
        if (!parsed) return Response.json(synthesizeFallbackArchitecture(refine, diagramType));
        return Response.json(normalizeResult(parsed, diagramType, refine));
      } catch (err) {
        console.warn("AI refine failed:", err);
        return Response.json(synthesizeFallbackArchitecture(refine, diagramType));
      }
    }

    // ── Generate mode ─────────────────────────────────────────────────────
    if (!idea) return Response.json({ error: "Please describe your system." }, { status: 400 });
    if (idea.length < MIN_PROMPT_LENGTH) return Response.json({ error: "Please add more detail." }, { status: 400 });

    const apiKey = checkApiKey();
    if (!apiKey) return Response.json(synthesizeFallbackArchitecture(idea, diagramType));

    try {
      const { text } = await generateText({
        model: getModel(),
        system: buildSystemPrompt(diagramType),
        prompt: idea,
        temperature: 0.4,
        maxOutputTokens: 3500,
      });
      const parsed = extractJson(text);
      if (!parsed) {
        console.warn("Generate: JSON parse failed, raw length:", text.length);
        return Response.json(synthesizeFallbackArchitecture(idea, diagramType));
      }
      return Response.json(normalizeResult(parsed, diagramType, idea));
    } catch (aiErr) {
      console.warn("AI generate failed:", aiErr);
      return Response.json(synthesizeFallbackArchitecture(idea, diagramType));
    }

  } catch (err) {
    console.error("Generate API error:", err);
    return Response.json(synthesizeFallbackArchitecture(idea || "Software Architecture", diagramType));
  }
}
