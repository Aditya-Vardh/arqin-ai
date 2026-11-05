import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { checkApiKey } from "@/lib/rate-limit";
import { synthesizeFallbackResearch } from "@/lib/ai/fallback-synthesizer";
import type { ResearchResult } from "@/lib/storage/types";

const MIN_QUESTION_LENGTH = 3;
const MAX_QUESTION_LENGTH = 2000;

function getModel() {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });
  // qwen3.8-27b reliably produces structured JSON
  return groq("qwen/qwen3.8-27b");
}

const SYSTEM = `You are a senior software architect and principal engineer. 
The user will ask any software architecture, technology, or system design question.
You MUST answer any question — even casual ones like "hi" or "what are you" (just answer as an AI architecture assistant).
For architecture questions, be thorough and specific.

Respond ONLY with a valid JSON object. No markdown fences, no extra text before or after.
The JSON must have exactly these fields:
{
  "title": "string — descriptive title for this analysis",
  "summary": "string — 2-3 sentence executive summary",
  "recommendedArchitecture": "string — 3-5 sentences describing the recommended approach with specific technologies",
  "architecturePattern": "string — primary pattern name",
  "technologyRecommendations": [{"category":"string","name":"string","reason":"string"}],
  "scalability": "string — how it scales",
  "performance": "string — performance characteristics",
  "latency": "string — latency profile",
  "reliability": "string — failure handling",
  "security": "string — security considerations",
  "dataStrategy": "string — database and storage strategy",
  "cachingStrategy": "string — caching approach",
  "communicationStrategy": "string — API and messaging strategy",
  "tradeoffs": ["string","string","string"],
  "alternatives": [{"name":"string","description":"string","pros":["string"],"cons":["string"]}],
  "risks": ["string","string","string"],
  "recommendations": ["string","string","string","string"]
}
Be specific. Name real technologies. Do not use placeholder text.`;

function extractJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  // Try direct parse
  if (trimmed.startsWith("{")) {
    try { return JSON.parse(trimmed); } catch {}
  }
  // Strip thinking tags (qwen sometimes wraps in <think>)
  const noThink = trimmed.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  if (noThink.startsWith("{")) {
    try { return JSON.parse(noThink); } catch {}
  }
  // Fence
  const fence = noThink.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence?.[1]) {
    try { return JSON.parse(fence[1].trim()); } catch {}
  }
  // First/last brace
  const start = noThink.indexOf("{");
  const end = noThink.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(noThink.slice(start, end + 1)); } catch {}
  }
  return null;
}

function normalize(raw: Record<string, unknown>, question: string): ResearchResult {
  const str = (v: unknown, fb = ""): string =>
    typeof v === "string" && v.trim() ? v : fb;
  const arr = (v: unknown): unknown[] =>
    Array.isArray(v) ? v : [];
  const strArr = (v: unknown): string[] =>
    arr(v).map(x => typeof x === "string" ? x : typeof x === "object" && x ? Object.values(x as object).filter(s => typeof s === "string").join(" — ") : String(x)).filter(Boolean);

  const techRaw = arr(raw.technologyRecommendations);
  const technologyRecommendations = techRaw.map(t => {
    if (typeof t === "object" && t !== null) {
      const o = t as Record<string, unknown>;
      return {
        category: str(o.category, "Infrastructure"),
        name: str(o.name ?? o.technology ?? o.tool, "Not specified"),
        reason: str(o.reason ?? o.description ?? o.why, "Recommended for this use case."),
      };
    }
    return { category: "Infrastructure", name: String(t), reason: "Recommended." };
  });

  const altRaw = arr(raw.alternatives);
  const alternatives = altRaw.map(a => {
    if (typeof a === "object" && a !== null) {
      const o = a as Record<string, unknown>;
      return {
        name: str(o.name ?? o.title, "Alternative"),
        description: str(o.description ?? o.summary, ""),
        pros: strArr(o.pros),
        cons: strArr(o.cons),
      };
    }
    return { name: String(a), description: "", pros: [], cons: [] };
  });

  // Risks / tradeoffs / recommendations may be strings OR objects
  const asStrArr = (v: unknown): string[] => {
    return arr(v).map(x => {
      if (typeof x === "string") return x;
      if (typeof x === "object" && x !== null) {
        const o = x as Record<string, unknown>;
        const val = o.description ?? o.risk ?? o.tradeoff ?? o.recommendation ?? o.text ?? o.title ?? o.name;
        if (typeof val === "string") return val;
        return Object.values(o).filter(s => typeof s === "string").join(" — ");
      }
      return String(x);
    }).filter(Boolean);
  };

  return {
    title: str(raw.title) || `Analysis: ${question.slice(0, 60)}`,
    summary: str(raw.summary) || str(raw.overview) || str(raw.executive_summary),
    recommendedArchitecture: str(raw.recommendedArchitecture ?? raw.recommended_architecture ?? raw.architecture),
    architecturePattern: str(raw.architecturePattern ?? raw.pattern ?? raw.architecture_pattern, "Layered Architecture"),
    technologyRecommendations,
    scalability: str(raw.scalability),
    performance: str(raw.performance),
    latency: str(raw.latency),
    reliability: str(raw.reliability),
    security: str(raw.security),
    dataStrategy: str(raw.dataStrategy ?? raw.data_strategy),
    cachingStrategy: str(raw.cachingStrategy ?? raw.caching_strategy),
    communicationStrategy: str(raw.communicationStrategy ?? raw.communication_strategy),
    tradeoffs: asStrArr(raw.tradeoffs),
    alternatives,
    risks: asStrArr(raw.risks),
    recommendations: asStrArr(raw.recommendations),
  };
}

export async function POST(req: Request) {
  let question = "";
  try {
    const body = await req.json() as Record<string, unknown>;
    question = typeof body.question === "string" ? body.question.trim() : "";

    if (!question) return Response.json({ success: false, error: "Please enter a question." }, { status: 400 });
    if (question.length > MAX_QUESTION_LENGTH) return Response.json({ success: false, error: "Question too long." }, { status: 400 });
    if (question.length < MIN_QUESTION_LENGTH) return Response.json({ success: false, error: "Please be more specific." }, { status: 400 });

    const apiKey = checkApiKey();
    if (!apiKey) {
      return Response.json({ success: true, data: synthesizeFallbackResearch(question), fallback: true });
    }

    try {
      const model = getModel();
      const { text } = await generateText({
        model,
        system: SYSTEM,
        prompt: question,
        temperature: 0.35,
        maxOutputTokens: 3500,
      });

      const parsed = extractJson(text);
      if (!parsed) {
        console.warn("Research: JSON parse failed, raw length:", text.length);
        return Response.json({ success: true, data: synthesizeFallbackResearch(question), fallback: true });
      }
      return Response.json({ success: true, data: normalize(parsed, question) });

    } catch (err) {
      console.warn("Research AI call failed:", err);
      return Response.json({ success: true, data: synthesizeFallbackResearch(question), fallback: true });
    }

  } catch (err) {
    console.error("Research API error:", err);
    return Response.json({ success: false, error: "Research failed. Please try again." }, { status: 500 });
  }
}
