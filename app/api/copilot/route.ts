import { generateText } from "ai";
import { model } from "@/lib/ai/models";
import { checkApiKey } from "@/lib/rate-limit";
import { isModificationRequest } from "@/lib/ai/intentClassifier";
import type { ArchitectureResult } from "@/lib/storage/types";

const COPILOT_CHAT_SYSTEM = `You are an architecture analyst. Answer questions about the provided architecture. Do NOT output architecture modifications or structured data. Respond with clear, concise natural language only.`;

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      message: string;
      architecture?: ArchitectureResult | null;
    };

    const { message, architecture } = body;

    if (!message?.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    // --- Intent classification ---
    if (isModificationRequest(message)) {
      // Modification intent: propose but do NOT apply — architecture is unchanged
      return Response.json({
        type: "proposal",
        text: `Here is what I propose: I will ${message.trim()}. This will update the diagram, components, and save a new history version. Click Apply to proceed or Cancel to keep the current architecture unchanged.`,
        proposedChanges: { description: message.trim() },
      });
    }

    // --- Chat / analysis intent ---
    // Build architecture context string
    let context = "";
    if (architecture) {
      context += `Architecture title: ${architecture.title}`;
      context += `\nDiagram type: ${architecture.diagramType}`;
      if (architecture.explanation?.overview) {
        context += `\nOverview: ${architecture.explanation.overview}`;
      }
      if (architecture.explanation?.components?.length) {
        context += "\nComponents:";
        for (const c of architecture.explanation.components) {
          context += `\n- ${c.name}: ${c.description}`;
        }
      }
      if (architecture.technologies?.length) {
        context += `\nTechnologies: ${architecture.technologies.join(", ")}`;
      }
      if (architecture.explanation?.dataFlow) {
        context += `\nData flow: ${architecture.explanation.dataFlow}`;
      }
      if (architecture.mermaidCode) {
        context += `\nDiagram source:\n${architecture.mermaidCode}`;
      }
    }

    const apiKey = checkApiKey();

    if (!apiKey) {
      const fallbackText = buildFallbackAnswer(message, architecture);
      return Response.json({ type: "answer", text: fallbackText });
    }

    try {
      const { text } = await generateText({
        model,
        system: COPILOT_CHAT_SYSTEM,
        prompt: context
          ? `Architecture context:\n${context}\n\nUser question: ${message}`
          : message,
        maxOutputTokens: 800,
      });

      return Response.json({ type: "answer", text });
    } catch (aiErr) {
      console.warn("Copilot AI call failed, using fallback:", aiErr);
      const fallbackText = buildFallbackAnswer(message, architecture);
      return Response.json({ type: "answer", text: fallbackText });
    }
  } catch (error) {
    console.error("Copilot API error:", error);
    return Response.json(
      { error: "Could not process your message. Please try again." },
      { status: 500 },
    );
  }
}

function buildFallbackAnswer(
  question: string,
  architecture?: ArchitectureResult | null,
): string {
  const q = question.toLowerCase();

  if (!architecture) {
    return "No architecture is currently loaded. Generate an architecture first, then I can answer questions about it.";
  }

  const title = architecture.title || "this architecture";
  const components = architecture.explanation?.components || [];

  if (q.includes("what is") || q.includes("explain") || q.includes("describe") || q.includes("overview")) {
    return `**${title}**\n\n${architecture.explanation?.overview || "No overview available."}\n\nComponents: ${components.map((c) => c.name).join(", ") || "None listed"}.`;
  }

  if (q.includes("security") || q.includes("risk") || q.includes("vulnerabilit") || q.includes("weakness")) {
    const securityNotes = architecture.explanation?.security;
    const issues = architecture.adaptiveInsights?.potentialIssues || [];
    let answer = `**Security analysis for ${title}:**\n\n`;
    if (securityNotes) answer += securityNotes + "\n\n";
    if (issues.length) answer += "Potential issues:\n" + issues.map((i) => `• ${i}`).join("\n");
    return answer || "No specific security analysis available for this architecture.";
  }

  if (q.includes("scal") || q.includes("performance") || q.includes("bottleneck") || q.includes("load")) {
    const scalability = architecture.explanation?.scalability;
    return scalability
      ? `**Scalability for ${title}:**\n\n${scalability}`
      : `The architecture uses ${architecture.technologies?.join(", ") || "standard components"}. Review the Inspector tab for detailed scalability analysis.`;
  }

  if (q.includes("data flow") || q.includes("how does") || q.includes("how do")) {
    const dataFlow = architecture.explanation?.dataFlow;
    return dataFlow
      ? `**Data flow for ${title}:**\n\n${dataFlow}`
      : `The components in ${title} interact through standard request/response and event-driven patterns.`;
  }

  return `I can answer questions about **${title}**. This architecture includes: ${components.map((c) => c.name).join(", ") || "various components"}.\n\nAsk me about specific components, security concerns, scalability, or how data flows through the system.`;
}
