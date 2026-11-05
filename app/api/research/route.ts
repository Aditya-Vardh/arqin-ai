import { generateObject } from "ai";
import { model } from "@/lib/ai/models";
import { researchSchema } from "@/lib/ai/schema";
import { RESEARCH_PROMPT } from "@/lib/ai/prompt";
import { checkApiKey } from "@/lib/rate-limit";
import { synthesizeFallbackResearch } from "@/lib/ai/fallback-synthesizer";

const MIN_QUESTION_LENGTH = 10;
const MAX_QUESTION_LENGTH = 2000;

export async function POST(req: Request) {
  let question = "";

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null) {
      return Response.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    const bodyObj = body as Record<string, unknown>;
    question = typeof bodyObj.question === "string" ? bodyObj.question.trim() : "";

    if (!question) {
      return Response.json(
        { success: false, error: "Please enter an architecture research question." },
        { status: 400 },
      );
    }

    if (question.length < MIN_QUESTION_LENGTH) {
      return Response.json(
        { success: false, error: "Please provide a more detailed question (at least 10 characters)." },
        { status: 400 },
      );
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return Response.json(
        { success: false, error: "Question is too long. Please keep it under 2000 characters." },
        { status: 400 },
      );
    }

    const apiKey = checkApiKey();
    if (!apiKey) {
      console.warn("GROQ_API_KEY is not configured — using fallback research synthesizer.");
      const fallback = synthesizeFallbackResearch(question);
      return Response.json({ success: true, data: fallback, fallback: true });
    }

    try {
      const { object } = await generateObject({
        model,
        schema: researchSchema,
        system: RESEARCH_PROMPT,
        prompt: question,
      });

      return Response.json({ success: true, data: object });
    } catch (aiErr) {
      console.warn("Research AI call failed, using fallback:", aiErr);
      const fallback = synthesizeFallbackResearch(question);
      return Response.json({ success: true, data: fallback, fallback: true });
    }
  } catch (error) {
    console.error("Research API unexpected error:", error);
    return Response.json(
      { success: false, error: "Research could not be completed right now. Please try again." },
      { status: 500 },
    );
  }
}
