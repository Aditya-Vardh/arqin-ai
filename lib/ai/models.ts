import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

// openai/gpt-oss-120b: 500 T/s, available on Groq developer plan
// Higher quality structured output for architecture generation
export const model = groq("openai/gpt-oss-120b");
